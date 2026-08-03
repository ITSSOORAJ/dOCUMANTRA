import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { Workspace, FlashcardItem } from '../types';

interface FlashcardsViewProps {
  workspace: Workspace;
  onAddFlashcards: (cards: FlashcardItem[]) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  workspace,
  onAddFlashcards,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const cards = workspace.flashcards || [];
  const currentCard = cards[currentIndex];

  const handleGenerateFlashcards = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName: workspace.name,
          notes: workspace.notes,
          concepts: workspace.concepts,
        }),
      });

      const data = await response.json();
      if (data.success && data.flashcards) {
        const newCards: FlashcardItem[] = data.flashcards.map((fc: any, i: number) => ({
          id: `fc-${Date.now()}-${i}`,
          workspaceId: workspace.id,
          front: fc.front,
          back: fc.back,
          category: fc.category || 'General',
          difficulty: 'medium',
        }));

        onAddFlashcards(newCards);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Failed to generate flashcards:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" /> Active Recall Flashcards
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Test and solidify your understanding of concepts in <strong className="text-indigo-300">{workspace.name}</strong>.
          </p>
        </div>

        <button
          id="generate-ai-flashcards-btn"
          onClick={handleGenerateFlashcards}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-200" />}
          Generate AI Flashcards
        </button>
      </div>

      {cards.length > 0 && currentCard ? (
        <div className="space-y-6">
          
          {/* Card Counter Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            {currentCard.category && (
              <span className="bg-white/10 border border-white/10 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                {currentCard.category}
              </span>
            )}
          </div>

          {/* Interactive Flip Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[280px] sm:min-h-[320px] bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400/50 transition-all relative select-none group"
          >
            <div className="absolute top-4 right-4 text-xs font-semibold text-slate-400 group-hover:text-indigo-300 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Click card to flip
            </div>

            <div className="max-w-xl space-y-4">
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                isFlipped ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
              }`}>
                {isFlipped ? 'Answer / Explanation' : 'Question / Prompt'}
              </span>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </h2>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
              }}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-slate-200 transition-colors shadow-lg backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all"
            >
              Flip Card
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
              }}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-slate-200 transition-colors shadow-lg backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center border border-white/10 space-y-3">
          <Zap className="w-12 h-12 text-amber-400/50 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Flashcards Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Generate AI Flashcards" above to build active-recall questions from your workspace notes and concepts!
          </p>
          <button
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
          >
            Generate Workspace Flashcards
          </button>
        </div>
      )}

    </div>
  );
};
