const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_RETRIES = 2;
const MAX_CHARS = 12000; // ~3,000 tokens — safe for free tier
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds max per attempt

export const SYSTEM_PROMPT = `You are a privacy policy risk analyst. Analyze the text and return ONLY a raw JSON object (no markdown, no code blocks, no extra text).

Return this exact JSON structure:
{
  "score": <number 0-100, where 100 = perfectly safe, 0 = extremely risky>,
  "summary": "<2-3 sentence professional summary>",
  "risks": [
    {
      "text": "<exact quote from the policy>",
      "level": "<High|Medium|Low>",
      "reason": "<why this is risky>",
      "rewrite": "<safer version of this clause>"
    }
  ],
  "categories": {
    "data_collection": <number 0-100>,
    "data_sharing": <number 0-100>,
    "data_retention": <number 0-100>,
    "consent": <number 0-100>
  }
}

Rules:
- Return ONLY the JSON object. No markdown. No \`\`\`. No explanation.
- Identify 3-6 specific risky clauses.
- Score accurately based on GDPR/CCPA standards.`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzePolicy(policyText, apiKey, signal) {
  if (!apiKey) throw new Error('API Key is missing');

  // Truncate to stay within free-tier token limits
  const trimmedText = policyText.length > MAX_CHARS
    ? policyText.slice(0, MAX_CHARS) + '\n\n[Text truncated to fit analysis limit]'
    : policyText;

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: trimmedText }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json'
    }
  });

  // Yield so React renders the loading state before the first network call
  await sleep(50);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Check if user cancelled
    if (signal?.aborted) throw new Error('Analysis cancelled.');

    // Per-request timeout using AbortController
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

    // Merge user cancel signal + timeout signal
    const combinedSignal = signal
      ? anyAborted([signal, timeoutController.signal])
      : timeoutController.signal;

    let response;
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
        signal: combinedSignal
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (signal?.aborted) throw new Error('Analysis cancelled.');
      if (err.name === 'AbortError') throw new Error('Request timed out after 60 seconds. Please try again.');
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 429) {
      if (attempt < MAX_RETRIES) {
        // Exponential backoff with a bit of jitter: 20s, 40s, 60s
        const baseDelay = 20000;
        const jitter = Math.random() * 5000;
        const waitTime = (attempt + 1) * baseDelay + jitter;
        
        console.warn(`Rate limited (429). Retrying in ${Math.round(waitTime / 1000)}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(waitTime);
        continue;
      }
      throw new Error('API rate limit reached. The Google Gemini free tier has strict quotas. Please wait a minute and try again with a shorter text.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error('Empty response from Gemini. Please try again.');

    // Strip markdown code fences if API wraps JSON in them
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
    cleanText = cleanText.trim();

    return JSON.parse(cleanText);
  }
}

// Helper: returns a signal that aborts when ANY of the given signals abort
function anyAborted(signals) {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) { controller.abort(); break; }
    sig.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}
