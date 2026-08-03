import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Clock,
  Layers,
  ArrowRight,
  BookmarkPlus,
  Upload,
  Link,
  Code,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ChevronRight,
  Paperclip,
  Maximize2,
  Minimize2,
  Highlighter,
  HelpCircle,
  FileCheck,
  Edit3,
  List,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import { Workspace, ResourceItem, NoteItem, ExtractedImage, VideoTimestamp } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ActiveTabReaderProps {
  workspace: Workspace;
  onAddResource: (resource: ResourceItem) => void;
  onSaveGeneratedNote: (note: NoteItem, shouldAppend: boolean, targetNoteId?: string) => void;
  onAddConcept: (name: string, definition: string, category: string) => void;
}

export const ActiveTabReader: React.FC<ActiveTabReaderProps> = ({
  workspace,
  onAddResource,
  onSaveGeneratedNote,
  onAddConcept,
}) => {
  const [activeResourceId, setActiveResourceId] = useState<string>(
    workspace.resources[0]?.id || ''
  );

  // Reader Settings
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [depthLevel, setDepthLevel] = useState<'standard' | 'comprehensive' | 'exhaustive'>('comprehensive');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // New Resource Modal State
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'article' | 'video' | 'image' | 'code'>('article');
  const [newUrl, setNewUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // AI Processing State
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [selectedTargetNoteId, setSelectedTargetNoteId] = useState<string>('');
  const [isAppendingMode, setIsAppendingMode] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Note Customization State
  const [editableNoteTitle, setEditableNoteTitle] = useState('');
  const [editableNoteContent, setEditableNoteContent] = useState('');
  const [selectedConceptsToSave, setSelectedConceptsToSave] = useState<string[]>([]);
  const [isEditingNoteRaw, setIsEditingNoteRaw] = useState(false);

  // Highlight Text Selection State
  const [selectedText, setSelectedText] = useState('');
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const readerContentRef = useRef<HTMLDivElement>(null);

  // Image Upload / Snapshot state
  const [snapshotCaption, setSnapshotCaption] = useState('');
  const [snapshotImageBase64, setSnapshotImageBase64] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Video Timestamp State
  const [newTimestampTime, setNewTimestampTime] = useState('');
  const [newTimestampLabel, setNewTimestampLabel] = useState('');
  const [newTimestampNote, setNewTimestampNote] = useState('');

  const activeResource = workspace.resources.find((r) => r.id === activeResourceId) || workspace.resources[0];

  // Helper: Extract TOC headers from active material content
  const extractTOC = (text?: string) => {
    if (!text) return [];
    const lines = text.split('\n');
    const headers: { level: number; text: string }[] = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)/);
      if (match) {
        headers.push({ level: match[1].length, text: match[2].trim() });
      }
    });
    return headers;
  };

  const tocHeaders = extractTOC(activeResource?.content);

  // Text Selection Handler in Reader Area
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      // Check if selection inside reader container
      if (readerContentRef.current && readerContentRef.current.contains(selection.anchorNode)) {
        setSelectedText(selection.toString().trim());
        return;
      }
    }
  };

  // 1. Handle Single Tab AI Note Processing
  const handleProcessActiveTab = async () => {
    if (!activeResource) return;
    setIsProcessingAI(true);
    setAiResult(null);
    setSaveSuccessMessage('');

    try {
      const response = await fetch('/api/ai/process-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeResource.title,
          content: activeResource.content || `Type: ${activeResource.type}, Source: ${activeResource.source}`,
          type: activeResource.type,
          workspaceName: workspace.name,
          existingNotesTitles: workspace.notes.map((n) => n.title),
          depthLevel,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setAiResult(data.result);
        setEditableNoteTitle(data.result.recommendedTitle || activeResource.title);
        setEditableNoteContent(data.result.markdownNotes || '');
        if (data.result.concepts && Array.isArray(data.result.concepts)) {
          setSelectedConceptsToSave(data.result.concepts.map((c: any) => c.name));
        }
        if (data.result.shouldAppend && data.result.targetAppendNoteTitle) {
          const matchNote = workspace.notes.find(
            (n) => n.title.toLowerCase().includes(data.result.targetAppendNoteTitle.toLowerCase())
          );
          if (matchNote) {
            setSelectedTargetNoteId(matchNote.id);
            setIsAppendingMode(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to process with AI:', err);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // 1b. Handle Batch Processing of ALL Workspace Materials
  const handleBatchProcessWorkspace = async () => {
    if (workspace.resources.length === 0) return;
    setIsBatchProcessing(true);
    setAiResult(null);
    setSaveSuccessMessage('');

    try {
      const response = await fetch('/api/ai/batch-process-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName: workspace.name,
          materials: workspace.resources,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setAiResult(data.result);
        setEditableNoteTitle(data.result.recommendedTitle || `Master Notes: ${workspace.name}`);
        setEditableNoteContent(data.result.markdownNotes || '');
        if (data.result.concepts && Array.isArray(data.result.concepts)) {
          setSelectedConceptsToSave(data.result.concepts.map((c: any) => c.name));
        }
      }
    } catch (err) {
      console.error('Failed batch processing:', err);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // 1c. Handle Text Selection AI Note Action
  const handleProcessSelectionAction = async (actionType: 'make_note' | 'explain' | 'simplify') => {
    if (!selectedText) return;
    setIsProcessingSelection(true);
    setSaveSuccessMessage('');

    try {
      const response = await fetch('/api/ai/selection-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText,
          contextTitle: activeResource?.title || 'Reading Material',
          workspaceName: workspace.name,
          actionType,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setAiResult({
          recommendedTitle: data.result.title,
          summary: data.result.summary,
          markdownNotes: data.result.markdownNotes,
          keyTakeaways: data.result.keyTakeaways,
          concepts: [],
        });
        setEditableNoteTitle(data.result.title);
        setEditableNoteContent(data.result.markdownNotes);
        setSelectedText('');
      }
    } catch (err) {
      console.error('Failed selection note:', err);
    } finally {
      setIsProcessingSelection(false);
    }
  };

  // 2. Handle Image Snapshot Analysis
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSnapshotImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImageSnapshot = async () => {
    if (!snapshotImageBase64) return;
    setIsAnalyzingImage(true);
    try {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: snapshotImageBase64,
          caption: snapshotCaption || 'Diagram snapshot from active reading',
          workspaceName: workspace.name,
        }),
      });
      const data = await response.json();
      if (data.success && data.result) {
        const newExtractedImg: ExtractedImage = {
          id: `img-${Date.now()}`,
          caption: data.result.title || snapshotCaption || 'Captured Diagram',
          dataUrl: snapshotImageBase64,
          sourceRef: activeResource ? activeResource.title : 'Active Tab Snapshot',
        };

        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          workspaceId: workspace.id,
          title: `[Diagram] ${data.result.title || 'Captured Image Snapshot'}`,
          summary: data.result.explanation || 'Visual diagram snapshot extracted by AI Agent.',
          content: data.result.markdownNotes || '',
          keyTakeaways: data.result.extractedConcepts || [],
          linkedResourceIds: activeResource ? [activeResource.id] : [],
          linkedConceptIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: [newExtractedImg],
        };

        onSaveGeneratedNote(newNote, false);
        setSaveSuccessMessage('Saved diagram snapshot and extracted notes to Knowledge Base!');
        setSnapshotImageBase64('');
        setSnapshotCaption('');
      }
    } catch (err) {
      console.error('Image analysis failed:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // 3. Save AI Notes
  const handleConfirmSaveNote = async () => {
    if (!aiResult) return;

    const finalTitle = editableNoteTitle || aiResult.recommendedTitle || 'Study Notes';
    const finalContent = editableNoteContent || aiResult.markdownNotes || '';

    if (isAppendingMode && selectedTargetNoteId) {
      // Append to existing note using backend synthesis
      const targetNote = workspace.notes.find((n) => n.id === selectedTargetNoteId);
      if (targetNote) {
        try {
          const res = await fetch('/api/ai/append-note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              existingNoteTitle: targetNote.title,
              existingContent: targetNote.content,
              newMaterialTitle: activeResource?.title || finalTitle,
              newContent: finalContent,
            }),
          });
          const data = await res.json();
          if (data.success && data.result) {
            const updatedNote: NoteItem = {
              ...targetNote,
              content: data.result.updatedContent,
              keyTakeaways: Array.from(
                new Set([...targetNote.keyTakeaways, ...(data.result.combinedKeyTakeaways || [])])
              ),
              history: [
                ...(targetNote.history || []),
                {
                  id: `hist-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  addedContent: aiResult.summary,
                  sourceTitle: activeResource?.title || 'Active Material',
                  reason: data.result.appendReason || 'Appended new reading insights.',
                },
              ],
              updatedAt: new Date().toISOString(),
            };

            onSaveGeneratedNote(updatedNote, true, targetNote.id);
            setSaveSuccessMessage(`Appended new insights into "${targetNote.title}"!`);
          }
        } catch (err) {
          console.error('Append failed:', err);
        }
      }
    } else {
      // Create New Note Entry
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        workspaceId: workspace.id,
        title: finalTitle,
        summary: aiResult.summary || '',
        content: finalContent,
        keyTakeaways: aiResult.keyTakeaways || [],
        linkedResourceIds: activeResource ? [activeResource.id] : [],
        linkedConceptIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add checked concepts to workspace graph
      if (aiResult.concepts && Array.isArray(aiResult.concepts)) {
        aiResult.concepts.forEach((c: any) => {
          if (selectedConceptsToSave.includes(c.name)) {
            onAddConcept(c.name, c.definition, c.category || 'General');
          }
        });
      }

      onSaveGeneratedNote(newNote, false);
      setSaveSuccessMessage('Created new note entry in Knowledge Base!');
    }

    setAiResult(null);
  };

  // 4. Create New Resource
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRes: ResourceItem = {
      id: `res-${Date.now()}`,
      workspaceId: workspace.id,
      title: newTitle.trim(),
      type: newType,
      url: newUrl.trim() || undefined,
      content: newContent.trim() || undefined,
      source: newUrl.trim() ? 'Web Link / Video' : 'User Added Document',
      capturedAt: new Date().toISOString(),
      tags: newTags ? newTags.split(',').map((t) => t.trim()) : ['Reading'],
    };

    onAddResource(newRes);
    setActiveResourceId(newRes.id);
    setIsAddingResource(false);
    setNewTitle('');
    setNewUrl('');
    setNewContent('');
    setNewTags('');
  };

  // 5. Add Video Timestamp
  const handleAddTimestamp = () => {
    if (!activeResource || !newTimestampTime || !newTimestampLabel) return;
    const timeParts = newTimestampTime.split(':');
    let totalSec = 0;
    if (timeParts.length === 2) {
      totalSec = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    } else if (timeParts.length === 3) {
      totalSec = parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]);
    }

    const newStamp: VideoTimestamp = {
      time: newTimestampTime,
      seconds: totalSec,
      label: newTimestampLabel,
      note: newTimestampNote,
    };

    const updatedResource: ResourceItem = {
      ...activeResource,
      timestamps: [...(activeResource.timestamps || []), newStamp],
    };

    onAddResource(updatedResource);
    setNewTimestampTime('');
    setNewTimestampLabel('');
    setNewTimestampNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg flex flex-col gap-4">
        
        {/* Row 1: Open Materials / Tabs Carousel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Open Reading Tabs:
            </span>

            {workspace.resources.map((res) => {
              const isActive = res.id === activeResource?.id;
              return (
                <button
                  key={res.id}
                  onClick={() => {
                    setActiveResourceId(res.id);
                    setAiResult(null);
                    setSaveSuccessMessage('');
                    setSelectedText('');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 ${
                    isActive
                      ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200 shadow-md font-semibold backdrop-blur-md ring-1 ring-indigo-400/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {res.type === 'video' ? (
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                  ) : res.type === 'image' ? (
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  ) : res.type === 'code' ? (
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="max-w-[140px] truncate">{res.title}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsAddingResource(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Material
            </button>
          </div>

          {/* Reader Controls: Font size & Focus Mode */}
          <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[11px] text-slate-400 font-medium">Font:</span>
            <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded font-mono ${fontSize === 'sm' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded font-mono ${fontSize === 'base' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded font-mono ${fontSize === 'lg' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                isFocusMode
                  ? 'bg-indigo-600 text-white border-indigo-400/50'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
              title={isFocusMode ? 'Exit Focus Reading View' : 'Enter Focus Reading View'}
            >
              {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFocusMode ? 'Normal View' : 'Focus Mode'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: AI Generator Action Hub */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-white/10">
          
          {/* Detail Depth Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Note Detail Level:
            </span>
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
              {(['standard', 'comprehensive', 'exhaustive'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDepthLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all ${
                    depthLevel === lvl
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Generator Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Batch Master Generator across ALL materials */}
            <button
              onClick={handleBatchProcessWorkspace}
              disabled={isBatchProcessing || workspace.resources.length === 0}
              className="px-3 py-2 bg-purple-600/80 hover:bg-purple-500 text-white rounded-xl font-medium text-xs shadow-md border border-purple-400/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
              title="Generate a consolidated master study guide covering all reading materials in workspace"
            >
              {isBatchProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5 text-purple-200" />
              )}
              <span>Synthesize All ({workspace.resources.length}) Materials</span>
            </button>

            {/* Read Current Active Tab Button */}
            <button
              id="ai-read-current-tab-btn"
              onClick={handleProcessActiveTab}
              disabled={isProcessingAI || !activeResource}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 border border-indigo-400/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isProcessingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Deep Notes...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  Read Tab & Extract Notes
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {saveSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-300 flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Main Reading Workspace Grid (Split Screen / Focus Mode) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Material Reader */}
        <div className={isFocusMode ? 'lg:col-span-12 space-y-6' : 'lg:col-span-8 space-y-6'}>
          {activeResource ? (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
              
              {/* Material Title Bar */}
              <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {activeResource.type}
                    </span>
                    <span className="text-xs text-slate-400">Source: {activeResource.source}</span>
                    {activeResource.readTimeMinutes && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeResource.readTimeMinutes} min read
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{activeResource.title}</h1>
                </div>

                {activeResource.url && (
                  <a
                    href={activeResource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 shrink-0 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Open Source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Text Highlight Floating Action Toolbar */}
              {selectedText && (
                <div className="mx-6 mt-4 p-3 bg-indigo-900/90 border border-indigo-400/40 rounded-xl shadow-2xl backdrop-blur-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Highlighter className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate max-w-xs text-indigo-200">
                      Highlighted Excerpt: "{selectedText.substring(0, 45)}..."
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => handleProcessSelectionAction('make_note')}
                      disabled={isProcessingSelection}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      {isProcessingSelection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Create Snippet Note
                    </button>
                    <button
                      onClick={() => handleProcessSelectionAction('explain')}
                      disabled={isProcessingSelection}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      Explain Selection
                    </button>
                    <button
                      onClick={() => setSelectedText('')}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Table of Contents Mini Bar */}
              {tocHeaders.length > 0 && (
                <div className="mx-6 mt-4 p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <List className="w-3.5 h-3.5 text-indigo-400" /> Article Outline & Structure:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {tocHeaders.map((h, i) => (
                      <span key={i} className="text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono text-[11px]">
                        {h.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Content Body */}
              <div
                ref={readerContentRef}
                onMouseUp={handleTextSelection}
                className="p-6 space-y-6"
              >
                
                {/* VIDEO TYPE VIEWER */}
                {activeResource.type === 'video' && (
                  <div className="space-y-4">
                    {/* Simulated Embedded Video Player */}
                    <div className="aspect-video bg-slate-950/80 rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden group border border-white/10 shadow-2xl">
                      <Video className="w-16 h-16 text-indigo-400 mb-2 opacity-80" />
                      <p className="text-sm font-semibold">{activeResource.title}</p>
                      <p className="text-xs text-slate-400 mt-1">Interactive Video Reader Tab Active</p>
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                        <span>▶ Playing YouTube Video Simulation</span>
                        <button
                          onClick={handleProcessActiveTab}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Capture Video Notes
                        </button>
                      </div>
                    </div>

                    {/* Timecoded Key Concepts */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-400" /> Video Timestamps & Chapter Breakdown
                      </h3>

                      <div className="space-y-2">
                        {(activeResource.timestamps || []).map((ts, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors flex items-start gap-3"
                          >
                            <span className="font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md shrink-0">
                              {ts.time}
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-slate-100">{ts.label}</div>
                              <p className="text-xs text-slate-400 mt-0.5">{ts.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Timestamp Control */}
                      <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <span className="text-xs font-semibold text-slate-300">Add Timestamp Marker</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Time (e.g., 05:30)"
                            value={newTimestampTime}
                            onChange={(e) => setNewTimestampTime(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white/5 border border-white/15 rounded-lg text-slate-100 placeholder-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Label / Chapter Title"
                            value={newTimestampLabel}
                            onChange={(e) => setNewTimestampLabel(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white/5 border border-white/15 rounded-lg text-slate-100 placeholder-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Brief note..."
                            value={newTimestampNote}
                            onChange={(e) => setNewTimestampNote(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white/5 border border-white/15 rounded-lg text-slate-100 placeholder-slate-400"
                          />
                        </div>
                        <button
                          onClick={handleAddTimestamp}
                          disabled={!newTimestampTime || !newTimestampLabel}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                        >
                          + Save Timestamp Marker
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENT / ARTICLE / CODE TYPE VIEWER WITH FONT CONTROL */}
                {activeResource.type !== 'video' && activeResource.content && (
                  <div className={`bg-white/5 p-6 rounded-xl border border-white/10 text-slate-200 leading-relaxed font-sans ${
                    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                  }`}>
                    <MarkdownRenderer content={activeResource.content} />
                  </div>
                )}

                {/* Extracted Diagram & Image Snapshots Section */}
                {activeResource.extractedImages && activeResource.extractedImages.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-400" /> Captured Figures & Diagrams ({activeResource.extractedImages.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeResource.extractedImages.map((img) => (
                        <div key={img.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                          <img src={img.dataUrl} alt={img.caption} className="w-full h-40 object-cover" />
                          <div className="p-3">
                            <p className="text-xs font-medium text-slate-200">{img.caption}</p>
                            {img.sourceRef && <p className="text-[10px] text-slate-400 mt-1">{img.sourceRef}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instant Image Snapshot Capture Box */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-300" />
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                        Capture Diagram Snapshot for Multimodal AI Analysis
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Upload a diagram screenshot, architecture flow, code snippet picture, or textbook page to extract structured visual notes.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-indigo-200 hover:file:bg-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Caption / context (e.g. Signal Flow Diagram)"
                      value={snapshotCaption}
                      onChange={(e) => setSnapshotCaption(e.target.value)}
                      className="flex-1 w-full px-3 py-1.5 text-xs bg-white/5 border border-white/15 rounded-lg text-slate-100 placeholder-slate-400"
                    />
                    <button
                      onClick={handleAnalyzeImageSnapshot}
                      disabled={!snapshotImageBase64 || isAnalyzingImage}
                      className="w-full sm:w-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {isAnalyzingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Extract Visual Notes
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10 space-y-3 backdrop-blur-md">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">No Open Materials in this Workspace</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add an article, document, code file, or YouTube video to start active reading and note generation.
              </p>
              <button
                onClick={() => setIsAddingResource(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
              >
                + Add First Reading Material
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive AI Note Workbench & Preview */}
        {!isFocusMode && (
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Output Card */}
            {aiResult ? (
              <div className="bg-white/5 rounded-2xl border border-indigo-400/30 shadow-xl p-5 space-y-4 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-300 text-slate-100">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Synthesized Note Preview
                  </span>
                  <button
                    onClick={() => setIsEditingNoteRaw(!isEditingNoteRaw)}
                    className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10"
                  >
                    <Edit3 className="w-3 h-3" /> {isEditingNoteRaw ? 'View Formatted' : 'Edit Markdown'}
                  </button>
                </div>

                {/* Note Title Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    value={editableNoteTitle}
                    onChange={(e) => setEditableNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-sm font-bold text-white"
                  />
                  <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">{aiResult.summary}</p>
                </div>

                {/* Markdown Note Content (Editable or Rendered) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Synthesized Note Content
                  </label>
                  {isEditingNoteRaw ? (
                    <textarea
                      rows={10}
                      value={editableNoteContent}
                      onChange={(e) => setEditableNoteContent(e.target.value)}
                      className="w-full p-3 bg-slate-950/80 border border-white/15 rounded-xl text-xs font-mono text-slate-200"
                    />
                  ) : (
                    <div className="max-h-60 overflow-y-auto bg-slate-950/40 p-3 rounded-xl border border-white/10 text-xs">
                      <MarkdownRenderer content={editableNoteContent || aiResult.markdownNotes} />
                    </div>
                  )}
                </div>

                {/* Key Takeaways */}
                {aiResult.keyTakeaways && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Key Takeaways:</span>
                    <ul className="space-y-1">
                      {aiResult.keyTakeaways.map((kt: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{kt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concept Graph Node Selection */}
                {aiResult.concepts && aiResult.concepts.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Add to Knowledge Graph:
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {aiResult.concepts.map((c: any, i: number) => {
                        const isChecked = selectedConceptsToSave.includes(c.name);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedConceptsToSave(selectedConceptsToSave.filter((name) => name !== c.name));
                              } else {
                                setSelectedConceptsToSave([...selectedConceptsToSave, c.name]);
                              }
                            }}
                            className={`w-full text-left text-xs p-2 rounded-lg border flex items-center justify-between transition-colors ${
                              isChecked ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200' : 'bg-white/5 border-white/10 text-slate-400'
                            }`}
                          >
                            <div>
                              <strong className="text-slate-100">{c.name}</strong>
                              <span className="text-[10px] text-slate-400 block truncate max-w-xs">{c.definition}</span>
                            </div>
                            {isChecked ? <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mode Selection: Create New vs Append into Existing Note */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-xl border border-white/10">
                    <button
                      onClick={() => setIsAppendingMode(false)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        !isAppendingMode ? 'bg-indigo-600 text-white shadow-2xs border border-white/20' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Create New Note
                    </button>
                    <button
                      onClick={() => setIsAppendingMode(true)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isAppendingMode ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Append to Existing
                    </button>
                  </div>

                  {isAppendingMode && (
                    <div className="space-y-2 animate-in fade-in">
                      <label className="block text-xs font-semibold text-slate-300">
                        Select Knowledge Base Entry to Append Into:
                      </label>
                      <select
                        value={selectedTargetNoteId}
                        onChange={(e) => setSelectedTargetNoteId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-slate-100"
                      >
                        <option value="">-- Choose Existing Note --</option>
                        {workspace.notes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.title}
                          </option>
                        ))}
                      </select>
                      {aiResult.appendReason && (
                        <p className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-lg">
                          💡 AI Recommendation: {aiResult.appendReason}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setAiResult(null)}
                      className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      id="confirm-commit-note-btn"
                      onClick={handleConfirmSaveNote}
                      disabled={isAppendingMode && !selectedTargetNoteId}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      {isAppendingMode ? 'Append Insights' : 'Commit Note'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle Assistant Guide Box */
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">Multimodal Learning Agent</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Read through documents or watch videos here. Click <strong className="text-indigo-300">"Read Tab & Extract Notes"</strong> or highlight any text excerpt to create targeted study notes.
                </p>

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Exhaustive Note Extraction:</strong> Set detail level to Exhaustive for complete academic notes.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Batch Synthesis:</strong> Synthesize all {workspace.resources.length} workspace materials into one Master Study Guide.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Highlight Excerpt:</strong> Select text in reader to generate instant section notes.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace Quick Stats Widget */}
            <div className="bg-slate-900/80 backdrop-blur-md text-white rounded-2xl p-5 space-y-3 shadow-xl border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Workspace Knowledge Overview
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xl font-extrabold text-white">{workspace.notes.length}</div>
                  <div className="text-[11px] text-slate-400">Knowledge Notes</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xl font-extrabold text-indigo-400">{workspace.concepts.length}</div>
                  <div className="text-[11px] text-slate-400">Concept Nodes</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xl font-extrabold text-white">{workspace.resources.length}</div>
                  <div className="text-[11px] text-slate-400">Open Materials</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xl font-extrabold text-amber-400">{workspace.flashcards.length}</div>
                  <div className="text-[11px] text-slate-400">Flashcards</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {isAddingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-900/90 rounded-2xl shadow-2xl border border-white/15 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl text-slate-100">
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white text-base">Add Material to {workspace.name}</h3>
              <button onClick={() => setIsAddingResource(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Material Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: 'article', label: 'Article/Doc', icon: FileText },
                    { type: 'video', label: 'Video (YT)', icon: Video },
                    { type: 'code', label: 'Code Snippet', icon: Code },
                    { type: 'image', label: 'Image Diagram', icon: ImageIcon },
                  ].map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setNewType(t.type as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          newType === t.type
                            ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200 ring-1 ring-indigo-400/30'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Brazr Virtual DOM Reconciliation Guide"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-sm placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Source URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://docs.brazr.dev/... or YouTube URL"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-sm placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Text / Markdown Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste article text, documentation excerpt, or code here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-sm font-mono text-xs placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Reactivity, Architecture, VDOM"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-sm placeholder-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingResource(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
