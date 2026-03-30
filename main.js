import './style.css';

const MOCK_RESULTS = [
  {
    level: 'high',
    category: 'Data Sharing',
    quote: '"We may share your personal data with third-party partners for marketing without explicit consent."',
    explanation: 'Automatically shares your data with advertisers. High risk of data proliferation.'
  },
  {
    level: 'medium',
    category: 'Retention',
    quote: '"We retain your data as long as necessary for our business operations."',
    explanation: 'Vague data retention policy with no clear deletion timeline.'
  },
  {
    level: 'low',
    category: 'Encryption',
    quote: '"All user data is encrypted at rest using AES-256 standards."',
    explanation: 'Standard security practice correctly implemented.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scan-btn');
  const resultsContainer = document.getElementById('results');
  const container = document.getElementById('particles-container');

  // Generate background particles
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 3 + 1;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.top = `${Math.random() * 100}vh`;
    container.appendChild(p);

    animateParticle(p);
  }

  function animateParticle(p) {
    const duration = Math.random() * 20000 + 10000;
    p.animate([
      { transform: 'translate(0, 0)' },
      { transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px)` }
    ], {
      duration,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out'
    });
  }

  scanBtn.addEventListener('click', () => {
    const textInput = document.querySelector('textarea').value;
    const btnText = scanBtn.querySelector('.btn-text');
    btnText.innerHTML = 'SCANNING...';
    scanBtn.style.color = '#fff';
    scanBtn.style.borderColor = '#fff';
    scanBtn.style.boxShadow = '0 0 30px rgba(255,255,255,0.4)';
    
    // Clear old results
    resultsContainer.innerHTML = '';
    
    setTimeout(() => {
      btnText.innerHTML = 'SCAN COMPLETE';
      setTimeout(() => {
        btnText.innerHTML = 'INITIATE RISK SCAN';
        scanBtn.style.color = '';
        scanBtn.style.borderColor = '';
        scanBtn.style.boxShadow = '';
      }, 2000);

      // Simple mock logic: generate counts based on if text is provided
      const hasText = textInput.trim().length > 0;
      const highCount = hasText ? Math.floor(Math.random() * 5) + 1 : 0;
      const medCount = hasText ? Math.floor(Math.random() * 8) + 1 : 0;
      const lowCount = hasText ? Math.floor(Math.random() * 15) + 2 : 0;

      // Update DOM for the dashboard stats
      document.querySelector('.high-risk .stat-value').innerText = highCount;
      document.querySelector('.medium-risk .stat-value').innerText = medCount;
      document.querySelector('.low-risk .stat-value').innerText = lowCount;

      // If text exists, show MOCK_RESULTS, otherwise show none
      if (hasText) {
        MOCK_RESULTS.forEach((res, index) => {
          const resultCard = document.createElement('div');
          resultCard.className = `result-card risk-${res.level}`;
          resultCard.style.animationDelay = `${index * 0.2}s`;
          
          resultCard.innerHTML = `
            <div class="result-header">
              <span class="badge">${res.level.toUpperCase()} RISK</span>
              <span class="category">${res.category}</span>
            </div>
            <p class="quote">${res.quote}</p>
            <p class="explanation">${res.explanation}</p>
          `;
          resultsContainer.appendChild(resultCard);
        });
      } else {
        resultsContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary); margin-top: 20px;">No policy text provided. Found 0 risks.</p>';
      }
    }, 1500);
  });
});
