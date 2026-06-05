import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const client = new Anthropic();

const PROMPT = `Analyze this photograph and return ONLY valid JSON with this exact structure:
{
  "description": "One sentence describing the main subject and scene.",
  "textures": ["texture1", "texture2"],
  "mood": ["mood1", "mood2"]
}

For textures: use descriptive material/surface terms like "rough stone", "smooth metal", "bokeh", "grainy film", "soft fabric", "wet", "weathered wood", "glossy".
For mood: use atmosphere terms like "warm", "melancholy", "energetic", "serene", "dramatic", "nostalgic", "bright", "moody".
Limit textures to 8 items and mood to 5 items. Return only the JSON, no other text.`;

export async function analyzeWithClaude(thumbnailPath) {
  const imageData = readFileSync(thumbnailPath).toString('base64');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: imageData },
          },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });

  const text = response.content[0].text.trim();
  // Extract JSON even if model wraps it in code fences
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in Claude response');
  return JSON.parse(match[0]);
}
