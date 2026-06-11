import axios from 'axios';
import { getGroqKey } from './storageService';
import { PROMPTS } from '../constants/prompts';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(messages, apiKey, maxTokens = 4000) {
  const key = apiKey || (await getGroqKey()) || process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error('No Groq API key found. Please add one in Settings.');

  const response = await axios.post(
    GROQ_BASE_URL,
    {
      model: DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.9,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  ).catch(err => {
    const detail = err?.response?.data?.error?.message || err.message;
    throw new Error(detail);
  });

  return response.data.choices[0].message.content;
}

function parseJSON(raw) {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateCase() {
  const prompt = PROMPTS.generateCase();
  const raw = await callGroq(
    [{ role: 'user', content: prompt }],
    null,
    4000
  );
  return parseJSON(raw);
}

export async function judgeTheory(caseData, theory) {
  const prompt = PROMPTS.judgeTheory(caseData, theory);
  const raw = await callGroq(
    [{ role: 'user', content: prompt }],
    null,
    1000
  );
  return parseJSON(raw);
}

export async function interrogate(caseData, question, history = []) {
  const systemPrompt = PROMPTS.interrogate(caseData, question, history);
  const raw = await callGroq(
    [{ role: 'user', content: systemPrompt }],
    null,
    300
  );
  return raw;
}

export async function generateDidYouKnow(caseData) {
  const prompt = PROMPTS.generateDidYouKnow(caseData);
  const raw = await callGroq(
    [{ role: 'user', content: prompt }],
    null,
    300
  );
  return parseJSON(raw);
}
