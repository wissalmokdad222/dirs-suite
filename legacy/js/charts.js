/**
 * charts.js — Visualisations pour DIRS Security Suite
 */

function drawRadar(canvasId, categories, scores) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.parentElement.offsetWidth < 400 ? canvas.parentElement.offsetWidth - 40 : 300;
  canvas.width = size;
  canvas.height = size;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 40;
  const N = categories.length;

  ctx.clearRect(0, 0, W, H);

  function getAxisPoint(i, r) {
    const angle = (Math.PI * 2 / N) * i - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Grille
  [25, 50, 75, 100].forEach(lvl => {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const p = getAxisPoint(i, R * lvl / 100);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#E5E0D8';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Data
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const s = scores[i] || 0;
    const p = getAxisPoint(i, R * s / 100);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(184, 134, 11, 0.1)';
  ctx.fill();
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Points & Labels
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#8F8F8F';
  ctx.textAlign = 'center';
  for (let i = 0; i < N; i++) {
    const p = getAxisPoint(i, R + 10);
    ctx.fillText(categories[i].name.split(' ')[0], p.x, p.y);
    
    // Tiny dots
    const dp = getAxisPoint(i, R * (scores[i] || 0) / 100);
    ctx.beginPath();
    ctx.arc(dp.x, dp.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#B8860B';
    ctx.fill();
  }
}

function animateRadar(canvasId, categories, targetScores) {
  // Static rendering for stability in complex layouts
  drawRadar(canvasId, categories, targetScores);
}

window.Charts = { animateRadar, drawRadar };
