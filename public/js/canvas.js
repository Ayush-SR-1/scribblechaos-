// Enhanced HTML5 Canvas Engine with Fabric.js Integration
class ScribbleCanvas {
  constructor(canvasElement) {
    this.canvasEl = canvasElement;
    this.canvas = null;
    this.color = '#000000';
    this.size = 6;
    this.isEraser = false;
    this.undoStack = [];
    this.redoStack = [];
    this.onStrokeCallback = null;

    this.initFabric();
  }

  initFabric() {
    if (typeof fabric !== 'undefined') {
      const parent = this.canvasEl.parentElement;
      const rect = parent.getBoundingClientRect();
      const w = rect.width || 600;
      const h = rect.height || 450;

      this.canvas = new fabric.Canvas(this.canvasEl.id, {
        isDrawingMode: true,
        width: w,
        height: h,
        backgroundColor: '#ffffff'
      });

      this.canvas.freeDrawingBrush.color = this.color;
      this.canvas.freeDrawingBrush.width = this.size;

      this.canvas.on('path:created', (e) => {
        this.saveState();
        if (this.onStrokeCallback && window.socketClient && window.socketClient.currentRoom) {
          const jsonState = JSON.stringify(e.path.toObject());
          window.socketClient.socket.emit('draw_stroke', {
            roomCode: window.socketClient.currentRoom.code,
            strokeData: { jsonPath: jsonState, color: this.color, size: this.size }
          });
        }
        this.broadcastImageDataUrl();
      });

      this.saveState();
    } else {
      // Native 2D Canvas Fallback
      this.ctx = this.canvasEl.getContext('2d');
      this.resizeNative();
      this.bindNativeEvents();
    }
  }

  resizeNative() {
    const parent = this.canvasEl.parentElement;
    const rect = parent.getBoundingClientRect();
    this.canvasEl.width = rect.width || 600;
    this.canvasEl.height = rect.height || 450;
    if (this.ctx) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
  }

  bindNativeEvents() {
    let drawing = false;
    let lastPos = { x: 0, y: 0 };

    const getPos = (e) => {
      const r = this.canvasEl.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (this.canvasEl.width / r.width),
        y: (e.clientY - r.top) * (this.canvasEl.height / r.height)
      };
    };

    this.canvasEl.addEventListener('mousedown', (e) => {
      drawing = true;
      lastPos = getPos(e);
      if (window.soundEngine) window.soundEngine.playDrawStroke();
    });

    this.canvasEl.addEventListener('mousemove', (e) => {
      if (!drawing || !this.ctx) return;
      const current = getPos(e);
      this.ctx.lineWidth = this.size;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.isEraser ? '#ffffff' : this.color;

      this.ctx.beginPath();
      this.ctx.moveTo(lastPos.x, lastPos.y);
      this.ctx.lineTo(current.x, current.y);
      this.ctx.stroke();

      if (this.onStrokeCallback) {
        this.onStrokeCallback({
          x0: lastPos.x / this.canvasEl.width,
          y0: lastPos.y / this.canvasEl.height,
          x1: current.x / this.canvasEl.width,
          y1: current.y / this.canvasEl.height,
          color: this.isEraser ? '#ffffff' : this.color,
          size: this.size
        });
      }

      lastPos = current;
    });

    const stop = () => {
      if (drawing) {
        drawing = false;
        this.saveState();
        this.broadcastImageDataUrl();
      }
    };

    this.canvasEl.addEventListener('mouseup', stop);
    this.canvasEl.addEventListener('mouseleave', stop);
  }

  drawRemoteStroke(stroke) {
    if (this.canvas && stroke.jsonPath) {
      fabric.util.enlivenObjects([JSON.parse(stroke.jsonPath)], (objects) => {
        objects.forEach((obj) => {
          this.canvas.add(obj);
        });
        this.canvas.renderAll();
      });
    } else if (this.ctx) {
      const x0 = stroke.x0 * this.canvasEl.width;
      const y0 = stroke.y0 * this.canvasEl.height;
      const x1 = stroke.x1 * this.canvasEl.width;
      const y1 = stroke.y1 * this.canvasEl.height;

      this.ctx.lineWidth = stroke.size;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = stroke.color;

      this.ctx.beginPath();
      this.ctx.moveTo(x0, y0);
      this.ctx.lineTo(x1, y1);
      this.ctx.stroke();
    }
  }

  setColor(col) {
    this.color = col;
    this.isEraser = false;
    if (this.canvas) {
      this.canvas.freeDrawingBrush.color = this.color;
    }
  }

  setEraser() {
    this.isEraser = true;
    if (this.canvas) {
      this.canvas.freeDrawingBrush.color = '#ffffff';
    }
  }

  setSize(sz) {
    this.size = sz;
    if (this.canvas) {
      this.canvas.freeDrawingBrush.width = this.size;
    }
  }

  clear() {
    if (this.canvas) {
      this.canvas.clear();
      this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
    } else if (this.ctx) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
    this.saveState();
    this.broadcastImageDataUrl();
  }

  saveState() {
    if (this.canvas) {
      if (this.undoStack.length >= 20) this.undoStack.shift();
      this.undoStack.push(JSON.stringify(this.canvas.toDatalessJSON()));
    } else {
      if (this.undoStack.length >= 20) this.undoStack.shift();
      this.undoStack.push(this.canvasEl.toDataURL());
    }
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop());
      const state = this.undoStack[this.undoStack.length - 1];
      if (this.canvas) {
        this.canvas.loadFromJSON(state, this.canvas.renderAll.bind(this.canvas));
      } else if (this.ctx) {
        const img = new Image();
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
          this.ctx.drawImage(img, 0, 0);
        };
        img.src = state;
      }
      this.broadcastImageDataUrl();
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
    if (this.canvas) {
      return this.canvas.toDataURL({ format: 'png' });
    }
    return this.canvasEl.toDataURL('image/png');
  }
}

window.ScribbleCanvas = ScribbleCanvas;
