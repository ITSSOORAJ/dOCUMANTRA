import React, { useState } from 'react';
import {
  FileText,
  Clock,
  History,
  Tag,
  Plus,
  Sparkles,
  Link,
  Search,
  BookOpen,
  Image as ImageIcon,
  CheckCircle,
  Edit3,
  Loader2,
  Trash2
} from 'lucide-react';
import { Workspace, NoteItem } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface KnowledgeBaseViewProps {
  workspace: Workspace;
  onUpdateNote: (note: NoteItem) => void;
  onDeleteNote: (noteId: string) => void;
  searchQuery: string;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  workspace,
  onUpdateNote,
  onDeleteNote,
  searchQuery,
}) => {
  const filteredNotes = workspace.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    filteredNotes[0]?.id || workspace.notes[0]?.id || ''
  );

  const [isAppendingModalOpen, setIsAppendingModalOpen] = useState(false);
  const [appendInputText, setAppendInputText] = useState('');
  const [appendSourceTitle, setAppendSourceTitle] = useState('');
  const [isAppendingAI, setIsAppendingAI] = useState(false);

  const selectedNote = workspace.notes.find((n) => n.id === selectedNoteId) || filteredNotes[0];

  const handleAppendNewMaterial = async () => {
    if (!selectedNote || !appendInputText.trim()) return;
    setIsAppendingAI(true);
    try {
      const response = await fetch('/api/ai/append-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existingNoteTitle: selectedNote.title,
          existingContent: selectedNote.content,
          newMaterialTitle: appendSourceTitle.trim() || 'Additional Reading',
          newContent: appendInputText.trim(),
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        const updatedNote: NoteItem = {
          ...selectedNote,
          content: data.result.updatedContent,
          keyTakeaways: Array.from(
            new Set([...selectedNote.keyTakeaways, ...data.result.combinedKeyTakeaways])
          ),
          history: [
            ...(selectedNote.history || []),
            {
              id: `hist-${Date.now()}`,
              timestamp: new Date().toISOString(),
              addedContent: appendInputText.trim().substring(0, 150) + '...',
              sourceTitle: appendSourceTitle.trim() || 'Manual Reading Insight',
              reason: data.result.appendReason || 'Appended new reading content into knowledge base.',
            },
          ],
          updatedAt: new Date().toISOString(),
        };

        onUpdateNote(updatedNote);
        setIsAppendingModalOpen(false);
        setAppendInputText('');
        setAppendSourceTitle('');
      }
    } catch (err) {
      console.error('Failed to append into note:', err);
    } finally {
      setIsAppendingAI(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Knowledge Base & Appended Notes
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Structured study notes for <strong className="text-indigo-300">{workspace.name}</strong>. Appends new readings into previously read topics over time.
          </p>
        </div>

        {selectedNote && (
          <button
            id="append-insight-btn"
            onClick={() => setIsAppendingModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Append New Reading into Active Note
          </button>
        )}
      </div>

      {/* Main Layout: Notes List (4 cols) & Note Detail View (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Notes List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Workspace Notes ({filteredNotes.length})
          </div>

          {filteredNotes.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 text-slate-400 text-xs">
              No notes found in {workspace.name}. Switch to Active Reader to generate notes!
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map((note) => {
                const isSelected = note.id === selectedNote?.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-400/40 text-white shadow-md backdrop-blur-md ring-1 ring-indigo-400/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold text-sm line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                        {note.title}
                      </h3>
                      {note.history && note.history.length > 0 && (
                        <span
                          className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                          title={`${note.history.length} appended updates`}
                        >
                          <History className="w-3 h-3" /> +{note.history.length}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">{note.summary}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-white/10">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      <span>{note.keyTakeaways.length} takeaways</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (8 cols): Active Note Reader & Append History */}
        <div className="lg:col-span-8 space-y-6">
          {selectedNote ? (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
              
              {/* Note Header */}
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full">
                      Knowledge Note
                    </span>
                    <span className="text-xs text-slate-400">
                      Last Updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">{selectedNote.title}</h1>
                </div>

                <button
                  onClick={() => onDeleteNote(selectedNote.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Note Content Body */}
              <div className="p-6 space-y-6">
                
                {/* Executive Summary Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Executive Summary:
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">{selectedNote.summary}</p>
                </div>

                {/* Key Takeaways */}
                {selectedNote.keyTakeaways.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Concept Takeaways:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedNote.keyTakeaways.map((kt, i) => (
                        <div key={i} className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{kt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Diagram Screenshots */}
                {selectedNote.images && selectedNote.images.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-400" /> Attached Diagrams & Image Snapshots:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedNote.images.map((img) => (
                        <div key={img.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                          <img src={img.dataUrl} alt={img.caption} className="w-full h-36 object-cover" />
                          <div className="p-2 text-xs text-slate-200 font-medium">{img.caption}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Markdown Main Notes */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Full Notes & Synthesized Analysis:
                  </h3>
                  <MarkdownRenderer content={selectedNote.content} />
                </div>

                {/* Append History Timeline */}
                {selectedNote.history && selectedNote.history.length > 0 && (
                  <div className="pt-6 border-t border-white/10 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-indigo-400" /> Incremental Reading Append History ({selectedNote.history.length})
                    </h3>

                    <div className="relative pl-4 space-y-3 border-l-2 border-indigo-500/40">
                      {selectedNote.history.map((h) => (
                        <div key={h.id} className="relative bg-white/5 p-3 rounded-xl border border-white/10 text-xs space-y-1">
                          <span className="absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-slate-900" />
                          <div className="flex items-center justify-between text-slate-400 font-medium">
                            <span>From: <strong className="text-slate-200">{h.sourceTitle}</strong></span>
                            <span>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-200 font-medium mt-1">{h.reason}</p>
                          <p className="text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-white/10 text-[11px]">
                            "{h.addedContent}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center border border-white/10 text-slate-400 text-xs">
              Select a note on the left to review knowledge base content.
            </div>
          )}
        </div>
      </div>

      {/* Append Material Modal */}
      {isAppendingModalOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-900/90 rounded-2xl shadow-2xl border border-white/15 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl text-slate-100">
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-white text-base">
                  Append Reading to "{selectedNote.title}"
                </h3>
              </div>
              <button onClick={() => setIsAppendingModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300">
                Paste new material or notes you've read. The AI Agent will merge these insights into the existing note while preserving previous content and building an append timeline history.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Source Title / Article Name</label>
                <input
                  type="text"
                  placeholder="e.g. Brazr Directive Performance Benchmarks"
                  value={appendSourceTitle}
                  onChange={(e) => setAppendSourceTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-xs placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">New Reading Content *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste excerpt, article text, or video transcript..."
                  value={appendInputText}
                  onChange={(e) => setAppendInputText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-xs font-mono placeholder-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsAppendingModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAppendNewMaterial}
                  disabled={!appendInputText.trim() || isAppendingAI}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {isAppendingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Synthesize & Append
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
