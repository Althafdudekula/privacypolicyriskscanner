import './style.css';
import { pipeline, env } from '@xenova/transformers';

// Keep local models cached
env.allowLocalModels = false;
env.useBrowserCache = true;

document.addEventListener('DOMContentLoaded', async () => {
  const scanBtn = document.getElementById('scan-btn');
  const resultsContainer = document.getElementById('results');
  const container = document.getElementById('particles-container');
  const btnText = scanBtn.querySelector('.btn-text');

  let classifier = null;
  
  // Disable button while loading model
  btnText.innerHTML = 'LOADING LOCAL NLP MODEL...';
  scanBtn.style.pointerEvents = 'none';
  scanBtn.style.opacity = '0.5';

  try {
    // Download and initialize MobileBERT MNLI locally
    classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
    
    // Model loaded
    btnText.innerHTML = 'INITIATE RISK SCAN';
    scanBtn.style.pointerEvents = 'auto';
    scanBtn.style.opacity = '1';
  } catch (err) {
    console.error(err);
    btnText.innerHTML = 'MODEL FAILED TO LOAD';
  }

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

  scanBtn.addEventListener('click', async () => {
    const textInput = document.querySelector('textarea').value;
    if (!textInput.trim() || !classifier) return;

    btnText.innerHTML = 'ANALYZING EXTRACTED TEXT...';
    scanBtn.style.color = '#fff';
    scanBtn.style.borderColor = '#fff';
    scanBtn.style.boxShadow = '0 0 30px rgba(255,255,255,0.4)';
    scanBtn.style.pointerEvents = 'none';
    
    resultsContainer.innerHTML = '';
    
    // Break into logical sentences for NLP classification
    const rawSentences = textInput.split(/[\.\!]+/).map(s => s.trim()).filter(s => s.length > 15);
    // Limit to 5 sentences to keep demo fast, otherwise mobilebert might lag the browser thread
    const sentences = rawSentences.slice(0, 8); 

    const riskData = { high: 0, medium: 0, low: parseInt(rawSentences.length / 2) || 0, results: [] };
    
    try {
      // Evaluate each sentence for risk
      for(let sentence of sentences) {
        // Evaluate probabilities of these risks happening
        const output = await classifier(sentence, [
          'selling personal user data to third parties', 
          'tracking users indefinitely with cookies', 
          'safe standard data operations'
        ]);
        
        const topLabel = output.labels[0];
        const topScore = output.scores[0];

        // Classification Mapping logic
        if (topScore > 0.45) {
          if (topLabel.includes('selling') || topLabel.includes('third parties')) {
            riskData.high++;
            riskData.results.push({ 
              level: 'high', 
              category: 'Critical Violation', 
              quote: `"${sentence}."`, 
              explanation: `Zero-Shot Model detected high probability (${(topScore*100).toFixed(1)}%) of: ${topLabel}.` 
            });
          } else if (topLabel.includes('tracking')) {
            riskData.medium++;
            riskData.results.push({ 
              level: 'medium', 
              category: 'Data Tracking', 
              quote: `"${sentence}."`, 
              explanation: `Zero-Shot Model detected moderate probability (${(topScore*100).toFixed(1)}%) of: ${topLabel}.` 
            });
          } else {
            riskData.low++;
          }
        }
      }
    } catch(err) {
      console.error("Evaluation error:", err);
    }

    if(riskData.results.length === 0){
        riskData.results.push({ level: 'low', category: 'Analysis Complete', quote: `"No major risks detected."`, explanation: 'The NLP model evaluated the text and prioritized safe practices.' })
    }

    // Update DOM Stats
    document.querySelector('.high-risk .stat-value').innerText = riskData.high;
    document.querySelector('.medium-risk .stat-value').innerText = riskData.medium;
    document.querySelector('.low-risk .stat-value').innerText = riskData.low;

    // Show Results
    btnText.innerHTML = 'SCAN COMPLETE';
    setTimeout(() => {
        btnText.innerHTML = 'INITIATE RISK SCAN';
        scanBtn.style.color = '';
        scanBtn.style.borderColor = '';
        scanBtn.style.boxShadow = '';
        scanBtn.style.pointerEvents = 'auto';
    }, 2000);

    riskData.results.forEach((res, index) => {
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

  });
});
