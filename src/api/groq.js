import Groq from 'groq-sdk';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const MAX_RETRIES = 2;
const MAX_CHARS = 12000; // ~3,000 tokens — safe for free tier

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

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  // Truncate to stay within token limits
  const trimmedText = policyText.length > MAX_CHARS
    ? policyText.slice(0, MAX_CHARS) + '\n\n[Text truncated to fit analysis limit]'
    : policyText;

  // Yield so React renders the loading state before the first network call
  await sleep(50);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Check if user cancelled
    if (signal?.aborted) throw new Error('Analysis cancelled.');

    let completion;
    try {
      completion = await client.chat.completions.create(
        {
          model: GROQ_MODEL,
          temperature: 0,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: trimmedText }
          ]
        },
        { signal }
      );
    } catch (err) {
      if (signal?.aborted || err.name === 'AbortError') throw new Error('Analysis cancelled.');

      // Groq rate-limit errors surface as status 429
      const status = err?.status ?? err?.response?.status;
      if (status === 429 && attempt < MAX_RETRIES) {
        const waitTime = (attempt + 1) * 20000 + Math.random() * 5000;
        console.warn(`Rate limited (429). Retrying in ${Math.round(waitTime / 1000)}s...`);
        await sleep(waitTime);
        continue;
      }

      if (status === 429) {
        throw new Error('API rate limit reached. Please wait a moment and try again with a shorter text.');
      }

      throw err;
    }

    const rawText = completion.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Empty response from Groq. Please try again.');

    // Strip accidental markdown fences just in case
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
    cleanText = cleanText.trim();

    return JSON.parse(cleanText);
  }
}
