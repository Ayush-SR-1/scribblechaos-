// Interactive HTML5 Drawing Canvas Engine for ScribbleChaos
class ScribbleCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.color = '#000000';
    this.size = 6;
    this.isEraser = false;
    this.isNeonGlow = false;
    this.undoStack = [];
    this.redoStack = [];
    this.onStrokeCallback = null;

    this.resizeCanvas();
    this.bindEvents();
    this.saveState();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    
    // Maintain internal high resolution
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);

    this.canvas.width = rect.width || 600;
    this.canvas.height = rect.height || 450;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (tempCanvas.width > 0) {
      this.ctx.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Touch Events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.startDrawing(touch);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.draw(touch);
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const pos = this.getPos(e);
    this.lastPos = pos;

    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);

    if (window.soundEngine) window.soundEngine.playDrawStroke();
  }

  draw(e) {
    if (!this.isDrawing) return;
    const currentPos = this.getPos(e);

    this.ctx.lineWidth = this.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.isEraser) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.shadowBlur = 0;
    } else {
      this.ctx.strokeStyle = this.color;
      if (this.isNeonGlow) {
        this.ctx.shadowColor = this.color;
        this.ctx.shadowBlur = 12;
      } else {
        this.ctx.shadowBlur = 0;
      }
    }

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
    this.ctx.lineTo(currentPos.x, currentPos.y);
    this.ctx.stroke();

    if (this.onStrokeCallback) {
      this.onStrokeCallback({
        x0: this.lastPos.x / this.canvas.width,
        y0: this.lastPos.y / this.canvas.height,
        x1: currentPos.x / this.canvas.width,
        y1: currentPos.y / this.canvas.height,
        color: this.isEraser ? '#ffffff' : this.color,
        size: this.size,
        isNeonGlow: this.isNeonGlow
      });
    }

    this.lastPos = currentPos;
  }

  drawRemoteStroke(stroke) {
    const x0 = stroke.x0 * this.canvas.width;
    const y0 = stroke.y0 * this.canvas.height;
    const x1 = stroke.x1 * this.canvas.width;
    const y1 = stroke.y1 * this.canvas.height;

    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = stroke.color;

    if (stroke.isNeonGlow) {
      this.ctx.shadowColor = stroke.color;
      this.ctx.shadowBlur = 12;
    } else {
      this.ctx.shadowBlur = 0;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  saveState() {
    if (this.undoStack.length >= 20) this.undoStack.shift();
    this.undoStack.push(this.canvas.toDataURL());
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop());
      const previousState = this.undoStack[this.undoStack.length - 1];
      this.loadImage(previousState);
    }
  }

  clear() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  loadImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }

  getDataUrl() {
    return this.canvas.toDataURL('image/png');
  }
}

window.ScribbleCanvas = ScribbleCanvas;
