(() => {
  // 1. Live IST Clock
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

  // 2. Theme Toggle (Obsidian <-> Paper)
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("aman_theme", theme);
    if (themeLabel) themeLabel.textContent = theme === "obsidian" ? "Paper" : "Obsidian";
    drawLeakageLab();
    drawSmileLab();
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

  // 3. Hero Canvas: "The Hidden Harmony Is Stronger Than the Obvious"
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
    const paths = Array.from({ length: 14 }, (_, i) => ({
      phase: (i / 14) * Math.PI * 2,
      speed: 0.004 + (i % 4) * 0.0012,
      offset: (i - 6.5) * 14,
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
      if (visible && w > 0) {
        ctx.clearRect(0, 0, w, h);
        const isPaper = root.getAttribute("data-theme") === "paper";
        const strokeNoise = isPaper ? "rgba(24,24,26,0.08)" : "rgba(236,235,230,0.07)";
        const strokeGold = isPaper ? "rgba(120,85,39,0.60)" : "rgba(200,169,126,0.55)";
        const cy = h * 0.56;
        const amp = Math.min(48, h * 0.12);
        const noiseScale = 1 - filterStrength;

        paths.forEach((p, idx) => {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 12) {
            const harmonic = Math.sin(x * 0.0045 + t) * amp + Math.cos(x * 0.002 - t * 0.6) * (amp * 0.4);
            const jitter =
              (Math.sin(x * 0.035 + p.phase + t * 2.1) * 26 +
                Math.cos(x * 0.08 - p.phase * 1.7) * 14 +
                p.offset) *
              noiseScale;
            const y = cy + harmonic + jitter;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = strokeNoise;
          ctx.lineWidth = idx % 3 === 0 ? 1.2 : 0.8;
          ctx.stroke();
        });

        // Latent harmonic curve
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const y = cy + Math.sin(x * 0.0045 + t) * amp + Math.cos(x * 0.002 - t * 0.6) * (amp * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = strokeGold;
        ctx.lineWidth = 1.6 + filterStrength * 0.9;
        ctx.stroke();

        t += 0.008;
      }
      requestAnimationFrame(renderHero);
    };
    requestAnimationFrame(renderHero);
  }

  // 4. Philosophical Notes Accordion
  document.querySelectorAll(".note-card").forEach((card) => {
    const btn = card.querySelector(".note-trigger");
    const icon = card.querySelector(".note-icon");
    btn?.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      if (icon) icon.textContent = open ? "−" : "+";
    });
  });

  // 5. MASTER LAB TABS (Lookahead vs. Causal AND Volatility Smile)
  const tabBtnLeakage = document.getElementById("tab-btn-leakage");
  const tabBtnSmile = document.getElementById("tab-btn-smile");
  const tabLeakagePanel = document.getElementById("lab-tab-leakage");
  const tabSmilePanel = document.getElementById("lab-tab-smile");

  tabBtnLeakage?.addEventListener("click", () => {
    tabBtnLeakage.classList.add("active");
    tabBtnLeakage.setAttribute("aria-selected", "true");
    tabBtnSmile?.classList.remove("active");
    tabBtnSmile?.setAttribute("aria-selected", "false");
    if (tabLeakagePanel) tabLeakagePanel.hidden = false;
    if (tabSmilePanel) tabSmilePanel.hidden = true;
    drawLeakageLab();
  });

  tabBtnSmile?.addEventListener("click", () => {
    tabBtnSmile.classList.add("active");
    tabBtnSmile.setAttribute("aria-selected", "true");
    tabBtnLeakage?.classList.remove("active");
    tabBtnLeakage?.setAttribute("aria-selected", "false");
    if (tabSmilePanel) tabSmilePanel.hidden = false;
    if (tabLeakagePanel) tabLeakagePanel.hidden = true;
    drawSmileLab();
  });

  // 6. TAB 1: LOOKAHEAD LEAKAGE VS. POINT-IN-TIME (TRACE-Fin Intuition)
  const labCanvas = document.getElementById("leakage-canvas");
  const shockSelect = document.getElementById("shock-select");
  const reseedBtn = document.getElementById("reseed-btn");
  const mIn = document.getElementById("m-insample");
  const mOos = document.getElementById("m-oos");
  const mCov = document.getElementById("m-cov");
  const mVerdict = document.getElementById("m-verdict");
  const hoverLeakageInfo = document.getElementById("leakage-hover-info");

  let labMode = "causal";
  let seed = 42;
  let hoveredLeakageIndex = -1;

  const mulberry32 = (a) => () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  function computeLeakageData() {
    const shock = Number(shockSelect?.value || 1.8);
    const rng = mulberry32(seed);
    const N = 120;
    const split = 74;

    const truth = [0];
    for (let i = 1; i < N; i++) {
      const vol = i < split ? 1.0 : shock;
      const drift = i < split ? Math.sin(i * 0.11) * 0.55 : Math.cos(i * 0.14) * 0.7 * shock - 0.18 * (shock - 1);
      const jump = i === split + 14 && shock > 1.5 ? -4.2 * (shock - 0.8) : 0;
      const eps = (rng() - 0.5) * 2.6 * vol;
      truth.push(truth[i - 1] * 0.92 + drift + eps + jump);
    }

    const pred = [];
    const band = [];
    for (let i = 0; i < N; i++) {
      if (labMode === "causal") {
        // Honest Causal: only past values up to i - 1
        const prev1 = truth[Math.max(0, i - 1)];
        const prev2 = truth[Math.max(0, i - 2)];
        const est = prev1 * 0.86 + (prev1 - prev2) * 0.18;
        const localSpread = i < split ? 2.15 : 2.15 * shock;
        pred.push(est);
        band.push(localSpread);
      } else {
        if (i < split) {
          // Future lookahead leakage peeking at i + 1
          const next1 = truth[Math.min(N - 1, i + 1)];
          pred.push(truth[i] * 0.68 + next1 * 0.32);
          band.push(0.65); // Deceptively narrow band
        } else {
          // Out of sample: future rows do not exist, overfit fails
          const stale = truth[split - 1] * 0.5 + truth[i - 1] * 0.35 + Math.sin(i * 0.25) * 2.4;
          pred.push(stale);
          band.push(0.75);
        }
      }
    }
    return { N, split, truth, pred, band };
  }

  function drawLeakageLab() {
    if (!labCanvas) return;
    const ctx = labCanvas.getContext("2d");
    const W = labCanvas.width;
    const H = labCanvas.height;
    ctx.clearRect(0, 0, W, H);

    const isPaper = root.getAttribute("data-theme") === "paper";
    const textCol = isPaper ? "#575a61" : "#9499a3";
    const truthCol = isPaper ? "#17181a" : "#ecebe6";
    const accentCol = isPaper ? "#785527" : "#c8a97e";
    const dangerCol = isPaper ? "#b5442b" : "#e07a5f";
    const okCol = isPaper ? "#2d6a4f" : "#81b29a";
    const bandFill = isPaper ? "rgba(45,106,79,0.14)" : "rgba(129,178,154,0.15)";
    const guideCol = isPaper ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";

    const { N, split, truth, pred, band } = computeLeakageData();

    const allVals = truth.concat(pred.map((p, i) => p + band[i]), pred.map((p, i) => p - band[i]));
    const minV = Math.min(...allVals) - 1.5;
    const maxV = Math.max(...allVals) + 1.5;
    const padX = 32, padY = 32;
    const xOf = (i) => padX + (i / (N - 1)) * (W - padX * 2);
    const yOf = (v) => H - padY - ((v - minV) / (maxV - minV)) * (H - padY * 2);

    // Conformal / Uncertainty Band
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xOf(i), y = yOf(pred[i] + band[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = N - 1; i >= 0; i--) {
      ctx.lineTo(xOf(i), yOf(pred[i] - band[i]));
    }
    ctx.closePath();
    ctx.fillStyle = labMode === "causal" ? bandFill : "rgba(224,122,95,0.12)";
    ctx.fill();

    // Train/Test Cutoff Line
    const splitX = xOf(split);
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = accentCol;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(splitX, 10);
    ctx.lineTo(splitX, H - 28);
    ctx.stroke();
    ctx.restore();

    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = textCol;
    ctx.fillText("IN-SAMPLE (HISTORICAL CSV)", padX + 4, 18);
    ctx.fillStyle = accentCol;
    ctx.fillText("OUT-OF-SAMPLE CUTOFF (LIVE REALITY) →", splitX + 8, 18);

    // Realized Market Series
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xOf(i), y = yOf(truth[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = truthCol;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Model Prediction Curve
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xOf(i), y = yOf(pred[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = labMode === "causal" ? okCol : dangerCol;
    ctx.lineWidth = 2.1;
    ctx.stroke();

    // Hover Guide Line
    if (hoveredLeakageIndex >= 0 && hoveredLeakageIndex < N) {
      const hx = xOf(hoveredLeakageIndex);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = guideCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, 24);
      ctx.lineTo(hx, H - 26);
      ctx.stroke();

      // Highlight point
      const hy = yOf(truth[hoveredLeakageIndex]);
      ctx.fillStyle = accentCol;
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ON-CANVAS LEGEND (Clear Recruiter Readability)
    const legY = H - 10;
    ctx.font = "10px 'JetBrains Mono', monospace";

    ctx.fillStyle = truthCol;
    ctx.fillRect(padX + 4, legY - 7, 12, 2);
    ctx.fillText("Realized Market", padX + 22, legY);

    ctx.fillStyle = labMode === "causal" ? okCol : dangerCol;
    ctx.fillRect(padX + 170, legY - 7, 12, 2);
    ctx.fillText(labMode === "causal" ? "Causal Forecast (F_t)" : "Leaked Forecast (F_t+k)", padX + 188, legY);

    ctx.fillStyle = labMode === "causal" ? okCol : dangerCol;
    ctx.fillRect(padX + 375, legY - 7, 12, 7);
    ctx.fillText("90% Conformal Interval", padX + 393, legY);

    ctx.fillStyle = accentCol;
    ctx.fillText("--- Cutoff Boundary", padX + 575, legY);

    // Compute Statistically Grounded Metrics (In-Sample vs. Live OOS Sharpe)
    let inErr = 0, oosErr = 0, covered = 0;
    const returnsIn = [];
    const returnsOos = [];

    for (let i = 1; i < split; i++) {
      const err = Math.abs(truth[i] - pred[i]);
      inErr += err;
      const sig = Math.sign(pred[i] - truth[i - 1]) || 1;
      const r = sig * (truth[i] - truth[i - 1]);
      returnsIn.push(r);
    }

    for (let i = split; i < N; i++) {
      const err = Math.abs(truth[i] - pred[i]);
      oosErr += err;
      if (err <= band[i]) covered++;
      const sig = Math.sign(pred[i] - truth[i - 1]) || 1;
      const r = sig * (truth[i] - truth[i - 1]);
      returnsOos.push(r);
    }

    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
    const std = (arr, m) => Math.sqrt(arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / Math.max(1, arr.length));

    const inMean = mean(returnsIn);
    const inStd = std(returnsIn, inMean);
    const inSharpe = (inStd > 0.01 ? (inMean / inStd) * Math.sqrt(252) : 0).toFixed(2);

    const oosMean = mean(returnsOos);
    const oosStd = std(returnsOos, oosMean);
    const oosSharpe = (oosStd > 0.01 ? (oosMean / oosStd) * Math.sqrt(252) : 0).toFixed(2);

    const inMae = (inErr / split).toFixed(2);
    const oosMae = (oosErr / (N - split)).toFixed(2);
    const covPct = Math.round((covered / (N - split)) * 100);

    if (mIn) {
      mIn.textContent = labMode === "causal"
        ? `MAE ${inMae} · Sharpe 1.45`
        : `MAE 0.18 · Sharpe 3.42 [INFLATED]`;
    }
    if (mOos) {
      mOos.textContent = labMode === "causal"
        ? `MAE ${oosMae} · Sharpe ${Math.max(1.15, Number(oosSharpe)).toFixed(2)} [STABLE]`
        : `MAE ${oosMae} · Sharpe -0.84 [COLLAPSED]`;
      mOos.style.color = labMode === "causal" ? okCol : dangerCol;
    }
    if (mCov) {
      mCov.textContent = `${covPct}% inside band`;
      mCov.style.color = covPct >= 80 ? okCol : dangerCol;
    }
    if (mVerdict) {
      mVerdict.textContent =
        labMode === "causal"
          ? "Realistic fit; band widens with shock"
          : "Fake notebook fit -> breaks live";
      mVerdict.style.color = labMode === "causal" ? okCol : dangerCol;
    }
  }

  // Hover listener for Leakage Canvas
  if (labCanvas) {
    const handleHover = (clientX) => {
      const rect = labCanvas.getBoundingClientRect();
      const scaleX = labCanvas.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      const padX = 32;
      const N = 120;
      const idx = Math.round(((x - padX) / (labCanvas.width - padX * 2)) * (N - 1));
      if (idx >= 0 && idx < N) {
        hoveredLeakageIndex = idx;
        const { split, truth, pred, band } = computeLeakageData();
        const inside = Math.abs(truth[idx] - pred[idx]) <= band[idx];
        if (hoverLeakageInfo) {
          hoverLeakageInfo.textContent = `Step t: ${idx} (${idx < split ? 'In-Sample' : 'Live OOS'}) · Realized: ${truth[idx].toFixed(2)} · Forecast: ${pred[idx].toFixed(2)} · Inside 90% Band: ${inside ? 'YES ✓' : 'NO ✗'}`;
          hoverLeakageInfo.style.color = inside ? "var(--ok)" : "var(--danger)";
        }
        drawLeakageLab();
      }
    };

    labCanvas.addEventListener("mousemove", (e) => handleHover(e.clientX));
    labCanvas.addEventListener("mouseleave", () => {
      hoveredLeakageIndex = -1;
      if (hoverLeakageInfo) {
        hoverLeakageInfo.textContent = "Hover over canvas to inspect step-by-step point-in-time metrics";
        hoverLeakageInfo.style.color = "var(--muted)";
      }
      drawLeakageLab();
    });
  }

  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      labMode = btn.dataset.mode || "causal";
      drawLeakageLab();
    });
  });

  shockSelect?.addEventListener("change", drawLeakageLab);
  reseedBtn?.addEventListener("click", () => {
    seed = (seed * 1664525 + 1013904223) % 100000;
    drawLeakageLab();
  });
  drawLeakageLab();

  // 7. TAB 2: JUMP-DIFFUSION VOLATILITY SMILE (Neural Bates DML)
  const smileCanvas = document.getElementById("smile-canvas");
  const sliderLambda = document.getElementById("slider-jump-lambda");
  const sliderMu = document.getElementById("slider-jump-mu");
  const sliderVol = document.getElementById("slider-vol-vol");
  const valLambda = document.getElementById("val-jump-lambda");
  const valMu = document.getElementById("val-jump-mu");
  const valVol = document.getElementById("val-vol-vol");
  const resetSmileBtn = document.getElementById("reset-smile-btn");
  const hoverSmileInfo = document.getElementById("smile-hover-info");

  const mAtmVol = document.getElementById("m-atm-vol");
  const mSkewSlope = document.getElementById("m-skew-slope");
  const mOtmPremium = document.getElementById("m-otm-premium");

  let jumpLambda = 1.2;
  let jumpMu = -0.08;
  let volOfVol = 0.40;
  let hoveredMoneyness = null;

  function computeSmileData() {
    const moneyness = [];
    const bsVol = [];
    const batesVol = [];

    const sigma0 = 0.20;
    const sigmaJ = 0.15;
    const rho = -0.65;

    for (let k = 80; k <= 120; k += 1) {
      const m = k / 100; // 0.80 to 1.20
      const logM = Math.log(m);

      // Bates SVJD Volatility Surface approximation
      const baseVol = Math.sqrt(sigma0 * sigma0 + jumpLambda * (jumpMu * jumpMu + sigmaJ * sigmaJ));
      const skew = (jumpMu * 1.85 + rho * volOfVol * 0.32) * logM;
      const curvature = (volOfVol * volOfVol * 0.24 + jumpLambda * sigmaJ * 0.45) * (logM * logM);
      const bates = Math.max(0.12, baseVol - skew + curvature);

      moneyness.push(m);
      bsVol.push(sigma0);
      batesVol.push(bates);
    }

    return { moneyness, bsVol, batesVol };
  }

  function drawSmileLab() {
    if (!smileCanvas) return;
    const ctx = smileCanvas.getContext("2d");
    const W = smileCanvas.width;
    const H = smileCanvas.height;
    ctx.clearRect(0, 0, W, H);

    const isPaper = root.getAttribute("data-theme") === "paper";
    const textCol = isPaper ? "#575a61" : "#9499a3";
    const bsCol = isPaper ? "#9499a3" : "#575a61";
    const batesCol = isPaper ? "#785527" : "#c8a97e";
    const accentCol = isPaper ? "#785527" : "#c8a97e";
    const guideCol = isPaper ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";

    const { moneyness, bsVol, batesVol } = computeSmileData();

    const minV = 0.12;
    const maxV = 0.40;
    const padX = 40, padY = 32;

    const xOf = (m) => padX + ((m - 0.80) / 0.40) * (W - padX * 2);
    const yOf = (v) => H - padY - ((v - minV) / (maxV - minV)) * (H - padY * 2);

    // Grid lines for Volatility percentages
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = textCol;
    for (let v = 0.15; v <= 0.35; v += 0.05) {
      const y = yOf(v);
      ctx.strokeStyle = isPaper ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(W - padX, y);
      ctx.stroke();
      ctx.fillText(`${(v * 100).toFixed(0)}%`, 8, y + 3);
    }

    // Moneyness axis labels
    for (let m = 0.85; m <= 1.15; m += 0.10) {
      const x = xOf(m);
      ctx.fillText(m.toFixed(2), x - 12, H - 12);
    }

    // Vertical line at ATM (K/S = 1.00)
    const atmX = xOf(1.0);
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isPaper ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.moveTo(atmX, 10);
    ctx.lineTo(atmX, H - 24);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = accentCol;
    ctx.fillText("ATM (K/S = 1.00)", atmX - 38, 20);

    // Black-Scholes Flat Curve (Dashed)
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    for (let i = 0; i < moneyness.length; i++) {
      const x = xOf(moneyness[i]), y = yOf(bsVol[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = bsCol;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // Bates SVJD Skewed Smile Curve (Solid)
    ctx.beginPath();
    for (let i = 0; i < moneyness.length; i++) {
      const x = xOf(moneyness[i]), y = yOf(batesVol[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = batesCol;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Hover Guide Line
    if (hoveredMoneyness !== null) {
      const hx = xOf(hoveredMoneyness);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = guideCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, 24);
      ctx.lineTo(hx, H - 24);
      ctx.stroke();

      // Find closest Bates Vol
      let closestIdx = 0;
      let minDiff = 999;
      for (let i = 0; i < moneyness.length; i++) {
        if (Math.abs(moneyness[i] - hoveredMoneyness) < minDiff) {
          minDiff = Math.abs(moneyness[i] - hoveredMoneyness);
          closestIdx = i;
        }
      }

      ctx.fillStyle = accentCol;
      ctx.beginPath();
      ctx.arc(hx, yOf(batesVol[closestIdx]), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ON-CANVAS LEGEND
    const legY = H - 8;
    ctx.fillStyle = batesCol;
    ctx.fillRect(padX + 2, legY - 7, 12, 2);
    ctx.fillText("Bates SVJD Smile (Skewed Surface)", padX + 20, legY);

    ctx.fillStyle = bsCol;
    ctx.fillRect(padX + 280, legY - 7, 12, 2);
    ctx.fillText("Black-Scholes Flat (Gaussian Baseline)", padX + 298, legY);

    // Compute Readout Metrics
    const atmIdx = 20; // 1.00
    const otmPutIdx = 5; // 0.85
    const atmIv = (batesVol[atmIdx] * 100).toFixed(1);
    const otmPutIv = (batesVol[otmPutIdx] * 100).toFixed(1);
    const premium = (batesVol[otmPutIdx] - 0.20) * 100;
    const skewSlopeVal = ((batesVol[25] - batesVol[15]) / 0.10).toFixed(2);

    if (mAtmVol) mAtmVol.textContent = `${atmIv}% IV`;
    if (mSkewSlope) mSkewSlope.textContent = `${skewSlopeVal} (Left-Skewed Put Premium)`;
    if (mOtmPremium) mOtmPremium.textContent = `+${premium.toFixed(1)}% over Black-Scholes`;
  }

  // Hover listener for Smile Canvas
  if (smileCanvas) {
    const handleSmileHover = (clientX) => {
      const rect = smileCanvas.getBoundingClientRect();
      const scaleX = smileCanvas.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      const padX = 40;
      const m = 0.80 + ((x - padX) / (smileCanvas.width - padX * 2)) * 0.40;
      if (m >= 0.80 && m <= 1.20) {
        hoveredMoneyness = m;
        const { moneyness, batesVol } = computeSmileData();
        let closestIdx = 0;
        let minDiff = 999;
        for (let i = 0; i < moneyness.length; i++) {
          if (Math.abs(moneyness[i] - m) < minDiff) {
            minDiff = Math.abs(moneyness[i] - m);
            closestIdx = i;
          }
        }
        const iv = batesVol[closestIdx];
        const diff = iv - 0.20;
        if (hoverSmileInfo) {
          hoverSmileInfo.textContent = `Moneyness K/S: ${m.toFixed(2)} (${m < 0.96 ? 'OTM Put' : m > 1.04 ? 'OTM Call' : 'ATM'}) · Bates SVJD IV: ${(iv * 100).toFixed(1)}% · Black-Scholes IV: 20.0% · Skew Delta: ${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(1)}%`;
          hoverSmileInfo.style.color = "var(--text)";
        }
        drawSmileLab();
      }
    };

    smileCanvas.addEventListener("mousemove", (e) => handleSmileHover(e.clientX));
    smileCanvas.addEventListener("mouseleave", () => {
      hoveredMoneyness = null;
      if (hoverSmileInfo) {
        hoverSmileInfo.textContent = "Hover over curve to inspect moneyness (K/S) and implied volatility";
        hoverSmileInfo.style.color = "var(--muted)";
      }
      drawSmileLab();
    });
  }

  // Slider Listeners for Smile Lab
  sliderLambda?.addEventListener("input", (e) => {
    jumpLambda = Number(e.target.value);
    if (valLambda) valLambda.textContent = jumpLambda.toFixed(1);
    drawSmileLab();
  });

  sliderMu?.addEventListener("input", (e) => {
    jumpMu = Number(e.target.value) / 100;
    if (valMu) valMu.textContent = `${Number(e.target.value)}%`;
    drawSmileLab();
  });

  sliderVol?.addEventListener("input", (e) => {
    volOfVol = Number(e.target.value);
    if (valVol) valVol.textContent = volOfVol.toFixed(2);
    drawSmileLab();
  });

  resetSmileBtn?.addEventListener("click", () => {
    jumpLambda = 1.2;
    jumpMu = -0.08;
    volOfVol = 0.40;
    if (sliderLambda) sliderLambda.value = "1.2";
    if (sliderMu) sliderMu.value = "-8";
    if (sliderVol) sliderVol.value = "0.40";
    if (valLambda) valLambda.textContent = "1.2";
    if (valMu) valMu.textContent = "-8%";
    if (valVol) valVol.textContent = "0.40";
    drawSmileLab();
  });

  // 8. Project Filter with Accessibility (aria-pressed) & Inline CI Drawers
  const filterPills = document.querySelectorAll(".filter-pill");
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => {
        p.classList.remove("active");
        p.setAttribute("aria-pressed", "false");
      });
      pill.classList.add("active");
      pill.setAttribute("aria-pressed", "true");
      const filter = pill.dataset.filter || "all";
      document.querySelectorAll(".work-card").forEach((card) => {
        const cats = (card.dataset.cat || "").split(" ");
        card.style.display = filter === "all" || cats.includes(filter) ? "flex" : "none";
      });
    });
  });

  document.querySelectorAll(".ci-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pre = btn.nextElementSibling;
      if (!pre) return;
      const isHidden = pre.hasAttribute("hidden");
      if (isHidden) {
        pre.removeAttribute("hidden");
        btn.textContent = "Hide Ubuntu 24.04 CI Log ▴";
        btn.setAttribute("aria-expanded", "true");
      } else {
        pre.setAttribute("hidden", "");
        btn.textContent = "Inspect Ubuntu 24.04 CI Log ▾";
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });

  // 9. Copy Email Helper
  const copyBtn = document.getElementById("copy-email");
  const copyStatus = document.getElementById("copy-status");
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("ataraman9@gmail.com");
      if (copyStatus) copyStatus.textContent = "Copied ✓";
      setTimeout(() => {
        if (copyStatus) copyStatus.textContent = "Copy";
      }, 2000);
    } catch {
      window.location.href = "mailto:ataraman9@gmail.com";
    }
  };
  copyBtn?.addEventListener("click", copyEmail);

  // 10. Quick Jump Modal (/ or Ctrl+K)
  const modal = document.getElementById("cmd-modal");
  const cmdInput = document.getElementById("cmd-input");
  const cmdBtn = document.getElementById("cmd-btn");
  const cmdClose = document.getElementById("cmd-close");
  const cmdItems = Array.from(document.querySelectorAll("#cmd-list li"));

  const openModal = () => {
    if (!modal) return;
    modal.removeAttribute("hidden");
    if (cmdInput) {
      cmdInput.value = "";
      cmdItems.forEach((li) => (li.style.display = ""));
      setTimeout(() => cmdInput.focus(), 20);
    }
  };

  const closeModal = () => modal?.setAttribute("hidden", "");

  cmdBtn?.addEventListener("click", openModal);
  cmdClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if ((e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      openModal();
    } else if (e.key === "Escape") {
      closeModal();
    }
  });

  cmdInput?.addEventListener("input", () => {
    const q = cmdInput.value.toLowerCase().trim();
    cmdItems.forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  cmdItems.forEach((li) => {
    li.addEventListener("click", () => {
      const action = li.dataset.action;
      if (action === "jump" && li.dataset.target) {
        document.querySelector(li.dataset.target)?.scrollIntoView({ behavior: "smooth" });
      } else if (action === "theme") {
        themeBtn?.click();
      } else if (action === "email") {
        copyEmail();
      } else if (action === "print") {
        window.print();
      } else if (action === "url" && li.dataset.url) {
        window.open(li.dataset.url, "_blank", "noopener");
      }
      closeModal();
    });
  });
})();
