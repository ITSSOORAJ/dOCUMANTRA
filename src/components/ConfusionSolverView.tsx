import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  FileText,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { Workspace, ConfusionQuery } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ConfusionSolverViewProps {
  workspace: Workspace;
  onAddConfusionQuery: (query: ConfusionQuery) => void;
}

export const ConfusionSolverView: React.FC<ConfusionSolverViewProps> = ({
  workspace,
  onAddConfusionQuery,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ask' | 'history'>('ask');

  // Suggested questions based on workspace name
  const isBrazr = workspace.name.toLowerCase().includes('brazr');
  const isML = workspace.name.toLowerCase().includes('machine learning') || workspace.name.toLowerCase().includes('transformer');

  const suggestedQuestions = isBrazr
    ? [
        'How does Brazr signal reactivity differ from React Virtual DOM diffing?',
        'Why does Brazr use queueMicrotask() for batching updates?',
        'What happens if an effect loop occurs in Brazr state write?',
      ]
    : isML
    ? [
        'Why do we divide dot products by sqrt(d_k) in scaled dot-product attention?',
        'What is the difference between Encoder-only and Decoder-only models?',
        'How does speculative decoding speed up LLM generation?',
      ]
    : [
        `Summarize the key takeaways in ${workspace.name}`,
        `What are the most complex concepts in this workspace?`,
        `How do the open resources connect to each other?`,
      ];

  const handleAskQuestion = async (promptText?: string) => {
    const queryText = promptText || question;
    if (!queryText.trim() || isLoading) return;

    setIsLoading(true);
    setQuestion('');

    try {
      const response = await fetch('/api/ai/clear-confusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText.trim(),
          workspaceName: workspace.name,
          workspaceNotes: workspace.notes,
          workspaceResources: workspace.resources,
          workspaceConcepts: workspace.concepts,
        }),
      });

      const data = await response.json();
      if (data.success && data.answer) {
        const newQuery: ConfusionQuery = {
          id: `conf-${Date.now()}`,
          workspaceId: workspace.id,
          question: queryText.trim(),
          answer: data.answer,
          references: workspace.notes.slice(0, 2).map((n) => ({
            noteId: n.id,
            title: n.title,
            snippet: n.summary,
          })),
          createdAt: new Date().toISOString(),
        };

        onAddConfusionQuery(newQuery);
      }
    } catch (err) {
      console.error('Failed to clear confusion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white/5 backdrop-blur-md text-white p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              Grounded AI Assistant
            </span>
            <span className="text-xs text-slate-400">Workspace Context Active</span>
          </div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <HelpCircle className="w-5 h-5 text-indigo-400" /> Confusion Solver AI Agent
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Stuck or confused while reading through <strong className="text-indigo-300">{workspace.name}</strong> materials? Ask any question. The agent uses your open tabs, notes, and visual diagrams to provide step-by-step explanations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/40 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ask' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ask & Resolve
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cleared Confusions ({workspace.confusions.length})
          </button>
        </div>
      </div>

      {activeTab === 'ask' ? (
        <div className="space-y-6">
          
          {/* Suggested Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Suggested Questions for {workspace.name}:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleAskQuestion(sq)}
                  disabled={isLoading}
                  className="text-xs bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl border border-white/10 hover:border-indigo-400/40 transition-all font-medium text-left shadow-lg backdrop-blur-md flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{sq}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ask Input Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Describe your specific doubt or confusion:
            </label>

            <div className="relative">
              <textarea
                rows={3}
                placeholder={`e.g. I am confused about how Brazr handles signal updates inside async callbacks, or why scaled dot-product attention scales by sqrt(d_k)...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleAskQuestion();
                  }
                }}
                className="w-full p-3.5 text-sm bg-white/5 border border-white/15 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 font-sans"
              />
              <span className="absolute right-3 bottom-3 text-[10px] text-slate-400">
                Press Ctrl + Enter to send
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Grounded in {workspace.notes.length} notes & {workspace.resources.length} resources
              </span>

              <button
                id="send-confusion-query-btn"
                onClick={() => handleAskQuestion()}
                disabled={!question.trim() || isLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Clearing Confusion...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Clear Confusion
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Display Latest Cleared Answer */}
          {workspace.confusions.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Latest Explanation:
              </div>

              {workspace.confusions.slice(-1).map((conf) => (
                <div key={conf.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-indigo-500/30 shadow-xl overflow-hidden">
                  <div className="bg-indigo-500/10 p-4 border-b border-indigo-500/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg font-bold text-sm">
                      ?
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{conf.question}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Answered at {new Date(conf.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <MarkdownRenderer content={conf.answer} />

                    {conf.references && conf.references.length > 0 && (
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Workspace References Grounded:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {conf.references.map((r, i) => (
                            <div key={i} className="text-xs bg-white/5 border border-white/10 p-2 rounded-lg text-slate-300">
                              <strong className="text-indigo-300">{r.title}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        /* Confusion History Tab */
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            History of Resolved Doubts in {workspace.name} ({workspace.confusions.length})
          </div>

          {workspace.confusions.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md p-12 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
              No confusion queries logged yet. Ask your first doubt above!
            </div>
          ) : (
            <div className="space-y-4">
              {workspace.confusions.map((conf) => (
                <div key={conf.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                      {conf.question}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(conf.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10">
                    <MarkdownRenderer content={conf.answer} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
