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
      clockEl.textContent = "IST";
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
        const strokeGold = isPaper ? "rgba(140,102,53,0.55)" : "rgba(200,169,126,0.55)";
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

  // 5. Interactive Lookahead vs. Point-in-Time Sketch
  const labCanvas = document.getElementById("leakage-canvas");
  const shockSelect = document.getElementById("shock-select");
  const reseedBtn = document.getElementById("reseed-btn");
  const mIn = document.getElementById("m-insample");
  const mOos = document.getElementById("m-oos");
  const mCov = document.getElementById("m-cov");
  const mVerdict = document.getElementById("m-verdict");

  let labMode = "causal";
  let seed = 42;

  const mulberry32 = (a) => () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  function drawLeakageLab() {
    if (!labCanvas) return;
    const ctx = labCanvas.getContext("2d");
    const W = labCanvas.width;
    const H = labCanvas.height;
    ctx.clearRect(0, 0, W, H);

    const isPaper = root.getAttribute("data-theme") === "paper";
    const textCol = isPaper ? "#575a61" : "#9499a3";
    const truthCol = isPaper ? "#17181a" : "#ecebe6";
    const accentCol = isPaper ? "#8c6635" : "#c8a97e";
    const dangerCol = isPaper ? "#b5442b" : "#e07a5f";
    const okCol = isPaper ? "#2d6a4f" : "#81b29a";
    const bandFill = isPaper ? "rgba(45,106,79,0.13)" : "rgba(129,178,154,0.15)";

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
        // Uses ONLY past values up to i - 1
        const prev1 = truth[Math.max(0, i - 1)];
        const prev2 = truth[Math.max(0, i - 2)];
        const est = prev1 * 0.86 + (prev1 - prev2) * 0.18;
        const localSpread = i < split ? 2.15 : 2.15 * shock;
        pred.push(est);
        band.push(localSpread);
      } else {
        if (i < split) {
          // Peeks ahead at i + 1 and i + 2 inside historical CSV!
          const next1 = truth[Math.min(N - 1, i + 1)];
          pred.push(truth[i] * 0.68 + next1 * 0.32);
          band.push(0.65); // Artificially tiny overconfident band
        } else {
          // Future rows don't exist in live deployment; overfit weights fail badly
          const stale = truth[split - 1] * 0.5 + truth[i - 1] * 0.35 + Math.sin(i * 0.25) * 2.4;
          pred.push(stale);
          band.push(0.75);
        }
      }
    }

    const allVals = truth.concat(pred.map((p, i) => p + band[i]), pred.map((p, i) => p - band[i]));
    const minV = Math.min(...allVals) - 1.5;
    const maxV = Math.max(...allVals) + 1.5;
    const padX = 28, padY = 26;
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
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(splitX, 12);
    ctx.lineTo(splitX, H - 12);
    ctx.stroke();
    ctx.restore();

    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = textCol;
    ctx.fillText("IN-SAMPLE (HISTORICAL CSV)", padX + 6, 18);
    ctx.fillStyle = accentCol;
    ctx.fillText("OUT-OF-SAMPLE CUTOFF (LIVE REALITY) →", splitX + 10, 18);

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

    // Compute Honest Metrics
    let inErr = 0, oosErr = 0, covered = 0;
    for (let i = 0; i < split; i++) inErr += Math.abs(truth[i] - pred[i]);
    for (let i = split; i < N; i++) {
      const err = Math.abs(truth[i] - pred[i]);
      oosErr += err;
      if (err <= band[i]) covered++;
    }
    const inMae = (inErr / split).toFixed(2);
    const oosMae = (oosErr / (N - split)).toFixed(2);
    const covPct = Math.round((covered / (N - split)) * 100);

    if (mIn) mIn.textContent = `MAE ${inMae}`;
    if (mOos) {
      mOos.textContent = `MAE ${oosMae}`;
      mOos.style.color = labMode === "causal" ? okCol : dangerCol;
    }
    if (mCov) {
      mCov.textContent = `${covPct}% inside band`;
      mCov.style.color = covPct >= 82 ? okCol : dangerCol;
    }
    if (mVerdict) {
      mVerdict.textContent =
        labMode === "causal"
          ? "Realistic fit; band widens with shock"
          : "Fake notebook fit -> breaks live";
      mVerdict.style.color = labMode === "causal" ? okCol : dangerCol;
    }
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

  // 6. Project Filter & Inline CI Drawers
  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
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
      } else {
        pre.setAttribute("hidden", "");
        btn.textContent = "Inspect Ubuntu 24.04 CI Log ▾";
      }
    });
  });

  // 7. Copy Email Helper
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

  // 8. Quick Jump Modal (/ or Ctrl+K)
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
      } else if (action === "url" && li.dataset.url) {
        window.open(li.dataset.url, "_blank", "noopener");
      }
      closeModal();
    });
  });
})();
