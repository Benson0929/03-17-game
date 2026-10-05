// Concentric image slices produce real spatial twisting without pixel readback,
// so this also works when the game is opened directly using file://.
let dreamVortexFrame = null;
let dreamVortexGeneration = 0;
const dreamVortexImage = new Image();
dreamVortexImage.src = 'Images/mirror.jpg';

function stopDreamVortex() {
  dreamVortexGeneration++;
  cancelAnimationFrame(dreamVortexFrame);
  dreamVortexFrame = null;
  document.getElementById('dream-vortex').classList.remove('ready');
}

function startDreamVortex() {
  stopDreamVortex();
  const generation = dreamVortexGeneration;
  const canvas = document.getElementById('dream-vortex');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plate = document.createElement('canvas');
  const source = plate.getContext('2d');
  if (!source) return;
  let width = 0, height = 0, radius = 0;
  let started = null, lastFrame = -Infinity;

  function resize() {
    const ratio = Math.min(1, 1100 / window.innerWidth);
    width = Math.max(1, Math.round(window.innerWidth * ratio));
    height = Math.max(1, Math.round(window.innerHeight * ratio));
    canvas.width = width;
    canvas.height = height;
    radius = Math.hypot(width, height) / 2;
    plate.width = plate.height = Math.ceil(radius * 2 + 4);
    // Overscan supplies image content at every angle, without black corners.
    const scale = Math.max(plate.width / dreamVortexImage.naturalWidth,
      plate.height / dreamVortexImage.naturalHeight);
    const iw = dreamVortexImage.naturalWidth * scale;
    const ih = dreamVortexImage.naturalHeight * scale;
    source.drawImage(dreamVortexImage, (plate.width - iw) / 2,
      (plate.height - ih) / 2, iw, ih);
  }

  function draw(now) {
    if (generation !== dreamVortexGeneration) return;
    dreamVortexFrame = requestAnimationFrame(draw);
    if (now - lastFrame < 1000 / 24) return;
    lastFrame = now;
    if (!dreamVortexImage.complete || !dreamVortexImage.naturalWidth) return;
    if (started === null) started = now;
    const targetWidth = Math.round(window.innerWidth * Math.min(1, 1100 / window.innerWidth));
    const targetHeight = Math.round(window.innerHeight * Math.min(1, 1100 / window.innerWidth));
    if (width !== targetWidth || height !== targetHeight) resize();
    const seconds = (now - started) / 1000;
    const progress = Math.min(seconds / 6, 1);
    const ease = progress * progress * (3 - 2 * progress);
    const twist = reducedMotion ? 0.12 : 0.45 * ease;
    // Positive canvas rotation is clockwise. The whole spiral keeps turning.
    const spin = reducedMotion ? 0 : seconds * 0.025;
    ctx.clearRect(0, 0, width, height);
    const rings = 150;
    const step = radius / rings;
    for (let i = rings - 1; i >= 0; i--) {
      const inner = i * step;
      const outer = (i + 1) * step + 0.7;
      const normalized = (inner + step / 2) / radius;
      const angle = spin + twist * Math.pow(1 - normalized, 1.6);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.beginPath();
      ctx.arc(0, 0, outer, 0, Math.PI * 2);
      if (inner > 0) ctx.arc(0, 0, Math.max(0, inner - 0.7), 0, Math.PI * 2, true);
      ctx.clip();
      ctx.rotate(angle);
      ctx.drawImage(plate, -plate.width / 2, -plate.height / 2);
      ctx.restore();
    }
    canvas.classList.add('ready');
    if (reducedMotion) {
      cancelAnimationFrame(dreamVortexFrame);
      dreamVortexFrame = null;
    }
  }
  dreamVortexFrame = requestAnimationFrame(draw);
}
