const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const SYSTEM_PROMPT = `You are a privacy policy risk analyst. Analyze the following privacy policy text and return a structured JSON assessment.

For each distinct risk or finding, create an entry. Return ONLY valid JSON — no markdown, no code fences, no explanation outside JSON.

JSON schema:
{
  "overallScore": <number 0-100, where 0=extremely dangerous, 100=perfectly safe>,
  "summary": "<one-sentence overall assessment>",
  "findings": [
    {
      "level": "high" | "medium" | "low",
      "category": "<short category name, e.g. 'Data Selling', 'Tracking', 'User Rights', 'Data Retention', 'Third-Party Sharing', 'Data Collection'>",
      "quote": "<exact or near-exact quote from the policy that triggered this finding>",
      "explanation": "<clear, plain-English explanation of why this is risky or safe, and what it means for users>",
      "safer_version": "<a re-phrased, privacy-respecting version of the original quote for comparison>"
    }
  ]
}

Guidelines:
- High risk: data selling, indefinite tracking, no opt-out, children's data misuse, no breach notification
- Always include at least 5 findings for a comprehensive analysis.
- Quotes should be from the actual policy text.
- Create a "safer_version" that would make the policy much more privacy-friendly (e.g., opting-out by default instead of opt-in, no third-party selling, etc.).`;

export async function analyzePolicy(policyText, apiKey) {
  if (!apiKey) throw new Error('API Key is missing');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: policyText }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || 'API request failed');
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error('Empty response from Gemini');

  return JSON.parse(rawText);
}
