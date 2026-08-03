export type ResourceType = 'document' | 'article' | 'video' | 'image' | 'code';

export interface ExtractedImage {
  id: string;
  caption: string;
  dataUrl: string;
  timestamp?: string;
  sourceRef?: string;
}

export interface VideoTimestamp {
  time: string;
  seconds: number;
  label: string;
  note: string;
}

export interface ResourceItem {
  id: string;
  workspaceId: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  mediaUrl?: string;
  source: string;
  capturedAt: string;
  tags: string[];
  extractedImages?: ExtractedImage[];
  timestamps?: VideoTimestamp[];
  readTimeMinutes?: number;
}

export interface NoteAppendedHistory {
  id: string;
  timestamp: string;
  addedContent: string;
  sourceTitle: string;
  reason: string;
}

export interface NoteItem {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  content: string; // Markdown formatted
  keyTakeaways: string[];
  linkedResourceIds: string[];
  linkedConceptIds: string[];
  history?: NoteAppendedHistory[];
  createdAt: string;
  updatedAt: string;
  images?: ExtractedImage[];
}

export interface ConceptConnection {
  targetId: string;
  relationship: string;
}

export interface ConceptNode {
  id: string;
  name: string;
  definition: string;
  category: string;
  linkedNotes: string[];
  linkedResources: string[];
  connections: ConceptConnection[];
}

export interface FlashcardItem {
  id: string;
  workspaceId: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
}

export interface ConfusionQuery {
  id: string;
  workspaceId: string;
  question: string;
  answer: string;
  references: {
    resourceId?: string;
    noteId?: string;
    title: string;
    snippet: string;
  }[];
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  resources: ResourceItem[];
  notes: NoteItem[];
  concepts: ConceptNode[];
  flashcards: FlashcardItem[];
  confusions: ConfusionQuery[];
}

export interface ActiveReadingTab {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  mediaUrl?: string;
  extractedImages?: ExtractedImage[];
  selectedText?: string;
}
