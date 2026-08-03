import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Network,
  Plus,
  Search,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  Check,
  FolderPlus
} from 'lucide-react';
import { Workspace } from '../types';

interface NavbarProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenCreateWorkspaceModal: () => void;
  activeTab: 'reader' | 'notes' | 'confusion' | 'graph' | 'flashcards';
  setActiveTab: (tab: 'reader' | 'notes' | 'confusion' | 'graph' | 'flashcards') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onOpenCreateWorkspaceModal,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900/60 border-b border-white/10 backdrop-blur-xl sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* App Logo & Workspace Picker */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white ring-1 ring-white/20 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-base flex items-center gap-1.5">
                  NexusLearn
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    Multimodal
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block font-medium">AI Knowledge Engine</p>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Workspace Selector Dropdown */}
            <div className="relative">
              <button
                id="workspace-selector-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-slate-200 backdrop-blur-md shadow-xs"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${activeWorkspace.color}`} />
                <span className="max-w-[140px] sm:max-w-[180px] truncate">{activeWorkspace.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 overflow-hidden">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Learning Workspaces ({workspaces.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 px-1">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          onSelectWorkspace(ws.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between rounded-xl transition-all ${
                          ws.id === activeWorkspace.id ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-semibold' : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`w-2.5 h-2.5 rounded-full ${ws.color}`} />
                          <div className="truncate">
                            <div className="truncate font-medium">{ws.name}</div>
                            <div className="text-[11px] text-slate-400 truncate">{ws.notes.length} notes · {ws.resources.length} resources</div>
                          </div>
                        </div>
                        {ws.id === activeWorkspace.id && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-1.5 mt-1 px-1">
                    <button
                      id="create-workspace-dropdown-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenCreateWorkspaceModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 rounded-xl flex items-center gap-2 transition-all border border-transparent hover:border-indigo-500/30"
                    >
                      <FolderPlus className="w-4 h-4 text-indigo-400" />
                      Create Dedicated Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${activeWorkspace.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all backdrop-blur-xs"
            />
          </div>

          {/* Navigation View Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              id="tab-reader-btn"
              onClick={() => setActiveTab('reader')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                activeTab === 'reader'
                  ? 'bg-indigo-500/80 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Active Reader & Videos</span>
              <span className="lg:hidden">Reader</span>
            </button>

            <button
              id="tab-notes-btn"
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                activeTab === 'notes'
                  ? 'bg-indigo-500/80 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Knowledge Base</span>
              {activeWorkspace.notes.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'notes' ? 'bg-indigo-950 text-indigo-200 border border-indigo-400/30' : 'bg-white/10 text-slate-300'
                }`}>
                  {activeWorkspace.notes.length}
                </span>
              )}
            </button>

            <button
              id="tab-confusion-btn"
              onClick={() => setActiveTab('confusion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                activeTab === 'confusion'
                  ? 'bg-indigo-500/80 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Clear Confusion AI</span>
              <span className="sm:hidden">Q&A</span>
            </button>

            <button
              id="tab-graph-btn"
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                activeTab === 'graph'
                  ? 'bg-indigo-500/80 border-indigo-400/50 text-white shadow-lg shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Network className="w-4 h-4" />
              <span className="hidden xl:inline">Cross-Referencer</span>
              <span className="xl:hidden">Graph</span>
            </button>

            <button
              id="tab-flashcards-btn"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                activeTab === 'flashcards'
                  ? 'bg-indigo-500/80 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Flashcards</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
