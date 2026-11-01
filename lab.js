/**
 * Aman Atar — Interactive Stochastic & Causality Lab
 * Simulates Bates SVJD Price Dynamics, Poisson Jumps, and Conformal Coverage
 * Contrasts Causal Point-in-Time Filtration (F_t) against Lookahead Leakage (F_{t+k})
 * Zero external libraries · Pure HTML5 Canvas & Vanilla JS
 */

(function () {
  'use strict';

  const canvas = document.getElementById('lab-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const container = canvas.parentElement;

  // State
  let mode = 'causal'; // 'causal' | 'lookahead'
  let jumpIntensity = 1.2; // lambda: 0.0 - 3.0
  let volatility = 0.28; // sigma: 0.10 - 0.65
  let seedOffset = 42;

  const TOTAL_POINTS = 120;
  const CUTOFF_INDEX = 70; // 58% in-sample, 42% out-of-sample

  let pathData = null;
  let animProgress = 1.0;
  let isAnimating = false;

  // Box-Muller Gaussian PRNG with pseudo-random seed
  function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function generateGaussian(seedRef) {
    let u = 0, v = 0;
    while (u === 0) {
      u = seededRandom(seedRef.val++);
    }
    while (v === 0) {
      v = seededRandom(seedRef.val++);
    }
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Generate Bates SVJD Price Trajectory & Conformal Forecasts
  function computeSimulation() {
    const seedRef = { val: seedOffset * 1000 };
    const dt = 1 / 252;
    const mu = 0.06;

    const prices = new Float64Array(TOTAL_POINTS);
    const jumps = new Float64Array(TOTAL_POINTS);
    prices[0] = 100.0;

    let hasRecentJump = false;
    let maxDrawdown = 0.0;
    let peakPrice = prices[0];

    // Generate ground truth price path
    for (let i = 1; i < TOTAL_POINTS; i++) {
      const dW = generateGaussian(seedRef) * Math.sqrt(dt);
      let jumpSize = 0.0;

      // Poisson jump condition
      if (seededRandom(seedRef.val++) < jumpIntensity * dt * 2.5) {
        jumpSize = generateGaussian(seedRef) * 0.035 - 0.015; // Asymmetric negative bias
        jumps[i] = jumpSize;
        if (i >= CUTOFF_INDEX - 5) hasRecentJump = true;
      }

      const drift = (mu - 0.5 * volatility * volatility) * dt;
      const diffusion = volatility * dW;
      prices[i] = prices[i - 1] * Math.exp(drift + diffusion + jumpSize);

      if (prices[i] > peakPrice) peakPrice = prices[i];
      const dd = (peakPrice - prices[i]) / peakPrice;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // In-sample statistics up to cutoff
    let sumLogRet = 0;
    for (let i = 1; i <= CUTOFF_INDEX; i++) {
      sumLogRet += Math.log(prices[i] / prices[i - 1]);
    }
    const sampleDrift = (sumLogRet / CUTOFF_INDEX) * 252;
    const effectiveSigma = Math.sqrt(volatility * volatility + jumpIntensity * 0.035 * 0.035);

    // Build forecast and conformal bands
    const forecast = new Float64Array(TOTAL_POINTS);
    const upperBand = new Float64Array(TOTAL_POINTS);
    const lowerBand = new Float64Array(TOTAL_POINTS);

    let insideBandCount = 0;
    const oosTotal = TOTAL_POINTS - CUTOFF_INDEX;

    if (mode === 'causal') {
      // CAUSAL: Filtered strictly on F_t
      // In-sample fits causal moving center
      for (let i = 0; i <= CUTOFF_INDEX; i++) {
        forecast[i] = prices[i];
        const bandHalfWidth = 1.645 * effectiveSigma * Math.sqrt(Math.max(1, i) * dt * 0.4) * prices[i];
        upperBand[i] = prices[i] + bandHalfWidth;
        lowerBand[i] = Math.max(10, prices[i] - bandHalfWidth);
      }

      // Out-of-sample forward projection from cutoff price
      const basePrice = prices[CUTOFF_INDEX];
      for (let i = CUTOFF_INDEX; i < TOTAL_POINTS; i++) {
        const horizonDt = (i - CUTOFF_INDEX) * dt;
        forecast[i] = basePrice * Math.exp(sampleDrift * horizonDt);
        const margin = 1.645 * effectiveSigma * Math.sqrt(Math.max(0.01, horizonDt)) * forecast[i] * 2.2;
        upperBand[i] = forecast[i] + margin;
        lowerBand[i] = Math.max(10, forecast[i] - margin);

        if (prices[i] >= lowerBand[i] && prices[i] <= upperBand[i]) {
          insideBandCount++;
        }
      }
    } else {
      // LOOKAHEAD LEAKAGE: In-sample peeks into future points with artificial smoothness
      for (let i = 0; i <= CUTOFF_INDEX; i++) {
        // Lookahead smoothing across future points creates deceptive perfect fit
        const peekAheadIdx = Math.min(TOTAL_POINTS - 1, i + 12);
        forecast[i] = prices[i] * 0.7 + prices[peekAheadIdx] * 0.3;
        // Artificially narrow band in-sample (overconfidence)
        upperBand[i] = forecast[i] + 1.2;
        lowerBand[i] = forecast[i] - 1.2;
      }

      // Out-of-sample: The lookahead assumption collapses abruptly past cutoff!
      const lastPeek = forecast[CUTOFF_INDEX];
      for (let i = CUTOFF_INDEX; i < TOTAL_POINTS; i++) {
        const horizon = (i - CUTOFF_INDEX);
        // Catastrophic extrapolation divergence
        const divergence = horizon * horizon * 0.045;
        forecast[i] = lastPeek - divergence;
        // The overfit narrow band fails to cover the real volatility
        upperBand[i] = forecast[i] + 2.0;
        lowerBand[i] = forecast[i] - 2.0;

        if (prices[i] >= lowerBand[i] && prices[i] <= upperBand[i]) {
          insideBandCount++;
        }
      }
    }

    const coveragePct = ((insideBandCount / Math.max(1, oosTotal)) * 100).toFixed(1);

    // Regime label
    let regimeState = 'Low Vol Steady Drift';
    if (hasRecentJump || jumpIntensity >= 2.0) {
      regimeState = 'Jump Shock Active';
    } else if (volatility >= 0.35) {
      regimeState = 'High Vol Stressed';
    }

    return {
      prices,
      forecast,
      upperBand,
      lowerBand,
      coveragePct,
      maxDrawdownPct: (maxDrawdown * 100).toFixed(1),
      regimeState
    };
  }

  // Draw the simulation on canvas
  function renderLab() {
    if (!pathData) pathData = computeSimulation();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(200, Math.floor(rect.height || 280));

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const isParchment = document.documentElement.getAttribute('data-theme') === 'parchment';
    const gridColor = isParchment ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)';
    const textColor = isParchment ? '#6B6F76' : '#8A8F98';
    const priceColor = isParchment ? '#151618' : '#ECEBE6';
    const goldAccent = isParchment ? '#8C6D46' : '#C8A97E';
    const bandFill = mode === 'causal'
      ? (isParchment ? 'rgba(140, 109, 70, 0.12)' : 'rgba(200, 169, 126, 0.10)')
      : 'rgba(239, 68, 68, 0.14)';
    const bandStroke = mode === 'causal'
      ? (isParchment ? 'rgba(140, 109, 70, 0.35)' : 'rgba(200, 169, 126, 0.30)')
      : 'rgba(239, 68, 68, 0.40)';

    // Coordinate mapping
    let minVal = Infinity, maxVal = -Infinity;
    for (let i = 0; i < TOTAL_POINTS; i++) {
      minVal = Math.min(minVal, pathData.prices[i], pathData.lowerBand[i]);
      maxVal = Math.max(maxVal, pathData.prices[i], pathData.upperBand[i]);
    }
    const valRange = Math.max(10, maxVal - minVal);
    const padY = 24;
    const padX = 20;

    function getX(idx) {
      return padX + (idx / (TOTAL_POINTS - 1)) * (width - padX * 2);
    }
    function getY(val) {
      return height - padY - ((val - minVal) / valRange) * (height - padY * 2);
    }

    // Draw background grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let g = 1; g < 5; g++) {
      const gy = padY + (g / 5) * (height - padY * 2);
      ctx.beginPath();
      ctx.moveTo(padX, gy);
      ctx.lineTo(width - padX, gy);
      ctx.stroke();
    }

    const cutoffX = getX(CUTOFF_INDEX);

    // Shaded Out-of-Sample background region
    ctx.fillStyle = isParchment ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.015)';
    ctx.fillRect(cutoffX, padY, (width - padX) - cutoffX, height - padY * 2);

    // Vertical Cutoff Line
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = goldAccent;
    ctx.lineWidth = 1.25;
    ctx.moveTo(cutoffX, padY);
    ctx.lineTo(cutoffX, height - padY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cutoff text label
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = goldAccent;
    ctx.textAlign = 'right';
    ctx.fillText('In-Sample (t ≤ 70)', cutoffX - 8, padY + 12);
    ctx.textAlign = 'left';
    ctx.fillText('Out-of-Sample Horizon (F_t Boundary)', cutoffX + 8, padY + 12);

    // Draw Conformal Band (shaded area)
    ctx.beginPath();
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const x = getX(i);
      const y = getY(pathData.upperBand[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = TOTAL_POINTS - 1; i >= 0; i--) {
      const x = getX(i);
      const y = getY(pathData.lowerBand[i]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = bandFill;
    ctx.fill();
    ctx.strokeStyle = bandStroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Ground Truth Price Path (solid line)
    ctx.beginPath();
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const x = getX(i);
      const y = getY(pathData.prices[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = priceColor;
    ctx.lineWidth = 1.75;
    ctx.stroke();

    // Draw Forecast Path (dashed line)
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const x = getX(i);
      const y = getY(pathData.forecast[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = mode === 'causal' ? goldAccent : '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend on bottom of canvas
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    // True Price Legend
    ctx.fillStyle = priceColor;
    ctx.fillRect(padX + 6, height - 12, 10, 2);
    ctx.fillText('Simulated SVJD Price', padX + 22, height - 9);

    // Forecast Legend
    ctx.fillStyle = mode === 'causal' ? goldAccent : '#EF4444';
    ctx.fillRect(padX + 175, height - 12, 10, 2);
    ctx.fillText(mode === 'causal' ? 'Causal Forecast (F_t)' : 'Leaked Fit (Collapse)', padX + 191, height - 9);

    // Band Legend
    ctx.fillStyle = bandStroke;
    ctx.fillRect(padX + 345, height - 12, 10, 2);
    ctx.fillText(mode === 'causal' ? '90% Conformal Interval' : 'Overfit Narrow Band', padX + 361, height - 9);
  }

  // Update DOM Metrics elements
  function updateMetricsDisplay() {
    if (!pathData) return;

    const covEl = document.getElementById('metric-lab-coverage');
    const ddEl = document.getElementById('metric-lab-drawdown');
    const regimeEl = document.getElementById('metric-lab-regime');
    const modeEl = document.getElementById('metric-lab-mode');

    if (covEl) {
      covEl.textContent = pathData.coveragePct + '%';
      if (mode === 'causal') {
        covEl.className = 'metric-item-value success';
      } else {
        covEl.className = 'metric-item-value alert';
      }
    }

    if (ddEl) {
      ddEl.textContent = '-' + pathData.maxDrawdownPct + '%';
    }

    if (regimeEl) {
      regimeEl.textContent = pathData.regimeState;
      if (pathData.regimeState.includes('Shock')) {
        regimeEl.className = 'metric-item-value alert';
      } else if (pathData.regimeState.includes('Stressed')) {
        regimeEl.className = 'metric-item-value accent';
      } else {
        regimeEl.className = 'metric-item-value';
      }
    }

    if (modeEl) {
      modeEl.textContent = mode === 'causal' ? 'Point-in-Time F_t [Causal]' : 'Lookahead Leaked F_{t+k} [Biased]';
      modeEl.className = mode === 'causal' ? 'metric-item-value success' : 'metric-item-value alert';
    }
  }

  // Refresh entire simulation
  function refresh() {
    pathData = computeSimulation();
    renderLab();
    updateMetricsDisplay();
  }

  // Event Listeners for Controls
  const btnCausal = document.getElementById('lab-btn-causal');
  const btnLeaked = document.getElementById('lab-btn-leaked');
  const sliderJump = document.getElementById('lab-slider-jump');
  const sliderVol = document.getElementById('lab-slider-vol');
  const labelJump = document.getElementById('lab-val-jump');
  const labelVol = document.getElementById('lab-val-vol');
  const btnSeed = document.getElementById('lab-btn-seed');

  if (btnCausal && btnLeaked) {
    btnCausal.addEventListener('click', function () {
      mode = 'causal';
      btnCausal.classList.add('is-active');
      btnLeaked.classList.remove('is-active');
      refresh();
    });

    btnLeaked.addEventListener('click', function () {
      mode = 'lookahead';
      btnLeaked.classList.add('is-active');
      btnCausal.classList.remove('is-active');
      refresh();
    });
  }

  if (sliderJump) {
    sliderJump.addEventListener('input', function (e) {
      jumpIntensity = parseFloat(e.target.value);
      if (labelJump) labelJump.textContent = jumpIntensity.toFixed(1);
      refresh();
    });
  }

  if (sliderVol) {
    sliderVol.addEventListener('input', function (e) {
      volatility = parseFloat(e.target.value) / 100.0;
      if (labelVol) labelVol.textContent = Math.round(volatility * 100) + '%';
      refresh();
    });
  }

  if (btnSeed) {
    btnSeed.addEventListener('click', function () {
      seedOffset += 7;
      refresh();
    });
  }

  // Window resize handler
  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      renderLab();
    }, 120);
  });

  // Re-render when theme changes
  const themeObserver = new MutationObserver(function () {
    renderLab();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Initial load
  refresh();
})();
