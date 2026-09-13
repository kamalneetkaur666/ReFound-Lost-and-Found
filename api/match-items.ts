import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
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

function heuristicMatch(source: ItemSummary, candidate: ItemSummary) {
  let score = 0;
  const factors: string[] = [];

  if (source.category.toLowerCase() === candidate.category.toLowerCase()) {
    score += 35;
    factors.push(`Same category: ${source.category}`);
  }

  const sourceWords = (source.title + ' ' + source.description).toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const candWords = (candidate.title + ' ' + candidate.description).toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const commonWords = sourceWords.filter(w => candWords.includes(w));
  const uniqueCommon = Array.from(new Set(commonWords));

  if (uniqueCommon.length > 0) {
    const wordBonus = Math.min(35, uniqueCommon.length * 10);
    score += wordBonus;
    factors.push(`Matching keywords: ${uniqueCommon.slice(0, 3).join(', ')}`);
  }

  const sourceLoc = source.location.toLowerCase();
  const candLoc = candidate.location.toLowerCase();
  if (sourceLoc === candLoc || sourceLoc.includes(candLoc) || candLoc.includes(sourceLoc)) {
    score += 20;
    factors.push('Similar or overlapping campus location');
  }

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sourceItem, candidates } = (req.body || {}) as { sourceItem: ItemSummary; candidates: ItemSummary[] };

    if (!sourceItem || !Array.isArray(candidates) || candidates.length === 0) {
      return res.json({ matches: [] });
    }

    const ai = getGenAI();

    if (!ai) {
      const heuristicMatches = candidates
        .map(c => heuristicMatch(sourceItem, c))
        .filter(m => m.score >= 35)
        .sort((a, b) => b.score - a.score);
      return res.json({ matches: heuristicMatches });
    }

    const prompt = `You are the AI Match Engine for ReFound, a university campus Lost & Found platform.
Analyze the newly reported item against candidate items of the opposite type.

TARGET ITEM:
- Type: ${sourceItem.type.toUpperCase()}
- Title: ${sourceItem.title}
- Category: ${sourceItem.category}
- Description: ${sourceItem.description}
- Campus Location: ${sourceItem.location}
- Date: ${sourceItem.date} ${sourceItem.time || ''}

CANDIDATES:
${candidates
  .map(
    (c, idx) => `
Candidate #${idx + 1} (ID: ${c.id}):
- Title: ${c.title}
- Category: ${c.category}
- Description: ${c.description}
- Location: ${c.location}
- Date: ${c.date} ${c.time || ''}
`
  )
  .join('\n')}

Evaluate each candidate carefully. Return a match score between 0 and 100, confidence ('high' | 'medium' | 'low'), a brief constructive explanation for students, and key matching factors.
Only include candidates with a match score >= 35.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
                  score: { type: Type.NUMBER },
                  confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                  explanation: { type: Type.STRING },
                  matchingFactors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
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

    const parsed = JSON.parse(response.text || '{"matches": []}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Vercel API error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message });
  }
}
