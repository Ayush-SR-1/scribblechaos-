// 3D Dynamic Animated Paint Strokes & Splash Background Engine for ScribbleChaos
class Paint3DBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;

    this.strokes = [];
    this.splashes = [];
    this.time = 0;

    this.initStrokes();
    this.initSplashes();
    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    });
  }

  initStrokes() {
    // 3D curving ribbon paint strokes floating in perspective space
    const colors = [
      { r: 255, g: 204, b: 0, a: 0.85 },   // Yellow
      { r: 0, g: 220, b: 255, a: 0.8 },    // Cyan
      { r: 255, g: 0, b: 128, a: 0.8 },    // Pink
      { r: 157, g: 78, b: 221, a: 0.75 },  // Purple
      { r: 57, g: 255, b: 20, a: 0.75 }    // Lime Green
    ];

    for (let i = 0; i < 7; i++) {
      this.strokes.push({
        points: [],
        color: colors[i % colors.length],
        thickness: 18 + Math.random() * 26,
        speed: 0.008 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        zDepth: -200 + Math.random() * 500, // 3D z-depth perspective
        rotSpeed: 0.005 + Math.random() * 0.01,
        amplitudeX: 180 + Math.random() * 220,
        amplitudeY: 140 + Math.random() * 180,
        offsetY: (i - 3) * 120
      });
    }
  }

  initSplashes() {
    // Floating 3D glossy paint splash droplets
    const splashColors = ['#ffcc00', '#00f0ff', '#ff007f', '#39ff14', '#9d4edd', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      this.splashes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 800 - 400,
        radius: 3 + Math.random() * 12,
        color: splashColors[Math.floor(Math.random() * splashColors.length)],
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  animate() {
    this.time += 0.016;

    // Smooth mouse parallax interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Clear background with rich subtle gradient
    this.ctx.fillStyle = '#0a0d17';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw background subtle grid lines
    this.drawSubtleGrid();

    // Render 3D Paint Strokes
    this.render3DPaintStrokes();

    // Render 3D Paint Splashes & Particles
    this.render3DPaintSplashes();

    requestAnimationFrame(() => this.animate());
  }

  drawSubtleGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < this.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  render3DPaintStrokes() {
    const focalLength = 400; // 3D Perspective projection parameter
    const centerX = this.width / 2 + (this.mouseX - this.width / 2) * 0.08;
    const centerY = this.height / 2 + (this.mouseY - this.height / 2) * 0.08;

    this.strokes.forEach((stroke, sIndex) => {
      this.ctx.save();
      
      const numPoints = 60;
      const points = [];

      for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        const angle = this.time * stroke.speed * 60 + stroke.phase + t * Math.PI * 3;
        
        // 3D coordinates
        let worldX = Math.sin(angle) * stroke.amplitudeX + (t - 0.5) * this.width * 1.4;
        let worldY = Math.cos(angle * 1.3) * stroke.amplitudeY + stroke.offsetY + Math.sin(this.time + t * 4) * 40;
        let worldZ = stroke.zDepth + Math.sin(angle * 0.8) * 250;

        // 3D Perspective Projection
        const scale = focalLength / (focalLength + worldZ + 500);
        const projX = centerX + worldX * scale;
        const projY = centerY + worldY * scale;

        points.push({ x: projX, y: projY, scale, z: worldZ });
      }

      if (points.length > 2) {
        // Draw glossy 3D ribbon paint stroke
        for (let i = 1; i < points.length - 1; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const p2 = points[i + 1];

          const currentWidth = stroke.thickness * p1.scale;

          const grad = this.ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          const col = stroke.color;
          grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a * p1.scale})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, 0.9)`); // glossy highlight center
          grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a * 0.3})`);

          this.ctx.beginPath();
          this.ctx.moveTo(p0.x, p0.y);
          this.ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);

          this.ctx.strokeStyle = grad;
          this.ctx.lineWidth = Math.max(2, currentWidth);
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
          
          // 3D glow & shadow effect
          this.ctx.shadowColor = `rgba(${col.r}, ${col.g}, ${col.b}, 0.6)`;
          this.ctx.shadowBlur = 15 * p1.scale;
          this.ctx.stroke();
        }
      }

      this.ctx.restore();
    });
  }

  render3DPaintSplashes() {
    const focalLength = 350;
    const centerX = this.width / 2 + (this.mouseX - this.width / 2) * 0.12;
    const centerY = this.height / 2 + (this.mouseY - this.height / 2) * 0.12;

    this.splashes.forEach(splash => {
      splash.x += splash.vx;
      splash.y += splash.vy;

      if (splash.x < -50) splash.x = this.width + 50;
      if (splash.x > this.width + 50) splash.x = -50;
      if (splash.y < -50) splash.y = this.height + 50;
      if (splash.y > this.height + 50) splash.y = -50;

      const scale = focalLength / (focalLength + splash.z + 500);
      const projX = centerX + (splash.x - this.width / 2) * scale;
      const projY = centerY + (splash.y - this.height / 2) * scale;
      const currentRadius = Math.max(1, splash.radius * scale * (1 + Math.sin(this.time * 3 + splash.phase) * 0.2));

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(projX, projY, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = splash.color;
      this.ctx.shadowColor = splash.color;
      this.ctx.shadowBlur = 10 * scale;
      this.ctx.fill();

      // Render splash droplet trail
      this.ctx.beginPath();
      this.ctx.arc(projX - splash.vx * 4, projY - splash.vy * 4, currentRadius * 0.5, 0, Math.PI * 2);
      this.ctx.fillStyle = splash.color;
      this.ctx.fill();

      this.ctx.restore();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.paint3DBg = new Paint3DBackground('bg3dCanvas');
});
