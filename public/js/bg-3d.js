// High-Performance 60FPS Animated 3D Background Engine for ScribbleChaos
class Paint3DBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    
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
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      }, 100);
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    });
  }

  initStrokes() {
    const colors = [
      { r: 255, g: 204, b: 0, a: 0.8 },
      { r: 0, g: 220, b: 255, a: 0.75 },
      { r: 255, g: 0, b: 128, a: 0.75 },
      { r: 157, g: 78, b: 221, a: 0.7 },
      { r: 57, g: 255, b: 20, a: 0.7 }
    ];

    for (let i = 0; i < 5; i++) {
      this.strokes.push({
        color: colors[i % colors.length],
        thickness: 16 + i * 4,
        speed: 0.008 + i * 0.002,
        phase: (i * Math.PI) / 2.5,
        zDepth: -150 + i * 100,
        amplitudeX: 160 + i * 20,
        amplitudeY: 120 + i * 15,
        offsetY: (i - 2) * 110
      });
    }
  }

  initSplashes() {
    const splashColors = ['#ffcc00', '#00f0ff', '#ff007f', '#39ff14', '#9d4edd'];
    for (let i = 0; i < 25; i++) {
      this.splashes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 600 - 300,
        radius: 3 + Math.random() * 8,
        color: splashColors[i % splashColors.length],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  animate() {
    this.time += 0.014;

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    // Fast background fill
    this.ctx.fillStyle = '#0a0d17';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // High performance render without heavy shadowBlur
    this.render3DPaintStrokes();
    this.render3DPaintSplashes();

    requestAnimationFrame(() => this.animate());
  }

  render3DPaintStrokes() {
    const focalLength = 380;
    const centerX = this.width / 2 + (this.mouseX - this.width / 2) * 0.06;
    const centerY = this.height / 2 + (this.mouseY - this.height / 2) * 0.06;

    this.strokes.forEach((stroke) => {
      this.ctx.save();
      
      const numPoints = 30; // Optimized point count
      const points = [];

      for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        const angle = this.time * stroke.speed * 60 + stroke.phase + t * Math.PI * 2.5;
        
        let worldX = Math.sin(angle) * stroke.amplitudeX + (t - 0.5) * this.width * 1.3;
        let worldY = Math.cos(angle * 1.2) * stroke.amplitudeY + stroke.offsetY + Math.sin(this.time + t * 3) * 30;
        let worldZ = stroke.zDepth + Math.sin(angle * 0.7) * 180;

        const scale = focalLength / (focalLength + worldZ + 450);
        const projX = centerX + worldX * scale;
        const projY = centerY + worldY * scale;

        points.push({ x: projX, y: projY, scale });
      }

      if (points.length > 2) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          this.ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        }

        const col = stroke.color;
        this.ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a})`;
        this.ctx.lineWidth = Math.max(3, stroke.thickness * points[0].scale);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
      }

      this.ctx.restore();
    });
  }

  render3DPaintSplashes() {
    const focalLength = 350;
    const centerX = this.width / 2 + (this.mouseX - this.width / 2) * 0.08;
    const centerY = this.height / 2 + (this.mouseY - this.height / 2) * 0.08;

    this.splashes.forEach(splash => {
      splash.x += splash.vx;
      splash.y += splash.vy;

      if (splash.x < -30) splash.x = this.width + 30;
      if (splash.x > this.width + 30) splash.x = -30;
      if (splash.y < -30) splash.y = this.height + 30;
      if (splash.y > this.height + 30) splash.y = -30;

      const scale = focalLength / (focalLength + splash.z + 450);
      const projX = centerX + (splash.x - this.width / 2) * scale;
      const projY = centerY + (splash.y - this.height / 2) * scale;
      const r = Math.max(1.5, splash.radius * scale);

      this.ctx.fillStyle = splash.color;
      this.ctx.beginPath();
      this.ctx.arc(projX, projY, r, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.paint3DBg = new Paint3DBackground('bg3dCanvas');
});
