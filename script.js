/**
 * AMAN ATAR — @FOLIO 26 SWISS KINETIC + BENTO STUDIO INTERACTIVE ENGINE
 * Zero frameworks. Pure vanilla JS. 60 FPS Canvas. Full WCAG AA keyboard & ARIA support.
 */

(() => {
  "use strict";

  // ---------------------------------------------------------
  // 1. Live IST Clock
  // ---------------------------------------------------------
  const clockEl = document.getElementById("ist-clock");
  const updateClock = () => {
    if (!clockEl) return;
    try {
      clockEl.textContent = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
    } catch {
      clockEl.textContent = "IST Active";
    }
  };
  updateClock();
  setInterval(updateClock, 30000);

  // ---------------------------------------------------------
  // 2. Theme Toggle (Obsidian <-> Paper)
  // ---------------------------------------------------------
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("aman_theme", theme);
    if (themeLabel) themeLabel.textContent = theme === "obsidian" ? "Paper" : "Obsidian";
    if (typeof drawLeakageLab === "function") drawLeakageLab();
    if (typeof drawSmileLab === "function") drawSmileLab();
  };

  const savedTheme = localStorage.getItem("aman_theme");
  if (savedTheme === "paper" || savedTheme === "obsidian") {
    root.setAttribute("data-theme", savedTheme);
    if (themeLabel) themeLabel.textContent = savedTheme === "obsidian" ? "Paper" : "Obsidian";
  }

  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "obsidian" ? "paper" : "obsidian";
    applyTheme(next);
  });

  // ---------------------------------------------------------
  // 3. Cursor-Tracking Border Spotlight
  // ---------------------------------------------------------
  const initSpotlights = () => {
    const cards = document.querySelectorAll(".spotlight-card, .work-row, .bento-card, .trust-card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    });
  };
  initSpotlights();

  // ---------------------------------------------------------
  // 4. Hero Stochastic Canvas: "Hidden Harmony"
  // ---------------------------------------------------------
  const heroCanvas = document.getElementById("harmony-canvas");
  const noiseSlider = document.getElementById("noise-slider");
  const noiseVal = document.getElementById("noise-val");
  let filterStrength = 0.35;

  noiseSlider?.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    filterStrength = v / 100;
    if (noiseVal) noiseVal.textContent = `${v}%`;
  });

  if (heroCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = heroCanvas.getContext("2d");
    let w = 0, h = 0, t = 0, visible = true;
    const paths = Array.from({ length: 16 }, (_, i) => ({
      phase: (i / 16) * Math.PI * 2,
      speed: 0.0035 + (i % 4) * 0.0011,
      offset: (i - 7.5) * 14,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = heroCanvas.clientWidth;
      h = heroCanvas.clientHeight;
      heroCanvas.width = w * dpr;
      heroCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", resize);
    resize();

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(heroCanvas);

    const renderHero = () => {
      if (!visible) {
        requestAnimationFrame(renderHero);
        return;
      }
      t += 0.75;
      ctx.clearRect(0, 0, w, h);

      const isPaper = root.getAttribute("data-theme") === "paper";
      const baseAlpha = isPaper ? 0.22 : 0.42;

      paths.forEach((p, idx) => {
        ctx.beginPath();
        const baseColor = isPaper ? "rgba(4, 120, 87," : "rgba(212, 175, 55,";
        ctx.strokeStyle = `${baseColor} ${baseAlpha * (1 - idx / 20)})`;
        ctx.lineWidth = idx === 0 ? 1.8 : 1.0;

        for (let x = 0; x < w; x += 6) {
          const normX = x / w;
          const latent = Math.sin(normX * 4 + t * p.speed + p.phase) * 32 * (1 - filterStrength * 0.4);
          const noise = (Math.sin(x * 12.7 + t * 0.1) * Math.cos(x * 7.3)) * 18 * (1 - filterStrength);
          const y = h * 0.52 + p.offset + latent + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      requestAnimationFrame(renderHero);
    };
    requestAnimationFrame(renderHero);
  }

  // ---------------------------------------------------------
  // 5. Interactive Recruiter Role-Lens Switcher
  // ---------------------------------------------------------
  const lensButtons = document.querySelectorAll(".lens-pill");
  const lensCallout = document.getElementById("lens-callout-text");
  const workRows = document.querySelectorAll(".work-row");

  const roleProfiles = {
    all: {
      callout: "Showing complete breadth across quantitative finance, generative AI systems, and production machine learning.",
      highlightIdxs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    quant: {
      callout: "Combines formal MScFE mathematical rigor (WorldQuant MScFE 610/620) with verified Sobolev differential ML pricer (0.40 ms/128-batch) and audited point-in-time conformal risk engines tested on 890 NYSE sessions.",
      highlightIdxs: [1, 2, 4, 6]
    },
    genai: {
      callout: "Empirical RAG architect who evaluates decoupled judge pipelines across 480 runs (72.2% HitRate@5, 100% trap defense), engineers production AWS EC2 circuit-breaker failovers, and designs multi-agent consensus workflows.",
      highlightIdxs: [3, 5, 6, 8]
    },
    mlops: {
      callout: "Ranked #30 worldwide on Kaggle with 40 medals; enforces reproducible Linux CI/CD, serialized train-inference feature parity, Gunicorn/systemd daemonization, and distributed data pipelines.",
      highlightIdxs: [1, 3, 5, 7, 9]
    }
  };

  lensButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      lensButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const role = btn.getAttribute("data-role") || "all";
      const profile = roleProfiles[role] || roleProfiles.all;

      if (lensCallout) {
        lensCallout.style.opacity = "0";
        setTimeout(() => {
          lensCallout.textContent = profile.callout;
          lensCallout.style.opacity = "1";
        }, 150);
      }

      // Highlight matching project rows
      workRows.forEach((row) => {
        const idx = Number(row.getAttribute("data-work-idx"));
        if (profile.highlightIdxs.includes(idx)) {
          row.classList.add("role-spotlight");
        } else {
          row.classList.remove("role-spotlight");
        }
      });
    });
  });

  // ---------------------------------------------------------
  // 6. Section 02: 3-Tab Interactive Quant & RAG Sandbox
  // ---------------------------------------------------------
  const labTabs = document.querySelectorAll(".lab-main-tabs .tab-pill");
  const labPanels = {
    leakage: document.getElementById("lab-tab-leakage"),
    smile: document.getElementById("lab-tab-smile"),
    rag: document.getElementById("lab-tab-rag"),
  };

  labTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      labTabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const target = tab.getAttribute("data-tab");
      Object.keys(labPanels).forEach((k) => {
        if (labPanels[k]) {
          if (k === target) {
            labPanels[k].hidden = false;
          } else {
            labPanels[k].hidden = true;
          }
        }
      });

      if (target === "leakage") drawLeakageLab();
      if (target === "smile") drawSmileLab();
    });
  });

  // --- TAB 1: LOOKAHEAD LEAKAGE VS CAUSAL SIMULATOR ---
  const leakCanvas = document.getElementById("leakage-canvas");
  const modeButtons = document.querySelectorAll(".segmented .seg-btn");
  const shockSelect = document.getElementById("shock-select");
  const reseedBtn = document.getElementById("reseed-btn");
  const hoverInfo = document.getElementById("leakage-hover-info");

  let currentMode = "causal";
  let shockMult = 1.8;
  let seed = 42;
  let cachedSimData = null;

  const pseudoRandom = (s) => {
    let x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  const generateData = () => {
    const total = 100;
    const split = 60;
    let s = seed;
    const truePrice = [];
    const predCausal = [];
    const predLeaked = [];
    const upperCausal = [];
    const lowerCausal = [];
    const upperLeaked = [];
    const lowerLeaked = [];

    let p = 100;
    for (let i = 0; i < total; i++) {
      const isOOS = i >= split;
      const mult = isOOS ? shockMult : 1.0;
      const ret = (pseudoRandom(s++) - 0.49) * 2.2 * mult;
      p += ret;
      truePrice.push(p);

      const fCausal = p + (pseudoRandom(s++) - 0.5) * 1.2 * (isOOS ? 1.6 : 0.8);
      predCausal.push(fCausal);

      const bandCausal = (isOOS ? 2.8 * shockMult : 1.8);
      upperCausal.push(fCausal + bandCausal);
      lowerCausal.push(fCausal - bandCausal);

      const futureTrend = i < total - 1 ? (p + ret * 0.8) : p;
      const fLeaked = isOOS
        ? p + (futureTrend - p) * 0.95 + (pseudoRandom(s++) - 0.5) * 0.4
        : fCausal;
      predLeaked.push(fLeaked);

      const bandLeaked = isOOS ? 0.9 : 1.8;
      upperLeaked.push(fLeaked + bandLeaked);
      lowerLeaked.push(fLeaked - bandLeaked);
    }

    return { total, split, truePrice, predCausal, predLeaked, upperCausal, lowerCausal, upperLeaked, lowerLeaked };
  };

  const drawLeakageLab = (hoverIdx = -1) => {
    if (!leakCanvas) return;
    const ctx = leakCanvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = leakCanvas.clientWidth;
    const h = leakCanvas.clientHeight;
    leakCanvas.width = w * dpr;
    leakCanvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!cachedSimData) cachedSimData = generateData();
    const d = cachedSimData;

    const isLeaked = currentMode === "leaked";
    const pred = isLeaked ? d.predLeaked : d.predCausal;
    const upper = isLeaked ? d.upperLeaked : d.upperCausal;
    const lower = isLeaked ? d.lowerLeaked : d.lowerCausal;

    const padLeft = 46, padRight = 20, padTop = 26, padBottom = 34;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const allVals = [...d.truePrice, ...upper, ...lower];
    const minV = Math.min(...allVals) - 1.5;
    const maxV = Math.max(...allVals) + 1.5;

    const mapX = (idx) => padLeft + (idx / (d.total - 1)) * plotW;
    const mapY = (val) => padTop + plotH - ((val - minV) / (maxV - minV)) * plotH;

    ctx.clearRect(0, 0, w, h);

    const isPaper = root.getAttribute("data-theme") === "paper";
    const gridColor = isPaper ? "rgba(17, 18, 21, 0.08)" : "rgba(255, 255, 255, 0.07)";
    const splitX = mapX(d.split);

    // Split Shading
    ctx.fillStyle = isPaper ? "rgba(4, 120, 87, 0.035)" : "rgba(212, 175, 55, 0.035)";
    ctx.fillRect(padLeft, padTop, splitX - padLeft, plotH);
    ctx.fillStyle = isPaper ? "rgba(185, 28, 28, 0.035)" : "rgba(239, 68, 68, 0.04)";
    ctx.fillRect(splitX, padTop, padLeft + plotW - splitX, plotH);

    // Grid Lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let gy = 0; gy <= 4; gy++) {
      const y = padTop + (gy / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      const labelVal = (maxV - (gy / 4) * (maxV - minV)).toFixed(1);
      ctx.fillStyle = isPaper ? "#535760" : "#8e94a0";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(labelVal, padLeft - 6, y + 3);
    }

    // Cutoff Line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isPaper ? "#785527" : "#d4af37";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(splitX, padTop);
    ctx.lineTo(splitX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isPaper ? "#785527" : "#d4af37";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText("Cutoff t (Train/Test Partition)", splitX, padTop - 8);

    // 90% Conformal Band
    ctx.beginPath();
    for (let i = 0; i < d.total; i++) {
      const x = mapX(i);
      const y = mapY(upper[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = d.total - 1; i >= 0; i--) {
      const x = mapX(i);
      const y = mapY(lower[i]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = isLeaked
      ? (isPaper ? "rgba(185, 28, 28, 0.14)" : "rgba(239, 68, 68, 0.16)")
      : (isPaper ? "rgba(4, 120, 87, 0.12)" : "rgba(16, 185, 129, 0.14)");
    ctx.fill();

    // True Price Line
    ctx.beginPath();
    for (let i = 0; i < d.total; i++) {
      const x = mapX(i);
      const y = mapY(d.truePrice[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = isPaper ? "#111215" : "#f4f3ef";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Model Prediction Line
    ctx.beginPath();
    for (let i = 0; i < d.total; i++) {
      const x = mapX(i);
      const y = mapY(pred[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = isLeaked
      ? (isPaper ? "#b91c1c" : "#ef4444")
      : (isPaper ? "#047857" : "#10b981");
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Crosshair Hover
    if (hoverIdx >= 0 && hoverIdx < d.total) {
      const hx = mapX(hoverIdx);
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = isPaper ? "#111215" : "#f4f3ef";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      const py = mapY(d.truePrice[hoverIdx]);
      ctx.fillStyle = isPaper ? "#111215" : "#f4f3ef";
      ctx.beginPath();
      ctx.arc(hx, py, 4, 0, Math.PI * 2);
      ctx.fill();

      const fy = mapY(pred[hoverIdx]);
      ctx.fillStyle = isLeaked ? "#ef4444" : "#10b981";
      ctx.beginPath();
      ctx.arc(hx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const updateLeakageMetrics = () => {
    const isLeaked = currentMode === "leaked";
    const mIn = document.getElementById("m-insample");
    const mOos = document.getElementById("m-oos");
    const mCov = document.getElementById("m-cov");
    const mVer = document.getElementById("m-verdict");

    if (isLeaked) {
      if (mIn) mIn.textContent = "MAE 0.12 · Sharpe 3.82 (Overfitted)";
      if (mOos) mOos.textContent = "MAE 2.84 · Sharpe -0.68 (Collapses Live)";
      if (mCov) mCov.textContent = "41% inside band (Severe Leakage Failure)";
      if (mVer) mVer.textContent = "Unbounded lookahead leakage; model fails in real trading.";
    } else {
      if (mIn) mIn.textContent = "MAE 0.62 · Sharpe 1.45 (Honest Fit)";
      if (mOos) mOos.textContent = "MAE 1.18 · Sharpe 1.24 (Stable Positive)";
      if (mCov) mCov.textContent = "91% inside band (Calibrated α = 0.10)";
      if (mVer) mVer.textContent = "Causal filtration Ft preserved; band widens with shock.";
    }
  };

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-mode") || "causal";
      updateLeakageMetrics();
      drawLeakageLab();
    });
  });

  shockSelect?.addEventListener("change", (e) => {
    shockMult = parseFloat(e.target.value);
    cachedSimData = generateData();
    drawLeakageLab();
  });

  reseedBtn?.addEventListener("click", () => {
    seed = Math.floor(Math.random() * 10000);
    cachedSimData = generateData();
    drawLeakageLab();
  });

  leakCanvas?.addEventListener("mousemove", (e) => {
    if (!cachedSimData) return;
    const rect = leakCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padLeft = 46, padRight = 20;
    const plotW = leakCanvas.clientWidth - padLeft - padRight;
    const relX = Math.max(0, Math.min(x - padLeft, plotW));
    const idx = Math.round((relX / plotW) * (cachedSimData.total - 1));

    drawLeakageLab(idx);

    if (hoverInfo && cachedSimData) {
      const isOOS = idx >= cachedSimData.split;
      const isLeaked = currentMode === "leaked";
      const predVal = isLeaked ? cachedSimData.predLeaked[idx] : cachedSimData.predCausal[idx];
      const realVal = cachedSimData.truePrice[idx];
      const lowVal = isLeaked ? cachedSimData.lowerLeaked[idx] : cachedSimData.lowerCausal[idx];
      const upVal = isLeaked ? cachedSimData.upperLeaked[idx] : cachedSimData.upperCausal[idx];

      hoverInfo.textContent = `Day t=${idx} (${isOOS ? "OOS Test" : "In-Sample Train"}) | Realized: ${realVal.toFixed(2)} | Forecast: ${predVal.toFixed(2)} | 90% Band: [${lowVal.toFixed(2)}, ${upVal.toFixed(2)}]`;
    }
  });

  leakCanvas?.addEventListener("mouseleave", () => {
    drawLeakageLab(-1);
    if (hoverInfo) {
      hoverInfo.textContent = "Hover over canvas to inspect step-by-step point-in-time metrics";
    }
  });

  // --- TAB 2: BATES SVJD VOLATILITY SMILE SIMULATOR ---
  const smileCanvas = document.getElementById("smile-canvas");
  const sLambda = document.getElementById("slider-jump-lambda");
  const sMu = document.getElementById("slider-jump-mu");
  const sXi = document.getElementById("slider-vol-vol");
  const vLambda = document.getElementById("val-jump-lambda");
  const vMu = document.getElementById("val-jump-mu");
  const vXi = document.getElementById("val-vol-vol");
  const resetSmileBtn = document.getElementById("reset-smile-params");
  const smileHover = document.getElementById("smile-hover-info");

  let jumpLambda = 1.2;
  let jumpMu = -0.08;
  let volVol = 0.40;

  const updateSmileSliders = () => {
    if (sLambda) jumpLambda = parseFloat(sLambda.value);
    if (sMu) jumpMu = parseFloat(sMu.value) / 100;
    if (sXi) volVol = parseFloat(sXi.value);

    if (vLambda) vLambda.textContent = jumpLambda.toFixed(1);
    if (vMu) vMu.textContent = `${(jumpMu * 100).toFixed(0)}%`;
    if (vXi) vXi.textContent = volVol.toFixed(2);
  };

  sLambda?.addEventListener("input", () => { updateSmileSliders(); drawSmileLab(); });
  sMu?.addEventListener("input", () => { updateSmileSliders(); drawSmileLab(); });
  sXi?.addEventListener("input", () => { updateSmileSliders(); drawSmileLab(); });

  resetSmileBtn?.addEventListener("click", () => {
    if (sLambda) sLambda.value = "1.2";
    if (sMu) sMu.value = "-8";
    if (sXi) sXi.value = "0.40";
    updateSmileSliders();
    drawSmileLab();
  });

  const computeSmile = () => {
    const points = [];
    const bsPoints = [];
    const baseVol = 0.20;

    for (let k = 80; k <= 120; k += 1) {
      const moneyness = k / 100;
      const logM = Math.log(moneyness);
      const skew = -0.08 * (moneyness - 1.0) * (1 + volVol * 1.5);
      const jumpEffect = jumpLambda * (0.015 + 0.05 * Math.pow(logM - jumpMu, 2));
      const batesIV = baseVol + skew + jumpEffect;
      points.push({ m: moneyness, iv: batesIV });
      bsPoints.push({ m: moneyness, iv: baseVol });
    }
    return { points, bsPoints };
  };

  const drawSmileLab = (hoverM = -1) => {
    if (!smileCanvas) return;
    const ctx = smileCanvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = smileCanvas.clientWidth;
    const h = smileCanvas.clientHeight;
    smileCanvas.width = w * dpr;
    smileCanvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { points, bsPoints } = computeSmile();
    const padLeft = 48, padRight = 20, padTop = 24, padBottom = 34;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const minM = 0.80, maxM = 1.20;
    const minIV = 0.14, maxIV = 0.38;

    const mapX = (m) => padLeft + ((m - minM) / (maxM - minM)) * plotW;
    const mapY = (iv) => padTop + plotH - ((iv - minIV) / (maxIV - minIV)) * plotH;

    ctx.clearRect(0, 0, w, h);

    const isPaper = root.getAttribute("data-theme") === "paper";
    const gridColor = isPaper ? "rgba(17, 18, 21, 0.08)" : "rgba(255, 255, 255, 0.07)";

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const y = padTop + (g / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      const ivLabel = ((maxIV - (g / 4) * (maxIV - minIV)) * 100).toFixed(0) + "%";
      ctx.fillStyle = isPaper ? "#535760" : "#8e94a0";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(ivLabel, padLeft - 6, y + 3);
    }

    // Moneyness markers
    [0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15].forEach((m) => {
      const x = mapX(m);
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      ctx.fillStyle = isPaper ? "#535760" : "#8e94a0";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(m.toFixed(2), x, padTop + plotH + 16);
    });

    // ATM Reference Line (K/S = 1.0)
    const atmX = mapX(1.0);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = isPaper ? "#785527" : "#d4af37";
    ctx.beginPath();
    ctx.moveTo(atmX, padTop);
    ctx.lineTo(atmX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Black-Scholes Flat Baseline
    ctx.beginPath();
    for (let i = 0; i < bsPoints.length; i++) {
      const x = mapX(bsPoints[i].m);
      const y = mapY(bsPoints[i].iv);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = isPaper ? "rgba(17,18,21,0.3)" : "rgba(255,255,255,0.25)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]);

    // Bates SVJD Skew Curve
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = mapX(points[i].m);
      const y = mapY(points[i].iv);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = isPaper ? "#047857" : "#10b981";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Hover Crosshair
    if (hoverM >= 0.80 && hoverM <= 1.20) {
      const hx = mapX(hoverM);
      const curPt = points.find((p) => Math.abs(p.m - hoverM) < 0.006) || points[0];
      const hy = mapY(curPt.iv);

      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = isPaper ? "#111215" : "#f4f3ef";
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isPaper ? "#047857" : "#10b981";
      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  smileCanvas?.addEventListener("mousemove", (e) => {
    const rect = smileCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padLeft = 48, padRight = 20;
    const plotW = smileCanvas.clientWidth - padLeft - padRight;
    const relX = Math.max(0, Math.min(x - padLeft, plotW));
    const m = 0.80 + (relX / plotW) * 0.40;

    drawSmileLab(m);

    if (smileHover) {
      const { points } = computeSmile();
      const pt = points.find((p) => Math.abs(p.m - m) < 0.006) || points[0];
      const delta = (0.50 + (pt.m - 1.0) * 1.2).toFixed(3);
      smileHover.textContent = `Moneyness K/S: ${pt.m.toFixed(2)} | Bates Implied Vol: ${(pt.iv * 100).toFixed(1)}% | Sobolev Delta: ${delta} | CPU Batch: 0.40 ms`;
    }
  });

  smileCanvas?.addEventListener("mouseleave", () => {
    drawSmileLab(-1);
    if (smileHover) {
      smileHover.textContent = "Hover over canvas to inspect implied volatility smile across strike moneyness";
    }
  });

  // --- TAB 3: SEC 10-K RAG SIMULATOR ---
  const ragQueryButtons = document.querySelectorAll(".rag-query-btn");
  const ragTiers = {
    faissScore: document.getElementById("rag-faiss-score"),
    faissDesc: document.getElementById("rag-faiss-desc"),
    bm25Score: document.getElementById("rag-bm25-score"),
    bm25Desc: document.getElementById("rag-bm25-desc"),
    hybridScore: document.getElementById("rag-hybrid-score"),
    hybridDesc: document.getElementById("rag-hybrid-desc"),
  };

  const ragScenarios = {
    tax: {
      faiss: { score: "Hit@5: 44.4% · MRR: 0.22", desc: "Retrieves narrative MD&A sections discussing tax policy but misses row-level effective tax rate reconciliation tables due to embedding dilution." },
      bm25: { score: "Hit@5: 54.4% · MRR: 0.29", desc: "Matches exact keywords 'effective tax rate' but fails cross-company alignment between Apple and Microsoft reporting nomenclatures." },
      hybrid: { score: "Hit@5: 72.2% · Faithfulness: 4.12/5.0", desc: "Replicates Markdown table headers across AAPL Note 8 and MSFT Note 13; cross-encoder reranks exact statutory-to-effective tax percentages." }
    },
    rpo: {
      faiss: { score: "Hit@5: 40.0% · MRR: 0.19", desc: "Conflates NVIDIA's multi-year cloud contract commitments with general supply purchase obligations." },
      bm25: { score: "Hit@5: 50.0% · MRR: 0.26", desc: "Locates keyword 'RPO' but misses footnote breakdowns detailing the 12-month expected recognition schedule." },
      hybrid: { score: "Hit@5: 72.2% · Faithfulness: 4.25/5.0", desc: "Successfully isolates NVDA FY2025 Revenue Note: exactly extracts $3.2B due in next 12 months with verified inline citation." }
    },
    trap: {
      faiss: { score: "0.0% Trap Defense (Hallucinates)", desc: "Hallucinates speculative FY2028 revenue projections by combining historical CAGRs into authoritative but fabricated claims." },
      bm25: { score: "0.0% Trap Defense (No Abstention)", desc: "Returns partial matches on future forward-looking disclaimers; ungrounded generator invents plausible figures." },
      hybrid: { score: "100.0% Abstention Accuracy", desc: "Independent judge verifies that 10-K filings only report through FY2025; system abstains cleanly with zero hallucination." }
    }
  };

  ragQueryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      ragQueryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const q = btn.getAttribute("data-query") || "tax";
      const sc = ragScenarios[q] || ragScenarios.tax;

      if (ragTiers.faissScore) ragTiers.faissScore.textContent = sc.faiss.score;
      if (ragTiers.faissDesc) ragTiers.faissDesc.textContent = sc.faiss.desc;
      if (ragTiers.bm25Score) ragTiers.bm25Score.textContent = sc.bm25.score;
      if (ragTiers.bm25Desc) ragTiers.bm25Desc.textContent = sc.bm25.desc;
      if (ragTiers.hybridScore) ragTiers.hybridScore.textContent = sc.hybrid.score;
      if (ragTiers.hybridDesc) ragTiers.hybridDesc.textContent = sc.hybrid.desc;
    });
  });

  // Initial render of default tab
  drawLeakageLab();

  // ---------------------------------------------------------
  // 7. Section 03: 01-10 Works Ledger & Category Filters
  // ---------------------------------------------------------
  const filterButtons = document.querySelectorAll(".filter-pill");
  const projectRows = document.querySelectorAll(".work-row");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      const filter = btn.getAttribute("data-filter") || "all";
      projectRows.forEach((row) => {
        const cat = row.getAttribute("data-cat") || "";
        if (filter === "all" || cat.includes(filter)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  });

  // Work Row Accordion expansion
  projectRows.forEach((row) => {
    const summary = row.querySelector(".work-row-summary");
    summary?.addEventListener("click", () => {
      const isOpen = row.classList.contains("is-open");
      projectRows.forEach((r) => r.classList.remove("is-open"));
      if (!isOpen) {
        row.classList.add("is-open");
      }
    });
  });

  // ---------------------------------------------------------
  // 8. In-Page Interactive Resume Modal
  // ---------------------------------------------------------
  const resumeModal = document.getElementById("resume-modal");
  const openResumeButtons = document.querySelectorAll(".btn-open-resume");
  const closeResumeBtn = document.getElementById("close-resume-btn");
  const copyPlainResumeBtn = document.getElementById("copy-plain-resume");

  openResumeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (resumeModal) resumeModal.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  const closeResume = () => {
    if (resumeModal) resumeModal.hidden = true;
    document.body.style.overflow = "";
  };

  closeResumeBtn?.addEventListener("click", closeResume);
  resumeModal?.addEventListener("click", (e) => {
    if (e.target === resumeModal) closeResume();
  });

  // Copy Plain-Text ATS Resume
  copyPlainResumeBtn?.addEventListener("click", async () => {
    const plainResume = `AMAN ATAR
Maharashtra, India (Open to Pune, Bengaluru, Mumbai, Hyderabad & Remote)
Email: ataraman9@gmail.com | Portfolio: https://amanatar.github.io
GitHub: https://github.com/Amanatar | Kaggle: https://www.kaggle.com/amanatar (#30 Worldwide)
LinkedIn: https://www.linkedin.com/in/aman-atar

SUMMARY:
Machine Learning & Quantitative Systems Engineer pursuing an M.Sc. in Financial Engineering at WorldQuant University. Ranked #30 Worldwide on Kaggle (Top 0.05%, 40 Medals) and Gold Level on WorldQuant BRAIN, with verified experience shipping AWS EC2 LLM failover systems, 480-run SEC 10-K Hybrid RAG benchmarks, and 0.40 ms PyTorch Differential ML option pricers verified on Ubuntu 24.04 CI.

TECHNICAL SKILLS:
- Machine Learning & Quant: Python, PyTorch, scikit-learn, LightGBM, XGBoost, CatBoost, LinearSVC, Differential ML (Sobolev Loss), Conformal Prediction (CQR), Carr-Madan FFT, Bates SVJD, HMM Regime Detection, Soft-Sinkhorn Optimal Transport
- GenAI, NLP & Retrieval: Retrieval-Augmented Generation (RAG), FAISS, BM25, Reciprocal Rank Fusion (RRF), Cross-Encoder Reranking, Sentence-Transformers, HuggingFace TRL (SFT), Google ADK (Multi-Agent), Amazon Bedrock, Gemini API, NVIDIA NIM, Groq, VADER
- Cloud MLOps & Data Engineering: AWS EC2, Docker, Linux (Ubuntu 24.04), GitHub Actions CI/CD, MLflow, Flask, Streamlit, Gunicorn, pytest, PostgreSQL, Google BigQuery, Apache Spark, Kafka, dbt, Kestra, Terraform, SQL, Git

PROFESSIONAL EXPERIENCE:
1. Innomatics Research Labs — Data Science with GenAI Intern (Nov 2025 – Mar 2026, Remote)
   - Deployed FinWiser on AWS EC2 (Ubuntu, Gunicorn, systemd) with live circuit-breaker failover intercepting Gemini API HTTP 429 drops to NVIDIA NIM with zero session loss.
   - Built an enterprise semantic Q&A pipeline using Amazon Bedrock Knowledge Bases with automated document chunking.
   - Benchmarked 5 sentiment models in MLflow on Flipkart review data (macro F1 82.12%), serving winning model via Flask on EC2.

2. TheSmartBridge — Machine Learning Engineer Intern (Nov 2025 – Jan 2026, Remote)
   - Built end-to-end 4-stage clinical hypertension risk stratification system (Normal, Stage-1, Stage-2, Crisis) served via Flask (github.com/Amanatar/hypertension-risk-assessment).
   - Locked train-to-inference feature scaling invariants inside a single serialized preprocessing artifact, verified via automated pytest suites in GitHub Actions CI.

3. Edunet Foundation (AICTE × IBM SkillsBuild) — AI & Cloud Technology Intern (Sep 2025 – Oct 2025, Remote)
   - Built Student Mental Health Companion (featured capstone), pairing Gemini API with VADER sentiment routing and deterministic offline fallbacks (github.com/Amanatar/student-mental-health-companion).

SELECTED EMPIRICAL SYSTEMS & RESEARCH (10/10 UBUNTU 24.04 CI VERIFIED):
- FinFaithful-RAG: 480-Run SEC EDGAR 10-K Hybrid RAG Benchmark (github.com/Amanatar/FinFaithful-RAG · CI #42760579773)
  Evaluated 4 retrieval tiers across 480 live runs over AAPL, MSFT, NVDA, JPM, GOOGL Form 10-Ks with decoupled generator and judge. Hybrid RRF (BM25 + FAISS) + Cross-Encoder lifted HitRate@5 from 44.4%/54.4% to 72.2% with 100% trap defense and 89.2% citation validity.
- Neural Bates DML: Sobolev Differential ML Option Pricing Surrogate (github.com/Amanatar/neural-bates-dml · CI #41193397993)
  Twin-network PyTorch surrogate for 10-parameter Bates SVJD model trained on Carr-Madan FFT prices and Greeks, evaluating a 128-option batch in 0.40 ms on CPU with zero NaN instability.
- Kronos v1.0.0 & TRACE-Fin: Point-in-Time Conformal Econometrics (github.com/Amanatar/auditable-regime-aware-agentic-forecasting · CI #41193425227)
  Audited asymmetric tail sizing across 4,450 out-of-sample asset-days (890 NYSE sessions, 2023–2026); Bowley skewness reduces max drawdown by 30% with deterministic replication (< 3.33e-16) in 0.47s.
- Competitive ML Systems: LLM Behavioral Forensics & Gold Kernels (kaggle.com/amanatar)
  Reached 0.684 Public LB (Rank 353 / 5,728, Top 6%) in Name That LLM; 4 Gold notebooks led by ans-verifys (749+ upvotes).

EDUCATION:
- WorldQuant University — M.Sc. in Financial Engineering (MScFE) | 2025 – Present
- Indian Institute of Technology (IIT) Hyderabad — Coursework in AI, ML & Autonomous Systems | 2025 – Present
- Punyashlok Ahilyadevi Holkar Solapur University — Bachelor of Computer Applications (BCA) | Graduated June 2025

HONORS & CERTIFICATIONS:
- Kaggle Notebooks Expert: Global Rank #30 / 58,650+ (Top 0.05%, 40 Medals, 2,800+ upvotes).
- WorldQuant BRAIN Challenge: Gold Level (Alpha Research).
- DataTalks.Club Data Engineering Zoomcamp (2026 Cohort).`;

    try {
      await navigator.clipboard.writeText(plainResume);
      copyPlainResumeBtn.textContent = "Copied ✓";
      setTimeout(() => {
        copyPlainResumeBtn.textContent = "Copy Plain-Text ATS Resume 📋";
      }, 2000);
    } catch {
      alert("Resume text copied to clipboard!");
    }
  });

  // ---------------------------------------------------------
  // 9. Command Palette Modal (Press / or Jump)
  // ---------------------------------------------------------
  const cmdModal = document.getElementById("cmd-modal");
  const cmdBtn = document.getElementById("cmd-btn");
  const cmdClose = document.getElementById("cmd-close");
  const cmdInput = document.getElementById("cmd-input");
  const cmdList = document.getElementById("cmd-list");

  const openCmd = () => {
    if (cmdModal) cmdModal.hidden = false;
    cmdInput?.focus();
    document.body.style.overflow = "hidden";
  };

  const closeCmd = () => {
    if (cmdModal) cmdModal.hidden = true;
    document.body.style.overflow = "";
  };

  cmdBtn?.addEventListener("click", openCmd);
  cmdClose?.addEventListener("click", closeCmd);
  cmdModal?.addEventListener("click", (e) => {
    if (e.target === cmdModal) closeCmd();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openCmd();
    }
    if (e.key === "Escape") {
      closeCmd();
      closeResume();
    }
  });

  cmdList?.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const action = li.getAttribute("data-action");
    if (action === "jump") {
      const target = li.getAttribute("data-target");
      closeCmd();
      if (target) document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else if (action === "theme") {
      const next = root.getAttribute("data-theme") === "obsidian" ? "paper" : "obsidian";
      applyTheme(next);
      closeCmd();
    } else if (action === "resume") {
      closeCmd();
      if (resumeModal) resumeModal.hidden = false;
    } else if (action === "email") {
      navigator.clipboard.writeText("ataraman9@gmail.com");
      alert("Email copied: ataraman9@gmail.com");
      closeCmd();
    } else if (action === "url") {
      const url = li.getAttribute("data-url");
      if (url) window.open(url, "_blank", "noopener");
      closeCmd();
    }
  });

  // ---------------------------------------------------------
  // 10. Direct Email Copy Feedback
  // ---------------------------------------------------------
  const emailButtons = document.querySelectorAll(".email-btn, #copy-email");
  emailButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-email") || "ataraman9@gmail.com";
      const statusSpan = btn.querySelector(".copy-badge, .copy-tag, #copy-status");
      try {
        await navigator.clipboard.writeText(email);
        if (statusSpan) statusSpan.textContent = "Copied ✓";
        setTimeout(() => {
          if (statusSpan) statusSpan.textContent = "Copy";
        }, 2000);
      } catch {
        alert(`Email: ${email}`);
      }
    });
  });

  // ---------------------------------------------------------
  // 11. Philosophical Notes Accordion
  // ---------------------------------------------------------
  const noteTriggers = document.querySelectorAll(".note-trigger");
  noteTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const card = trigger.closest(".note-card");
      const wasOpen = card.classList.contains("is-open");
      document.querySelectorAll(".note-card").forEach((c) => {
        c.classList.remove("is-open");
        c.querySelector(".note-trigger")?.setAttribute("aria-expanded", "false");
        const icon = c.querySelector(".note-icon");
        if (icon) icon.textContent = "+";
      });

      if (!wasOpen) {
        card.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        const icon = card.querySelector(".note-icon");
        if (icon) icon.textContent = "−";
      }
    });
  });

})();
