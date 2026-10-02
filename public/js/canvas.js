// Advanced HTML5 Multi-Brush Canvas Engine for ScribbleChaos
class ScribbleCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.isDrawing = false;
    this.brushType = 'pencil'; // 'pencil', 'marker', 'spray', 'neon', 'fill'
    this.color = '#000000';
    this.size = 8;
    this.isEraser = false;

    this.undoStack = [];
    this.redoStack = [];
    this.onStrokeCallback = null;

    this.resizeCanvas();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.saveState();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width || 600;
    tempCanvas.height = this.canvas.height || 450;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCanvas.width > 0) tempCtx.drawImage(this.canvas, 0, 0);

    this.canvas.width = rect.width || 600;
    this.canvas.height = rect.height || 450;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (tempCanvas.width > 0) {
      this.ctx.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resizeCanvas(), 100);
    });

    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Touch Events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrawing(e.touches[0]);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger when typing in inputs/chat
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      const key = e.key.toLowerCase();
      
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        this.undo();
        return;
      }

      switch (key) {
        case 'b': // Pencil Brush
          this.setBrushType('pencil');
          this.highlightToolButton('btnBrush');
          break;
        case 'm': // Marker Brush
          this.setBrushType('marker');
          this.highlightToolButton('btnMarker');
          break;
        case 's': // Spray Paint
          this.setBrushType('spray');
          this.highlightToolButton('btnSpray');
          break;
        case 'g': // Neon Glow
          this.setBrushType('neon');
          this.highlightToolButton('btnNeon');
          break;
        case 'f': // Bucket Fill
        case 'k':
          this.setBrushType('fill');
          this.highlightToolButton('btnFill');
          break;
        case 'e': // Eraser
          this.setEraser();
          this.highlightToolButton('btnEraser');
          break;
        case 'c': // Clear
          this.clear();
          break;
        case 'z': // Undo
          this.undo();
          break;
        case '1':
          this.setSize(4);
          this.highlightSizeButton(4);
          break;
        case '2':
          this.setSize(8);
          this.highlightSizeButton(8);
          break;
        case '3':
          this.setSize(16);
          this.highlightSizeButton(16);
          break;
        case '4':
          this.setSize(26);
          this.highlightSizeButton(26);
          break;
      }
    });
  }

  highlightToolButton(btnId) {
    const tools = ['btnBrush', 'btnMarker', 'btnSpray', 'btnNeon', 'btnFill', 'btnEraser'];
    tools.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    const target = document.getElementById(btnId);
    if (target) target.classList.add('active');
  }

  highlightSizeButton(sz) {
    const btns = document.querySelectorAll('.size-btn');
    btns.forEach(b => {
      b.classList.remove('active');
      if (parseInt(b.getAttribute('data-size')) === sz) b.classList.add('active');
    });
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
    const pos = this.getPos(e);
    this.lastPos = pos;

    if (this.brushType === 'fill') {
      this.floodFill(Math.floor(pos.x), Math.floor(pos.y), this.color);
      this.saveState();
      this.broadcastImageDataUrl();
      return;
    }

    this.isDrawing = true;
    if (window.soundEngine) window.soundEngine.playDrawStroke();

    if (this.brushType === 'spray') {
      this.drawSpray(pos);
    }
  }

  draw(e) {
    if (!this.isDrawing) return;
    const currentPos = this.getPos(e);

    this.ctx.save();

    if (this.isEraser) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = this.size * 1.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
      this.ctx.lineTo(currentPos.x, currentPos.y);
      this.ctx.stroke();
    } else {
      switch (this.brushType) {
        case 'marker':
          this.ctx.strokeStyle = this.color;
          this.ctx.globalAlpha = 0.35;
          this.ctx.lineWidth = this.size * 1.8;
          this.ctx.lineCap = 'square';
          this.ctx.beginPath();
          this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
          this.ctx.lineTo(currentPos.x, currentPos.y);
          this.ctx.stroke();
          break;

        case 'spray':
          this.drawSpray(currentPos);
          break;

        case 'neon':
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.shadowColor = this.color;
          this.ctx.shadowBlur = 12;
          this.ctx.lineWidth = Math.max(3, this.size * 0.6);
          this.ctx.lineCap = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
          this.ctx.lineTo(currentPos.x, currentPos.y);
          this.ctx.stroke();
          break;

        default: // 'pencil'
          this.ctx.strokeStyle = this.color;
          this.ctx.lineWidth = this.size;
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
          this.ctx.lineTo(currentPos.x, currentPos.y);
          this.ctx.stroke();
      }
    }

    this.ctx.restore();

    if (this.onStrokeCallback) {
      this.onStrokeCallback({
        x0: this.lastPos.x / this.canvas.width,
        y0: this.lastPos.y / this.canvas.height,
        x1: currentPos.x / this.canvas.width,
        y1: currentPos.y / this.canvas.height,
        color: this.isEraser ? '#ffffff' : this.color,
        size: this.size,
        brushType: this.brushType
      });
    }

    this.lastPos = currentPos;
  }

  drawSpray(pos) {
    const density = Math.floor(this.size * 3);
    this.ctx.fillStyle = this.color;
    for (let i = 0; i < density; i++) {
      const offset = (Math.random() - 0.5) * this.size * 2.5;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * this.size * 1.2;
      const x = pos.x + Math.cos(angle) * r;
      const y = pos.y + Math.sin(angle) * r;
      this.ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  drawRemoteStroke(stroke) {
    const x0 = stroke.x0 * this.canvas.width;
    const y0 = stroke.y0 * this.canvas.height;
    const x1 = stroke.x1 * this.canvas.width;
    const y1 = stroke.y1 * this.canvas.height;

    this.ctx.save();
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
    this.ctx.restore();
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
      this.broadcastImageDataUrl();
    }
  }

  // Flood Fill / Bucket Tool
  floodFill(startX, startY, fillColorHex) {
    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imgData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    const rgb = this.hexToRgb(fillColorHex);
    const targetIdx = (startY * width + startX) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];
    const targetA = data[targetIdx + 3];

    if (targetR === rgb.r && targetG === rgb.g && targetB === rgb.b) return;

    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = (y * width + x) * 4;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      if (data[idx] === targetR && data[idx + 1] === targetG && data[idx + 2] === targetB && data[idx + 3] === targetA) {
        data[idx] = rgb.r;
        data[idx + 1] = rgb.g;
        data[idx + 2] = rgb.b;
        data[idx + 3] = 255;

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }

    this.ctx.putImageData(imgData, 0, 0);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  setBrushType(type) {
    this.brushType = type;
    this.isEraser = false;
  }

  setColor(col) {
    this.color = col;
    this.isEraser = false;
  }

  setEraser() {
    this.isEraser = true;
  }

  setSize(sz) {
    this.size = sz;
  }

  clear() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
    this.broadcastImageDataUrl();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  saveState() {
    if (this.undoStack.length >= 20) this.undoStack.shift();
    this.undoStack.push(this.canvas.toDataURL());
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop());
      const state = this.undoStack[this.undoStack.length - 1];
      const img = new Image();
      img.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0);
        this.broadcastImageDataUrl();
      };
      img.src = state;
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  broadcastImageDataUrl() {
    const dataUrl = this.getDataUrl();
    if (window.socketClient && window.socketClient.currentRoom) {
      window.socketClient.socket.emit('update_canvas_image', {
        roomCode: window.socketClient.currentRoom.code,
        dataUrl
      });
    }
  }

  getDataUrl() {
    return this.canvas.toDataURL('image/png');
  }
}

window.ScribbleCanvas = ScribbleCanvas;
