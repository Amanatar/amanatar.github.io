/**
 * Aman Atar — Stochastic Harmonic Ensemble Canvas
 * Simulates 18 mean-reverting Ornstein-Uhlenbeck paths with Poisson jump perturbations
 * converging toward a latent golden harmonic carrier wave.
 * Zero external libraries · Retina-sharp · Battery-conscious IntersectionObserver
 */

(function () {
  'use strict';

  const canvas = document.getElementById('stochastic-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const heroSection = document.querySelector('.hero');

  // Motion preference check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Configuration
  const NUM_PATHS = 18;
  const NUM_POINTS = 90;
  let width = 0;
  let height = 0;
  let dpr = 1;

  let animFrameId = null;
  let isVisible = true;
  let globalTime = 0;

  // Mouse interaction state
  const mouse = {
    x: -9999,
    y: -9999,
    active: false,
    radius: 140
  };

  // Gaussian noise via Box-Muller transform
  function randomGaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Path object representing an Ornstein-Uhlenbeck stochastic trajectory
  class StochasticPath {
    constructor(index) {
      this.index = index;
      this.offset = (index - (NUM_PATHS - 1) / 2) * 6.5; // Spatial dispersion
      this.theta = 0.055 + Math.random() * 0.035;       // Mean-reversion speed
      this.sigma = 0.75 + Math.random() * 0.55;         // Diffusion variance
      this.phase = (index / NUM_PATHS) * Math.PI * 2;
      this.jumpProbability = 0.0035;
      this.values = new Float32Array(NUM_POINTS);
      this.initialized = false;
    }

    reset(carrierFn) {
      for (let i = 0; i < NUM_POINTS; i++) {
        const x = (i / (NUM_POINTS - 1)) * width;
        const target = carrierFn(x, 0) + this.offset;
        this.values[i] = target + randomGaussian() * (this.sigma * 4);
      }
      this.initialized = true;
    }

    update(carrierFn, time) {
      for (let i = 0; i < NUM_POINTS; i++) {
        const x = (i / (NUM_POINTS - 1)) * width;
        const target = carrierFn(x, time) + this.offset;
        const current = this.values[i];

        // Mean-reverting pull: theta * (target - current)
        let drift = this.theta * (target - current);

        // Diffusion: sigma * dW
        let diffusion = this.sigma * randomGaussian() * 1.8;

        // Occasional Poisson jump
        if (Math.random() < this.jumpProbability) {
          diffusion += (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 18);
        }

        // Localized mouse volatility perturbation
        if (mouse.active) {
          const dx = x - mouse.x;
          const dy = current - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const factor = 1.0 - dist / mouse.radius;
            // Volatility expansion + gentle repellent force
            diffusion += randomGaussian() * factor * 5.0;
            drift += (dy > 0 ? 1 : -1) * factor * 2.5;
          }
        }

        this.values[i] = current + drift + diffusion;
      }
    }
  }

  // Carrier wave defining the latent structural law
  function carrierWave(x, time) {
    const normX = x / Math.max(1, width);
    const wave1 = Math.sin(normX * Math.PI * 2.8 + time * 0.45) * (height * 0.16);
    const wave2 = Math.cos(normX * Math.PI * 4.2 - time * 0.32) * (height * 0.05);
    const midY = height * 0.50;
    return midY + wave1 + wave2;
  }

  // Paths ensemble
  const paths = Array.from({ length: NUM_PATHS }, (_, i) => new StochasticPath(i));

  // Resize canvas to match hero bounding box with Retina scaling
  function resize() {
    const rect = heroSection ? heroSection.getBoundingClientRect() : { width: window.innerWidth, height: 480 };
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(280, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    paths.forEach(p => p.reset(carrierWave));

    if (prefersReducedMotion) {
      drawStaticFrame();
    }
  }

  // Draw one static clean frame for prefers-reduced-motion
  function drawStaticFrame() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    const isParchment = document.documentElement.getAttribute('data-theme') === 'parchment';
    const carrierColor = isParchment ? 'rgba(140, 109, 70, 0.4)' : 'rgba(200, 169, 126, 0.35)';
    const pathColor = isParchment ? 'rgba(107, 111, 118, 0.18)' : 'rgba(138, 143, 152, 0.14)';

    // Render static smooth curves
    for (let p = 0; p < NUM_PATHS; p++) {
      ctx.beginPath();
      for (let i = 0; i < NUM_POINTS; i++) {
        const x = (i / (NUM_POINTS - 1)) * width;
        const y = carrierWave(x, 0) + (p - NUM_PATHS / 2) * 8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw central latent carrier
    drawCarrierLine(carrierColor);
  }

  // Subtle coordinate grid representing the filtration lattice
  function drawGrid() {
    const isParchment = document.documentElement.getAttribute('data-theme') === 'parchment';
    const gridColor = isParchment ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.02)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    const stepX = width / 8;
    for (let x = stepX; x < width; x += stepX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const stepY = height / 5;
    for (let y = stepY; y < height; y += stepY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // Draw the latent golden carrier line
  function drawCarrierLine(color) {
    ctx.beginPath();
    ctx.setLineDash([4, 6]);
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * width;
      const y = carrierWave(x, globalTime);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Animation render loop
  function render() {
    if (!isVisible) return;

    globalTime += 0.012;
    ctx.clearRect(0, 0, width, height);

    drawGrid();

    const isParchment = document.documentElement.getAttribute('data-theme') === 'parchment';
    const carrierColor = isParchment ? 'rgba(140, 109, 70, 0.45)' : 'rgba(200, 169, 126, 0.38)';
    const baseColor = isParchment ? 'rgba(107, 111, 118, ' : 'rgba(138, 143, 152, ';

    // Update and draw each path in the stochastic ensemble
    for (let p = 0; p < NUM_PATHS; p++) {
      const path = paths[p];
      path.update(carrierWave, globalTime);

      const alpha = 0.08 + (1 - Math.abs(p - NUM_PATHS / 2) / (NUM_PATHS / 2)) * 0.14;
      ctx.beginPath();

      // Monotonic quadratic interpolation between discrete points
      for (let i = 0; i < NUM_POINTS - 1; i++) {
        const x1 = (i / (NUM_POINTS - 1)) * width;
        const y1 = path.values[i];
        const x2 = ((i + 1) / (NUM_POINTS - 1)) * width;
        const y2 = path.values[i + 1];
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        if (i === 0) {
          ctx.moveTo(x1, y1);
        }
        ctx.quadraticCurveTo(x1, y1, mx, my);
      }

      ctx.strokeStyle = baseColor + alpha + ')';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    // Draw central latent harmonic wave
    drawCarrierLine(carrierColor);

    animFrameId = requestAnimationFrame(render);
  }

  // Event Listeners for Mouse Proximity
  if (heroSection) {
    heroSection.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    heroSection.addEventListener('mouseleave', function () {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  // IntersectionObserver to pause simulation when out of viewport
  if ('IntersectionObserver' in window && heroSection) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !prefersReducedMotion) {
            if (!animFrameId) {
              animFrameId = requestAnimationFrame(render);
            }
          } else {
            if (animFrameId) {
              cancelAnimationFrame(animFrameId);
              animFrameId = null;
            }
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(heroSection);
  }

  // Debounced window resize handler
  let resizeTimeout = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 100);
  });

  // Initial setup
  resize();
  if (!prefersReducedMotion) {
    animFrameId = requestAnimationFrame(render);
  }
})();
