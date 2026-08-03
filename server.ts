import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY missing in server environment');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Process Material & Auto-Generate Deep Structured Notes
app.post('/api/ai/process-material', async (req, res) => {
  try {
    const { title, content, type, workspaceName, existingNotesTitles, depthLevel } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const ai = getGeminiClient();
    const prompt = `You are an elite AI Academic & Technical Note Synthesizer analyzing reading materials for the workspace: "${workspaceName || 'General'}".
Material Title: ${title || 'Untitled Material'}
Material Type: ${type || 'article'}
Target Detail Level: ${depthLevel || 'comprehensive'} (Make the notes thorough, exhaustive, clear, and highly structured).

Existing Note Topics in this Workspace:
${(existingNotesTitles || []).join(', ') || 'None'}

Tasks:
1. Provide a professional, descriptive title for these study notes.
2. Provide an Executive Summary (3-4 sentences summarizing core significance, key findings, and context).
3. Write DEEP, EXHAUSTIVE, STRUCTURED Markdown notes. Include:
   - Clear Topic Headings & Subheadings
   - Bulleted Explanations with bold key terms
   - Code snippets, mathematical formulas, or ASCII workflow diagrams if applicable
   - Critical Insights & Caveats box
   - 3-5 Self-Assessment Review Questions with Answers at the bottom
4. Extract 4 to 6 core actionable key takeaways.
5. Identify key concepts (with clear definitions & domain categories) for the Knowledge Base graph.
6. Evaluate if this material logically appends into an existing note topic (specify target note title) or requires creating a NEW note topic.

Return response as valid JSON adhering to the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { text: prompt },
        { text: `MATERIAL FULL CONTENT:\n${content}` }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            markdownNotes: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ['name', 'definition']
              }
            },
            reviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            },
            shouldAppend: { type: Type.BOOLEAN },
            targetAppendNoteTitle: { type: Type.STRING },
            appendReason: { type: Type.STRING }
          },
          required: ['recommendedTitle', 'summary', 'markdownNotes', 'keyTakeaways', 'concepts']
        }
      }
    });

    const jsonStr = response.text || '{}';
    const parsed = JSON.parse(jsonStr);
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error processing material:', error);
    res.status(500).json({ error: error?.message || 'Failed to process material with AI' });
  }
});

// 1b. Batch Process ALL Workspace Materials into Consolidated Master Notes
app.post('/api/ai/batch-process-workspace', async (req, res) => {
  try {
    const { workspaceName, materials } = req.body;
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ error: 'At least one material is required for batch note generation' });
    }

    const ai = getGeminiClient();
    const formattedMaterials = materials
      .map((m: any, idx: number) => `--- MATERIAL #${idx + 1}: ${m.title} (${m.type}) ---\nSource: ${m.source || 'N/A'}\n${m.content || 'No text content available'}`)
      .join('\n\n');

    const prompt = `You are a Principal AI Curriculum Architect synthesizing a Master Knowledge Guide for the workspace: "${workspaceName}".
You have been provided with ALL reading materials in this workspace (${materials.length} total sources).

Tasks:
1. Create a Master Master Study Note Title that unifies all topics.
2. Provide a 4-sentence Executive Summary synthesizing how all these materials interconnect.
3. Write an EXHAUSTIVE, PUBLICATION-QUALITY Master Markdown Note. Structure it as:
   - ## Executive Overview & Integrated Core Pillars
   - ## In-Depth Analysis of Key Themes (Synthesizing insights across materials)
   - ## Comparative Matrix / Key Differences & Connections
   - ## Code Examples, Diagrams, or Technical Specifications (if relevant)
   - ## Critical Study Takeaways & Synthesized Principles
   - ## Master Review & Self-Test Quiz (5 Questions & Answers)
4. Extract 6-10 major key takeaways spanning all materials.
5. Extract all major concepts (with definitions and categories).

Return response as valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { text: prompt },
        { text: `ALL WORKSPACE MATERIALS:\n${formattedMaterials}` }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            markdownNotes: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ['name', 'definition']
              }
            }
          },
          required: ['recommendedTitle', 'summary', 'markdownNotes', 'keyTakeaways', 'concepts']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error in batch material processing:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate master notes' });
  }
});

// 1c. Selection Note Generation (Text Highlight in Reader)
app.post('/api/ai/selection-note', async (req, res) => {
  try {
    const { selectedText, contextTitle, workspaceName, actionType } = req.body;
    if (!selectedText) {
      return res.status(400).json({ error: 'Selected text is required' });
    }

    const ai = getGeminiClient();
    const prompt = `You are an AI Reading Assistant analyzing highlighted text from "${contextTitle || 'Document'}" in workspace "${workspaceName}".
Selected Excerpt:
"${selectedText}"

Action Requested: ${actionType || 'make_note'} (Options: 'make_note', 'explain', 'simplify', 'takeaway')

Tasks:
1. Provide a clean, short title for this selected snippet note.
2. Provide a concise explanation/summary of the excerpt.
3. Provide formatted Markdown notes detailing the selected concept, context, and practical application.
4. Extract 1-3 bullet key takeaways.

Return JSON response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            markdownNotes: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'summary', 'markdownNotes', 'keyTakeaways']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error processing selection note:', error);
    res.status(500).json({ error: error?.message || 'Failed to process selected text' });
  }
});

// 2. Append New Material into Existing Note
app.post('/api/ai/append-note', async (req, res) => {
  try {
    const { existingNoteTitle, existingContent, newMaterialTitle, newContent } = req.body;

    const ai = getGeminiClient();
    const prompt = `You are an AI Knowledge Base Integration Agent.
Your job is to append new reading insights into an existing Knowledge Base Note without deleting or corrupting previous content.

Existing Note Title: "${existingNoteTitle}"
Existing Note Content:
${existingContent}

New Reading Material Title: "${newMaterialTitle}"
New Reading Material Content:
${newContent}

Tasks:
1. Synthesize an updated Markdown Note that cleanly integrates the new material into relevant sections or appends a clear "### 🔍 Appended Update" section.
2. Provide a 1-sentence summary of what was appended and why it enhances the knowledge base.
3. Provide updated key takeaways (combine existing + new).

Return JSON response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedContent: { type: Type.STRING },
            appendReason: { type: Type.STRING },
            combinedKeyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['updatedContent', 'appendReason', 'combinedKeyTakeaways']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error appending note:', error);
    res.status(500).json({ error: error?.message || 'Failed to append note' });
  }
});

// 3. Clear Confusion AI Agent (Q&A with Workspace Grounding)
app.post('/api/ai/clear-confusion', async (req, res) => {
  try {
    const { question, workspaceName, workspaceNotes, workspaceResources, workspaceConcepts } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGeminiClient();

    const notesContext = (workspaceNotes || [])
      .map((n: any) => `[Note: ${n.title}]\n${n.summary}\n${n.content}`)
      .join('\n\n---\n\n');

    const resourcesContext = (workspaceResources || [])
      .map((r: any) => `[Resource: ${r.title} (${r.type})]\n${r.content || r.source}`)
      .join('\n\n---\n\n');

    const conceptsContext = (workspaceConcepts || [])
      .map((c: any) => `- ${c.name}: ${c.definition}`)
      .join('\n');

    const systemInstruction = `You are a supportive, high-clarity Multimodal AI Learning Agent for the workspace "${workspaceName || 'Study Workspace'}".
Your core goal is to clear the student's confusion with maximum clarity, structured reasoning, real-world analogies, and concrete code/math examples where applicable.

Context from User Workspace:
=== CONCEPTS ===
${conceptsContext || 'None'}

=== NOTES ===
${notesContext || 'None'}

=== RESOURCES ===
${resourcesContext || 'None'}

Guidelines:
1. Address the confusion directly and reassuringly.
2. Break down the core misunderstanding into simple, logical steps.
3. Cross-reference specific notes or resources from the workspace if applicable (e.g. "As noted in your reading on Brazr signals...").
4. Provide code snippets, diagrams (ASCII or text), or step-by-step logic if relevant.
5. End with a quick sanity-check question or key takeaway to solidify understanding.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: question,
      config: {
        systemInstruction
      }
    });

    res.json({ success: true, answer: response.text || 'No response generated.' });
  } catch (error: any) {
    console.error('Error clearing confusion:', error);
    res.status(500).json({ error: error?.message || 'Failed to clear confusion' });
  }
});

// 4. Multimodal Image Analysis & Snapshot Note Extraction
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { base64Data, mimeType, caption, workspaceName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Analyze this technical image/diagram/screenshot for workspace "${workspaceName || 'General'}".
User Context/Caption: ${caption || 'Extract notes and key insights from this visual.'}

Tasks:
1. Provide a clear title for this visual artifact.
2. Explain what is shown in the image (diagram components, code flow, formula, architecture graph).
3. Write clean Markdown notes summarizing the key takeaway of this image.
4. Extract 2-3 key concepts or formulas shown in the visual.

Return response in JSON format.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            explanation: { type: Type.STRING },
            markdownNotes: { type: Type.STRING },
            extractedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'explanation', 'markdownNotes', 'extractedConcepts']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze image' });
  }
});

// 5. Generate Flashcards for Workspace
app.post('/api/ai/generate-flashcards', async (req, res) => {
  try {
    const { workspaceName, notes, concepts } = req.body;
    const ai = getGeminiClient();

    const notesSummary = (notes || []).map((n: any) => `${n.title}: ${n.summary}`).join('\n');
    const conceptsSummary = (concepts || []).map((c: any) => `${c.name}: ${c.definition}`).join('\n');

    const prompt = `Generate 5 active-recall flashcards based on the following study materials for "${workspaceName}":

Concepts:
${conceptsSummary}

Notes:
${notesSummary}

Return JSON array of flashcards with 'front' (question) and 'back' (clear, concise answer) and 'category'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['front', 'back']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ success: true, flashcards: parsed });
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate flashcards' });
  }
});

// Vite middleware & Static fallback
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multimodal Learning Agent Server listening on port ${PORT}`);
  });
}

startServer();
