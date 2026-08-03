import { Workspace } from '../types';

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-brazr',
    name: 'Brazr & DOM Manipulation Architecture',
    description: 'Dedicated workspace for reading Brazr framework documentation, virtual DOM reconciliation, and component lifecycles.',
    color: 'bg-emerald-500',
    icon: 'Layers',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-03T08:30:00Z',
    resources: [
      {
        id: 'res-brazr-doc-1',
        workspaceId: 'ws-brazr',
        title: 'Brazr Core: Reactive State & Batch Rendering',
        type: 'article',
        source: 'Brazr Official Docs',
        url: 'https://brazr-docs.org/core/reactive-state',
        capturedAt: '2026-08-01T10:15:00Z',
        tags: ['Reactive Engine', 'State', 'Virtual DOM'],
        readTimeMinutes: 8,
        content: `# Brazr Core Architecture Overview

Brazr is a lightweight, zero-dependency modern reactive engine designed for micro-frontend web applications.

## Key Principles:
1. **Fine-Grained Signal Reactivity**: Brazr tracks dependencies at the atom level, bypassing full tree diffing.
2. **Asynchronous Batching Engine**: Mutations are batched into a single microtask queue using \`queueMicrotask()\`.
3. **Hydration Engine**: Supports selective progressive hydration for server-rendered HTML blocks.

### Code Sample: Creating a Brazr Reactive Signal
\`\`\`ts
import { signal, computed, effect } from 'brazr';

const count = signal(0);
const doubleCount = computed(() => count.value * 2);

effect(() => {
  console.log('Double count updated:', doubleCount.value);
});

count.value = 5; // Triggers effect asynchronously
\`\`\`

## Memory Footprint & Diffing Benchmark
When comparing Brazr reconciliation with traditional virtual DOM trees:
- Memory overhead is reduced by 64% due to single-ref pointers.
- DOM node updates occur in target arrays without intermediary JS object creation.
`,
        extractedImages: [
          {
            id: 'img-brazr-1',
            caption: 'Brazr Microtask Queue & Signal Graph Diagram',
            dataUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
            sourceRef: 'Figure 1.2: Reactive Signal Dependency Tree'
          }
        ]
      },
      {
        id: 'res-brazr-video-1',
        workspaceId: 'ws-brazr',
        title: 'Mastering Brazr Framework in 20 Minutes',
        type: 'video',
        source: 'YouTube / TechTalks',
        url: 'https://www.youtube.com/watch?v=demo_brazr_guide',
        capturedAt: '2026-08-02T14:20:00Z',
        tags: ['Video Guide', 'Tutorial', 'Brazr'],
        content: 'Comprehensive video overview covering Brazr routing, state machines, component hooks, and zero-bundle size directives.',
        timestamps: [
          { time: '02:15', seconds: 135, label: 'Signal Engine vs VDOM', note: 'Explains why Brazr does not require virtual DOM tree traversal.' },
          { time: '07:40', seconds: 460, label: 'Custom Directives & Lifecycle', note: 'Deep dive into Brazr directive binding and cleanup callbacks.' },
          { time: '14:10', seconds: 850, label: 'Server-Side Rendering & Hydration', note: 'Shows how Brazr attaches event listeners to pre-rendered HTML.' }
        ]
      }
    ],
    notes: [
      {
        id: 'note-brazr-1',
        workspaceId: 'ws-brazr',
        title: 'Brazr Signal Reactivity & Rendering Engine',
        summary: 'Synthesized notes on Brazr signal tracking, microtask queuing, and hydration differences.',
        content: `### 📌 Core Takeaways
- **Signal Model**: Brazr uses getter/setter subscriptions. Changing a signal notifies subscribers directly without walking a root component tree.
- **Batching Queue**: Multiple signal changes in a synchronous block execute within 1 microtask frame.
- **Hydration Strategy**: HTML tags marked with \`data-bz-island\` hydrate independently without blocking UI interactive input.

### 💡 Key Comparison with Standard VDOM:
Standard VDOM creates virtual nodes and diffs trees on state change. Brazr directly maps signals to target DOM node text nodes and attribute bindings.

### 🔍 Appended Update (2026-08-02):
Added insights from video tutorial:
- Directives like \`b-for\` keep index reference maps to prevent key-reorder thrashing.
- Memory garbage collection requires calling \`dispose()\` on dynamic effect subscriptions.`,
        keyTakeaways: [
          'Signal model tracks atom dependencies',
          'Batching uses queueMicrotask()',
          'Progressive island hydration avoids blocking input'
        ],
        linkedResourceIds: ['res-brazr-doc-1', 'res-brazr-video-1'],
        linkedConceptIds: ['concept-brazr-signals', 'concept-microtask-queue'],
        history: [
          {
            id: 'hist-1',
            timestamp: '2026-08-02T15:00:00Z',
            addedContent: 'Added video notes regarding b-for directive index reference maps and effect cleanup.',
            sourceTitle: 'Mastering Brazr Framework in 20 Minutes',
            reason: 'Appended new video insights into existing Brazr Signal note.'
          }
        ],
        createdAt: '2026-08-01T11:00:00Z',
        updatedAt: '2026-08-02T15:00:00Z',
        images: [
          {
            id: 'img-brazr-1',
            caption: 'Brazr Microtask Queue & Signal Graph Diagram',
            dataUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ],
    concepts: [
      {
        id: 'concept-brazr-signals',
        name: 'Signal Graph',
        definition: 'A directed acyclic graph of state primitives (signals) and subscribers (effects/computeds) that update reactively.',
        category: 'Reactivity',
        linkedNotes: ['note-brazr-1'],
        linkedResources: ['res-brazr-doc-1'],
        connections: [
          { targetId: 'concept-microtask-queue', relationship: 'batches execution via' }
        ]
      },
      {
        id: 'concept-microtask-queue',
        name: 'Microtask Queue Batcher',
        definition: 'A scheduling strategy using queueMicrotask to group consecutive signal updates into a single DOM repaint.',
        category: 'Performance',
        linkedNotes: ['note-brazr-1'],
        linkedResources: ['res-brazr-doc-1'],
        connections: []
      }
    ],
    flashcards: [
      {
        id: 'fc-1',
        workspaceId: 'ws-brazr',
        front: 'How does Brazr signal reactivity differ from standard Virtual DOM diffing?',
        back: 'Brazr tracks direct dependencies at the atom signal level and mutates target DOM nodes directly, avoiding full tree diffing and JS object allocations.',
        category: 'Reactivity',
        difficulty: 'medium'
      },
      {
        id: 'fc-2',
        workspaceId: 'ws-brazr',
        front: 'What API does Brazr use to batch state updates?',
        back: 'It uses queueMicrotask() to collect synchronous signal writes and flush DOM updates in a single tick.',
        category: 'Performance',
        difficulty: 'easy'
      }
    ],
    confusions: [
      {
        id: 'conf-1',
        workspaceId: 'ws-brazr',
        question: 'What happens if I mutate a signal inside an effect loop in Brazr?',
        answer: 'Mutating a signal inside its own effect function will create a cyclic dependency loop. Brazr detects recursive effect triggers within the microtask queue and throws a `CyclicSignalError` after 100 recursive iterations to prevent browser freeze.',
        references: [
          { title: 'Brazr Core: Reactive State', snippet: 'Effects track subscriptions automatically during getter execution...' }
        ],
        createdAt: '2026-08-02T16:00:00Z'
      }
    ]
  },
  {
    id: 'ws-ml',
    name: 'Machine Learning & Transformer Models',
    description: 'Workspace dedicated to self-attention mechanisms, LLM context windows, and speculative decoding techniques.',
    color: 'bg-indigo-500',
    icon: 'Cpu',
    createdAt: '2026-08-02T09:00:00Z',
    updatedAt: '2026-08-03T07:15:00Z',
    resources: [
      {
        id: 'res-ml-1',
        workspaceId: 'ws-ml',
        title: 'Attention Is All You Need: Breakdown',
        type: 'article',
        source: 'Research Summary',
        capturedAt: '2026-08-02T09:10:00Z',
        tags: ['Paper', 'Attention', 'Transformers'],
        readTimeMinutes: 12,
        content: `# Self-Attention & Transformer Architecture

Self-attention allows tokens in a sequence to dynamically weigh representations of other tokens regardless of distance.

## Key Formulas:
- **Query, Key, Value Projections**: $Q = X W_Q, K = X W_K, V = X W_V$
- **Scaled Dot-Product Attention**:
  $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

The factor $\\sqrt{d_k}$ prevents gradients from vanishing for large vector dimensions.
`,
        extractedImages: [
          {
            id: 'img-transformer-1',
            caption: 'Transformer Encoder-Decoder Scaled Dot Product Attention Block',
            dataUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
            sourceRef: 'Figure 3.1: Attention Mechanism Architecture'
          }
        ]
      }
    ],
    notes: [
      {
        id: 'note-ml-1',
        workspaceId: 'ws-ml',
        title: 'Scaled Dot-Product Attention Mechanics',
        summary: 'Notes on query-key-value projections and matrix scaling factors.',
        content: `### Scaled Dot-Product Attention Overview
- Matrices $Q, K, V$ scale input representations.
- Divide by $\\sqrt{d_k}$ to prevent softmax saturation when dimensionality grows.
- Multi-Head Attention projects $Q, K, V$ into $h$ subspaces in parallel.`,
        keyTakeaways: [
          'Matrix scaling stabilizes gradients',
          'Multi-head enables joint representation learning'
        ],
        linkedResourceIds: ['res-ml-1'],
        linkedConceptIds: ['concept-attention'],
        createdAt: '2026-08-02T09:30:00Z',
        updatedAt: '2026-08-02T09:30:00Z'
      }
    ],
    concepts: [
      {
        id: 'concept-attention',
        name: 'Scaled Dot-Product Attention',
        definition: 'Attention mechanism computing scalar alignments between query and key vectors scaled by key dimension square root.',
        category: 'Deep Learning',
        linkedNotes: ['note-ml-1'],
        linkedResources: ['res-ml-1'],
        connections: []
      }
    ],
    flashcards: [
      {
        id: 'fc-ml-1',
        workspaceId: 'ws-ml',
        front: 'Why do we scale dot-product attention by sqrt(d_k)?',
        back: 'To prevent large magnitude dot products that push the softmax function into regions with extremely small gradients.',
        category: 'Transformers',
        difficulty: 'medium'
      }
    ],
    confusions: []
  }
];
