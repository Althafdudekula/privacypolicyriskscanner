const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const SYSTEM_PROMPT = `You are a professional privacy policy risk analyst. 
Analyze the following privacy policy text and return a structured JSON assessment that is clear, professional, and easy to understand for a non-legal audience.

JSON Schema Requirement:
{
  "score": number (0-100, where 100 is perfectly safe and 0 is extremely risky),
  "summary": "string (a high-level professional summary of the policy)",
  "risks": [
    {
      "text": "string (the specific sentence or clause from the policy)",
      "level": "Low | Medium | High",
      "reason": "string (short, clear explanation of the risk)",
      "rewrite": "string (a safer, more privacy-respecting version of the line)"
    }
  ],
  "categories": {
    "data_collection": number (0-100 score for this specific category),
    "data_sharing": number (0-100 score for this specific category),
    "data_retention": number (0-100 score for this specific category),
    "consent": number (0-100 score for this specific category)
  }
}

Guidelines:
1. Provide a balanced analysis.
2. Identify at least 5-8 specific risky statements if present.
3. The "rewrite" should be practical and professional.
4. Score categories accurately based on industry standards (GDPR, CCPA).
5. Ensure the response is ONLY the JSON object.`;

export async function analyzePolicy(policyText, apiKey) {
  if (!apiKey) throw new Error('API Key is missing');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: policyText }] }],
      generationConfig: {
        temperature: 0,
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

