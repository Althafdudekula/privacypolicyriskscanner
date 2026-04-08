// Direct REST call to Groq's OpenAI-compatible API — no SDK needed in browser
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const MAX_RETRIES = 2;
const MAX_CHARS = 12000;
const REQUEST_TIMEOUT_MS = 60000;

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

// Returns a signal that aborts when ANY of the given signals abort
function anyAborted(signals) {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) { controller.abort(); break; }
    sig.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}

export async function analyzePolicy(policyText, apiKey, signal) {
  if (!apiKey) throw new Error('API Key is missing');

  const trimmedText = policyText.length > MAX_CHARS
    ? policyText.slice(0, MAX_CHARS) + '\n\n[Text truncated to fit analysis limit]'
    : policyText;

  const requestBody = JSON.stringify({
    model: GROQ_MODEL,
    temperature: 0,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: trimmedText }
    ]
  });

  // Yield so React renders the loading state before the first network call
  await sleep(50);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Analysis cancelled.');

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
    const combinedSignal = signal
      ? anyAborted([signal, timeoutController.signal])
      : timeoutController.signal;

    let response;
    try {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
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
        const waitTime = (attempt + 1) * 20000 + Math.random() * 5000;
        console.warn(`Rate limited (429). Retrying in ${Math.round(waitTime / 1000)}s...`);
        await sleep(waitTime);
        continue;
      }
      throw new Error('API rate limit reached. Please wait a moment and try again.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Groq raw response]', data); // debug log

    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Empty response from Groq. Please try again.');

    // Strip accidental markdown fences
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText);
    console.log('[Groq parsed result]', parsed); // debug log
    return parsed;
  }
}
