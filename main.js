import './style.css';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are a privacy policy risk analyst. Analyze the following privacy policy text and return a structured JSON assessment.

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
      "explanation": "<clear, plain-English explanation of why this is risky or safe, and what it means for users>"
    }
  ]
}

Guidelines:
- Be thorough: check for data collection, sharing, selling, tracking, retention, user rights, consent, children's data, breach notification, international transfers
- High risk: data selling, indefinite tracking, no opt-out, children's data misuse, no breach notification
- Medium risk: broad third-party sharing, long retention, vague language, limited opt-out
- Low risk: standard analytics, necessary cookies, clear opt-out, good practices
- Always include at least 3 findings
- Quotes should be from the actual policy text provided
- Keep explanations concise but informative (1-2 sentences)`;

document.addEventListener('DOMContentLoaded', () => {
  // Use environment variable for API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // DOM Elements
  const scanBtn = document.getElementById('scan-btn');
  const btnLabel = document.getElementById('btn-label');
  const statusText = document.getElementById('status-text');
  const statusDot = document.querySelector('.status-dot');
  const resultsContainer = document.getElementById('results');
  const overallScoreSection = document.getElementById('overall-score-section');
  const statsSection = document.getElementById('stats-section');
  const resultsSection = document.getElementById('results-container');

  // Initialization
  if (apiKey && !apiKey.includes('YOUR_API_KEY_HERE')) {
    scanBtn.disabled = false;
    statusText.textContent = 'Ready to scan';
    statusDot.className = 'status-dot ready';
  } else {
    scanBtn.disabled = true;
    statusText.textContent = 'Missing API Key in .env';
    statusDot.className = 'status-dot error';
  }

  // ============ Scan Handler ============
  scanBtn.addEventListener('click', async () => {
    const policyText = document.getElementById('policy-input').value.trim();
    if (!policyText || !apiKey) return;

    // UI → processing state
    scanBtn.disabled = true;
    btnLabel.textContent = 'Analyzing...';
    statusText.innerHTML = 'Gemini is reading the policy <span class="loading-dots"><span></span><span></span><span></span></span>';
    statusDot.className = 'status-dot processing';
    resultsContainer.innerHTML = '';
    overallScoreSection.style.display = 'none';
    statsSection.style.display = 'none';
    resultsSection.style.display = 'none';

    try {
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

      // Parse the JSON response
      const analysis = JSON.parse(rawText);

      // ============ Render Results ============
      renderResults(analysis);

    } catch (err) {
      console.error('Analysis error:', err);
      statusText.textContent = `Error: ${err.message}`;
      statusDot.className = 'status-dot error';
      resultsContainer.innerHTML = `
        <div class="result-item risk-high" style="opacity:1;">
          <div class="result-header">
            <span class="badge">error</span>
            <span class="category">Analysis Failed</span>
          </div>
          <p class="explanation">${err.message}</p>
        </div>`;
      resultsSection.style.display = 'block';
    } finally {
      scanBtn.disabled = false;
      btnLabel.textContent = 'Analyze Policy';
    }
  });

  function renderResults(analysis) {
    const { overallScore, summary, findings } = analysis;

    // Show sections
    overallScoreSection.style.display = 'flex';
    statsSection.style.display = 'grid';
    resultsSection.style.display = 'block';

    // --- Score Ring ---
    const scoreValue = document.getElementById('score-value');
    const scoreRingFill = document.getElementById('score-ring-fill');
    const scoreLabel = document.getElementById('score-label');

    const circumference = 2 * Math.PI * 52; // r=52
    const offset = circumference - (overallScore / 100) * circumference;

    // Color based on score
    let scoreColor;
    if (overallScore >= 70) scoreColor = 'var(--color-low)';
    else if (overallScore >= 40) scoreColor = 'var(--color-medium)';
    else scoreColor = 'var(--color-high)';

    scoreRingFill.style.stroke = scoreColor;
    scoreRingFill.style.strokeDashoffset = offset;
    scoreLabel.textContent = summary || 'Risk Score';

    // Animate counter
    animateCounter(scoreValue, overallScore);

    // --- Stats ---
    let highCount = 0, mediumCount = 0, lowCount = 0;
    findings.forEach(f => {
      if (f.level === 'high') highCount++;
      else if (f.level === 'medium') mediumCount++;
      else lowCount++;
    });

    animateCounter(document.getElementById('count-high'), highCount);
    animateCounter(document.getElementById('count-medium'), mediumCount);
    animateCounter(document.getElementById('count-low'), lowCount);

    // --- Result Cards ---
    resultsContainer.innerHTML = '';
    findings.forEach((finding, i) => {
      const card = document.createElement('div');
      card.className = `result-item risk-${finding.level}`;
      card.style.animationDelay = `${i * 0.1}s`;

      card.innerHTML = `
        <div class="result-header">
          <span class="badge">${finding.level} risk</span>
          <span class="category">${escapeHTML(finding.category)}</span>
        </div>
        <div class="quote">${escapeHTML(finding.quote)}</div>
        <p class="explanation">${escapeHTML(finding.explanation)}</p>
      `;

      resultsContainer.appendChild(card);
    });

    // Status → complete
    statusText.textContent = `Scan complete · Score: ${overallScore}/100`;
    document.querySelector('.status-dot').className = 'status-dot ready';
  }

  function animateCounter(el, target) {
    const duration = 1200;
    const start = performance.now();
    const initial = 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(initial + (target - initial) * ease);

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
