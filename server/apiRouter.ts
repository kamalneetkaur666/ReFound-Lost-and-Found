import express, { Request, Response, Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment variables. Falling back to heuristic matcher.');
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export const apiRouter: Router = express.Router();
apiRouter.use(express.json({ limit: '10mb' }));

interface ItemSummary {
  id: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  time?: string;
  imageUrl?: string;
}

// Heuristic fallback matching in case GEMINI_API_KEY is not configured or network issues occur
function heuristicMatch(source: ItemSummary, candidate: ItemSummary) {
  let score = 0;
  const factors: string[] = [];

  // Category match
  if (source.category.toLowerCase() === candidate.category.toLowerCase()) {
    score += 35;
    factors.push(`Same category: ${source.category}`);
  }

  // Title keywords
  const sourceWords = (source.title + ' ' + source.description).toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const candWords = (candidate.title + ' ' + candidate.description).toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const commonWords = sourceWords.filter(w => candWords.includes(w));
  const uniqueCommon = Array.from(new Set(commonWords));

  if (uniqueCommon.length > 0) {
    const wordBonus = Math.min(35, uniqueCommon.length * 10);
    score += wordBonus;
    factors.push(`Matching keywords: ${uniqueCommon.slice(0, 3).join(', ')}`);
  }

  // Location similarity
  const sourceLoc = source.location.toLowerCase();
  const candLoc = candidate.location.toLowerCase();
  if (sourceLoc === candLoc || sourceLoc.includes(candLoc) || candLoc.includes(sourceLoc)) {
    score += 20;
    factors.push('Similar or overlapping campus location');
  }

  // Temporal check (if dates are close)
  if (source.date && candidate.date) {
    const diffDays = Math.abs(new Date(source.date).getTime() - new Date(candidate.date).getTime()) / (1000 * 3600 * 24);
    if (diffDays <= 3) {
      score += 10;
      factors.push('Reported within a 3-day time window');
    }
  }

  score = Math.min(95, Math.max(15, score));
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (score >= 70) confidence = 'high';
  else if (score >= 45) confidence = 'medium';

  const explanation = `Both items share the category '${source.category}' with related descriptions and campus locations around ${source.location || 'campus'}. Please verify identifying private details before releasing.`;

  return {
    candidateId: candidate.id,
    score,
    confidence,
    explanation,
    matchingFactors: factors.length > 0 ? factors : ['Category and description alignment'],
  };
}

// Endpoint: Check matches for an item against a pool of candidates
apiRouter.post('/match-items', async (req: Request, res: Response) => {
  try {
    const { sourceItem, candidates } = req.body as { sourceItem: ItemSummary; candidates: ItemSummary[] };

    if (!sourceItem || !Array.isArray(candidates) || candidates.length === 0) {
      res.json({ matches: [] });
      return;
    }

    const ai = getGenAI();

    // If Gemini is available, run prompt through Gemini
    if (ai) {
      try {
        const prompt = `
You are an intelligent campus Lost & Found assistant for "ReFound".
Compare the following target report with potential matching reports and identify possible matches.
Important rules:
1. AI suggestions are POTENTIAL matches only. NEVER declare certainty that two items belong to the same person.
2. Focus on physical description, category, color, brand, location proximity on a typical college campus, and dates (Found date should usually be on or after Lost date).
3. Score each candidate from 0 to 100 for match likelihood.
4. Only return items with a score of 35 or higher as potential matches.

Target Item:
- Type: ${sourceItem.type}
- Title: ${sourceItem.title}
- Category: ${sourceItem.category}
- Description: ${sourceItem.description}
- Location: ${sourceItem.location}
- Date: ${sourceItem.date} ${sourceItem.time || ''}

Candidates:
${candidates.map((c, i) => `
Candidate #${i + 1} (ID: ${c.id}):
- Type: ${c.type}
- Title: ${c.title}
- Category: ${c.category}
- Description: ${c.description}
- Location: ${c.location}
- Date: ${c.date} ${c.time || ''}
`).join('\n')}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matches: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      candidateId: { type: Type.STRING },
                      score: { type: Type.NUMBER, description: 'Similarity score from 0 to 100' },
                      confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                      explanation: { type: Type.STRING, description: 'Short, clear explanation of why items might match' },
                      matchingFactors: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Key matching characteristics like color, brand, location',
                      },
                    },
                    required: ['candidateId', 'score', 'confidence', 'explanation', 'matchingFactors'],
                  },
                },
              },
              required: ['matches'],
            },
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          res.json(parsed);
          return;
        }
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to heuristic matching:', geminiError);
      }
    }

    // Fallback: heuristic matcher
    const matches = candidates
      .map(candidate => heuristicMatch(sourceItem, candidate))
      .filter(m => m.score >= 35)
      .sort((a, b) => b.score - a.score);

    res.json({ matches });
  } catch (error) {
    console.error('Error in /api/match-items:', error);
    res.status(500).json({ error: 'Failed to process item matching' });
  }
});

// Endpoint: Smart auto-assist for photos (extract suggested title, category, description)
apiRouter.post('/analyze-photo', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body as { imageBase64: string; mimeType: string };
    if (!imageBase64) {
      res.status(400).json({ error: 'Image data required' });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.json({
        suggestedTitle: 'Item',
        suggestedCategory: 'Other',
        suggestedDescription: 'Item photographed on campus.',
      });
      return;
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this image of a lost or found item on a college campus.
Extract:
1. A concise, descriptive title (e.g. "Space Grey MacBook Pro with Stickers", "Blue Hydro Flask with Dent")
2. The best category from: ["Electronics", "IDs & Cards", "Keys", "Bags & Backpacks", "Clothing & Apparel", "Books & Stationery", "Personal Accessories", "Other"]
3. A clear, helpful 2-sentence physical description noting color, brand, condition, and notable features.
`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            suggestedCategory: { type: Type.STRING },
            suggestedDescription: { type: Type.STRING },
            suggestedColor: { type: Type.STRING },
          },
          required: ['suggestedTitle', 'suggestedCategory', 'suggestedDescription'],
        },
      },
    });

    const text = response.text;
    if (text) {
      res.json(JSON.parse(text));
    } else {
      res.json({
        suggestedTitle: 'Item',
        suggestedCategory: 'Other',
        suggestedDescription: 'Campus item.',
      });
    }
  } catch (error) {
    console.error('Error in /api/analyze-photo:', error);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// Endpoint: Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ReFound Campus Lost & Found API' });
});
