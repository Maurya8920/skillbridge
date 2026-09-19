const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiError } = require('../utils/response');

// In-memory rate limiting: max 20 AI calls per user per hour
const userCallMap = new Map();
const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_CALLS_PER_HOUR = 20;

const checkRateLimit = (userId) => {
  if (!userId) return;
  const idStr = String(userId);
  const now = Date.now();
  const history = (userCallMap.get(idStr) || []).filter((timestamp) => now - timestamp < ONE_HOUR_MS);

  if (history.length >= MAX_CALLS_PER_HOUR) {
    throw new ApiError(429, 'Rate limit exceeded: maximum 20 AI requests per user per hour');
  }

  history.push(now);
  userCallMap.set(idStr, history);
};

const stripCodeFences = (text) => {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

const parseJsonSafely = (rawText) => {
  const cleaned = stripCodeFences(rawText);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt to extract json object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err2) {
        // Fall-through to error
      }
    }
    throw new ApiError(503, 'AI service unavailable');
  }
};

/**
 * Generate content using Google Gemini API with smart resilient model fallback
 * @param {string} prompt
 * @param {{ json?: boolean, userId?: string|object }} options
 * @returns {Promise<string|object>}
 */
const generate = async (prompt, { json = false, userId = null } = {}) => {
  if (userId) {
    checkRateLimit(userId);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    throw new ApiError(503, 'AI service unavailable');
  }

  const userModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  // Candidate fallback list to ensure high resilience against 404s (deprecated) and 503s (demand spikes)
  const modelsToTry = [userModel, 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
  const uniqueModels = [...new Set(modelsToTry)];

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: json ? { responseMimeType: 'application/json' } : undefined,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (json) {
        return parseJsonSafely(text);
      }
      return text.trim();
    } catch (err) {
      lastError = err;
      const isRetryable = err.status === 404 || err.status === 503 || err.status === 429 ||
        (err.message && (err.message.includes('404') || err.message.includes('503') || err.message.includes('429')));
      if (isRetryable) {
        console.warn(`Model ${modelName} returned status ${err.status || 'retryable'}, trying fallback model...`);
        continue;
      }
      break;
    }
  }

  if (lastError instanceof ApiError) {
    throw lastError;
  }
  console.error('Gemini API Error after fallbacks:', lastError?.message || lastError);
  throw new ApiError(503, 'AI service unavailable');
};

module.exports = {
  generate,
  checkRateLimit,
  userCallMap,
};
