import React, { useState } from 'react';
import {
  Network,
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon,
  Link,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Workspace, ConceptNode } from '../types';

interface CrossReferencerViewProps {
  workspace: Workspace;
  onAddConcept: (name: string, definition: string, category: string) => void;
}

export const CrossReferencerView: React.FC<CrossReferencerViewProps> = ({
  workspace,
  onAddConcept,
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    workspace.concepts[0]?.id || ''
  );

  const [isAddConceptModalOpen, setIsAddConceptModalOpen] = useState(false);
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptDef, setNewConceptDef] = useState('');
  const [newConceptCat, setNewConceptCat] = useState('');

  const selectedConcept = workspace.concepts.find((c) => c.id === selectedConceptId) || workspace.concepts[0];

  const handleCreateConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptName.trim()) return;
    onAddConcept(
      newConceptName.trim(),
      newConceptDef.trim() || 'Key domain concept node.',
      newConceptCat.trim() || 'General'
    );
    setIsAddConceptModalOpen(false);
    setNewConceptName('');
    setNewConceptDef('');
    setNewConceptCat('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" /> Seamless Cross-Referencer Graph
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Visual map linking articles, videos, image snapshots, notes, and key concepts in <strong className="text-indigo-300">{workspace.name}</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsAddConceptModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Concept Node
        </button>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Concept Node Network Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Discovered Concept Nodes ({workspace.concepts.length})
            </span>
          </div>

          {workspace.concepts.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl text-center border border-white/10 text-slate-400 text-xs">
              No concepts registered yet. Add a concept node or process reading materials in the Active Reader!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workspace.concepts.map((concept) => {
                const isSelected = concept.id === selectedConcept?.id;
                return (
                  <button
                    key={concept.id}
                    onClick={() => setSelectedConceptId(concept.id)}
                    className={`text-left p-4 rounded-2xl border transition-all space-y-2 backdrop-blur-md ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-400/40 text-white shadow-md ring-1 ring-indigo-400/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                        {concept.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {concept.linkedNotes.length} notes · {concept.linkedResources.length} refs
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm">{concept.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{concept.definition}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cross-Reference Matrix Visualization */}
          <div className="bg-white/5 backdrop-blur-md text-white rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Network className="w-4 h-4" /> Workspace Reference Mesh
              </span>
              <span className="text-[10px] bg-white/10 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {workspace.notes.length} Notes ⇄ {workspace.resources.length} Resources
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {workspace.notes.map((note) => (
                <div key={note.id} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> {note.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Note Entry</span>
                  </div>

                  {/* Linked Resources */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {note.linkedResourceIds.map((resId) => {
                      const res = workspace.resources.find((r) => r.id === resId);
                      if (!res) return null;
                      return (
                        <span key={resId} className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md flex items-center gap-1 border border-indigo-500/30">
                          <Link className="w-3 h-3 text-indigo-400" /> {res.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Active Concept Deep Link Detail Panel */}
        <div className="lg:col-span-5 space-y-6">
          {selectedConcept ? (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-5 shadow-xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full">
                  {selectedConcept.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{selectedConcept.name}</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  {selectedConcept.definition}
                </p>
              </div>

              {/* Linked Knowledge Base Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cross-Referenced Notes ({selectedConcept.linkedNotes.length}):
                </h4>
                {selectedConcept.linkedNotes.map((noteId) => {
                  const note = workspace.notes.find((n) => n.id === noteId);
                  if (!note) return null;
                  return (
                    <div key={noteId} className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
                      <div className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" /> {note.title}
                      </div>
                      <p className="text-[11px] text-slate-300">{note.summary}</p>
                    </div>
                  );
                })}
              </div>

              {/* Linked Source Materials */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Source Reading Materials ({selectedConcept.linkedResources.length}):
                </h4>
                {selectedConcept.linkedResources.map((resId) => {
                  const res = workspace.resources.find((r) => r.id === resId);
                  if (!res) return null;
                  return (
                    <div key={resId} className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        {res.type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        {res.title}
                      </div>
                      <p className="text-[11px] text-slate-400">Source: {res.source}</p>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center border border-white/10 text-slate-400 text-xs">
              Select a concept node to view cross-referencing connections.
            </div>
          )}
        </div>

      </div>

      {/* Add Concept Modal */}
      {isAddConceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-900/90 rounded-2xl shadow-2xl border border-white/15 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl text-slate-100">
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white text-base">Add Concept Node</h3>
              <button onClick={() => setIsAddConceptModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConcept} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Concept Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signal Batching Queue"
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-sm placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Definition *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clear technical definition of this concept..."
                  value={newConceptDef}
                  onChange={(e) => setNewConceptDef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-xs placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Reactivity, Transformers, Memory"
                  value={newConceptCat}
                  onChange={(e) => setNewConceptCat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 text-sm placeholder-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddConceptModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newConceptName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Add Concept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
