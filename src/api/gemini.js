const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_CHARS = 12000;

export const SYSTEM_PROMPT = `You are a professional privacy policy risk analyst. Analyze the provided privacy policy text and return ONLY a valid JSON object.

The JSON must follow this exact schema:
{
  "score": <integer 0-100, where 100 = perfectly safe, 0 = extremely risky>,
  "summary": "<2-3 sentence professional summary>",
  "risks": [
    {
      "text": "<quoted clause>",
      "level": "<High | Medium | Low>",
      "reason": "<explanation>",
      "rewrite": "<safer version>"
    }
  ],
  "categories": {
    "data_collection": <integer 0-100>,
    "data_sharing": <integer 0-100>,
    "data_retention": <integer 0-100>,
    "user_control": <integer 0-100>
  }
}

Scoring Rules (CRITICAL):
- 100 is ONLY for policies that collect zero PII and share nothing.
- If data is shared with third-party advertisers, "data_sharing" MUST be below 40.
- If data is SOLD to third parties, "data_sharing" MUST be below 15 and the overall "score" MUST be below 30.
- If there is no "Right to be Forgotten" or account deletion mentioned, "user_control" MUST be below 40.
- If any "High" level risk is identified, the overall "score" MUST NOT exceed 50.
- All scores must be plain integers. Return ONLY JSON.`;

export async function analyzePolicy(policyText, apiKey, signal) {
  if (!apiKey) throw new Error('API Key is missing. Please set VITE_GROQ_API_KEY in your .env file.');

  const trimmedText =
    policyText.length > MAX_CHARS
      ? policyText.slice(0, MAX_CHARS) + '\n\n[Text truncated for analysis]'
      : policyText;

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: trimmedText },
          ],
          temperature: 0.2,
          max_tokens: 2048,
          response_format: { type: 'json_object' },
        }),
        signal,
      });

      if (response.status === 429 && attempt < MAX_RETRIES - 1) {
        const baseDelay = 8000;
        const waitTime = (attempt + 1) * baseDelay + Math.random() * 3000;
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.error?.message || `API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;

      if (!rawText) throw new Error('Empty response from API.');

      // Strip any accidental markdown fences
      const clean = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      const parsed = JSON.parse(clean);

      // Coerce score and category values to numbers in case API returns strings
      parsed.score = Number(parsed.score) || 0;
      if (parsed.categories) {
        for (const key of Object.keys(parsed.categories)) {
          parsed.categories[key] = Number(parsed.categories[key]) || 0;
        }
      }

      return parsed;
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Analysis cancelled.');
      if (attempt === MAX_RETRIES - 1) throw err;
    }
  }
}
