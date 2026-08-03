import React, { useState, useEffect } from 'react';
import { Workspace, ResourceItem, NoteItem, ConceptNode, FlashcardItem, ConfusionQuery } from './types';
import { INITIAL_WORKSPACES } from './data/initialData';
import { Navbar } from './components/Navbar';
import { WorkspaceModal } from './components/WorkspaceModal';
import { ActiveTabReader } from './components/ActiveTabReader';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { ConfusionSolverView } from './components/ConfusionSolverView';
import { CrossReferencerView } from './components/CrossReferencerView';
import { FlashcardsView } from './components/FlashcardsView';

export default function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem('nexus_workspaces');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved workspaces:', e);
      }
    }
    return INITIAL_WORKSPACES;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    workspaces[0]?.id || 'ws-brazr'
  );

  const [activeTab, setActiveTab] = useState<'reader' | 'notes' | 'confusion' | 'graph' | 'flashcards'>('reader');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  // Handler: Create Workspace
  const handleCreateWorkspace = (name: string, description: string, color: string) => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      description,
      color,
      icon: 'Folder',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resources: [],
      notes: [],
      concepts: [],
      flashcards: [],
      confusions: [],
    };

    setWorkspaces((prev) => [newWs, ...prev]);
    setActiveWorkspaceId(newWs.id);
    setActiveTab('reader');
  };

  // Handler: Add Resource to active workspace
  const handleAddResource = (resource: ResourceItem) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspace.id) {
          const existingIdx = ws.resources.findIndex((r) => r.id === resource.id);
          let updatedResources = [...ws.resources];
          if (existingIdx >= 0) {
            updatedResources[existingIdx] = resource;
          } else {
            updatedResources = [resource, ...ws.resources];
          }
          return {
            ...ws,
            resources: updatedResources,
            updatedAt: new Date().toISOString(),
          };
        }
        return ws;
      })
    );
  };

  // Handler: Save Generated Note (Create or Append)
  const handleSaveGeneratedNote = (note: NoteItem, shouldAppend: boolean, targetNoteId?: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspace.id) {
          let updatedNotes = [...ws.notes];
          if (shouldAppend && targetNoteId) {
            updatedNotes = updatedNotes.map((n) => (n.id === targetNoteId ? note : n));
          } else {
            const existingIdx = updatedNotes.findIndex((n) => n.id === note.id);
            if (existingIdx >= 0) {
              updatedNotes[existingIdx] = note;
            } else {
              updatedNotes = [note, ...updatedNotes];
            }
          }
          return {
            ...ws,
            notes: updatedNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return ws;
      })
    );
  };

  // Handler: Update Note
  const handleUpdateNote = (note: NoteItem) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspace.id) {
          return {
            ...ws,
            notes: ws.notes.map((n) => (n.id === note.id ? note : n)),
            updatedAt: new Date().toISOString(),
          };
        }
        return ws;
      })
    );
  };

  // Handler: Delete Note
  const handleDeleteNote = (noteId: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspace.id) {
          return {
            ...ws,
            notes: ws.notes.filter((n) => n.id !== noteId),
            updatedAt: new Date().toISOString(),
          };
        }
        return ws;
      })
    );
  };

  // Handler: Add Concept
  const handleAddConcept = (name: string, definition: string, category: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspace.id) {
          const newConcept: ConceptNode = {
            id: `concept-${Date.now()}`,
            name,
            definition,
            category,
            linkedNotes: ws.notes.slice(0, 1).map((n) => n.id),
            linkedResources: ws.resources.slice(0, 1).map((r) => r.id),
            connections: [],
          };
          return {
            ...ws,
            concepts: [newConcept, ...ws.concepts],
            updatedAt: new Date().toISOString(),
          };
        }
        return ws;
      })
    );
  };

  // Handler: Add Confusion Query
  const handleAddConfusionQuery = (query: ConfusionQuery) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspace.id) {
          return {
            ...ws,
            confusions: [...ws.confusions, query],
            updatedAt: new Date().toISOString(),
          };
        }
        return ws;
      })
    );
  };

  // Handler: Add Flashcards
  const handleAddFlashcards = (cards: FlashcardItem[]) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === activeWorkspace.id) {
          return {
            ...ws,
            flashcards: [...cards, ...ws.flashcards],
            updatedAt: new Date().toISOString(),
          };
        }
        return ws;
      })
    );
  };

  return (
    <div className="min-h-screen bg-frosted-canvas text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navbar */}
      <Navbar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspaceId}
        onOpenCreateWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'reader' && (
          <ActiveTabReader
            workspace={activeWorkspace}
            onAddResource={handleAddResource}
            onSaveGeneratedNote={handleSaveGeneratedNote}
            onAddConcept={handleAddConcept}
          />
        )}

        {activeTab === 'notes' && (
          <KnowledgeBaseView
            workspace={activeWorkspace}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'confusion' && (
          <ConfusionSolverView
            workspace={activeWorkspace}
            onAddConfusionQuery={handleAddConfusionQuery}
          />
        )}

        {activeTab === 'graph' && (
          <CrossReferencerView
            workspace={activeWorkspace}
            onAddConcept={handleAddConcept}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            workspace={activeWorkspace}
            onAddFlashcards={handleAddFlashcards}
          />
        )}
      </main>

      {/* Create Workspace Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />
    </div>
  );
}
