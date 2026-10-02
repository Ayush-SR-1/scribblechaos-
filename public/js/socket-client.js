// Socket.IO Client Module for ScribbleChaos
class SocketClient {
  constructor() {
    this.socket = null;
    this.currentRoom = null;
    this.playerName = localStorage.getItem('scribble_player_name') || `Artist_${Math.floor(Math.random() * 899 + 100)}`;
  }

  init() {
    if (typeof io === 'undefined') {
      console.warn('Socket.IO library not loaded yet');
      return;
    }

    this.socket = io();

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.updateStatusBadge(true);
    });

    this.socket.on('disconnect', () => {
      console.warn('❌ Socket disconnected');
      this.updateStatusBadge(false);
    });

    this.socket.on('room_updated', (room) => {
      this.currentRoom = room;
      if (window.app) window.app.onRoomUpdated(room);
    });

    this.socket.on('round_started', (data) => {
      if (window.app) window.app.onRoundStarted(data);
    });

    this.socket.on('timer_tick', (data) => {
      if (window.app) window.app.onTimerTick(data);
    });

    this.socket.on('ai_commentary', (data) => {
      if (window.app) window.app.onAICommentary(data);
    });

    this.socket.on('guess_result', (data) => {
      if (window.app) window.app.onGuessResult(data);
    });

    this.socket.on('receive_stroke', (stroke) => {
      if (window.scribbleCanvas) window.scribbleCanvas.drawRemoteStroke(stroke);
    });

    this.socket.on('canvas_cleared', () => {
      if (window.scribbleCanvas) window.scribbleCanvas.clear();
    });

    this.socket.on('blind_description_set', (data) => {
      if (window.app) window.app.onBlindDescriptionSet(data);
    });

    this.socket.on('blind_evaluation_result', (data) => {
      if (window.app) window.app.onBlindEvaluationResult(data);
    });

    this.socket.on('telephone_next_turn', (data) => {
      if (window.app) window.app.onTelephoneNextTurn(data);
    });

    this.socket.on('telephone_reveal', (data) => {
      if (window.app) window.app.onTelephoneReveal(data);
    });

    this.socket.on('game_over', (data) => {
      if (window.app) window.app.onGameOver(data);
    });
  }

  updateStatusBadge(online) {
    const badge = document.getElementById('onlineBadge');
    if (badge) {
      badge.innerHTML = online 
        ? `<span class="online-dot"></span> 24/7 Server Live` 
        : `<span class="online-dot" style="background:#ff0055"></span> Offline`;
    }
  }

  createRoom(mode, maxPlayers, roundTime, callback) {
    if (!this.socket) return;
    this.socket.emit('create_room', {
      playerName: this.playerName,
      mode,
      maxPlayers,
      roundTime
    }, callback);
  }

  joinRoom(roomCode, callback) {
    if (!this.socket) return;
    this.socket.emit('join_room', {
      roomCode,
      playerName: this.playerName
    }, callback);
  }

  quickMatch(callback) {
    if (!this.socket) return;
    this.socket.emit('quick_match', {
      playerName: this.playerName
    }, callback);
  }

  toggleReady(roomCode) {
    if (this.socket) this.socket.emit('toggle_ready', { roomCode });
  }

  startGame(roomCode) {
    if (this.socket) this.socket.emit('start_game', { roomCode });
  }

  sendStroke(roomCode, strokeData) {
    if (this.socket) this.socket.emit('draw_stroke', { roomCode, strokeData });
  }

  sendClear(roomCode) {
    if (this.socket) this.socket.emit('clear_canvas', { roomCode });
  }

  submitGuess(roomCode, guessText) {
    if (this.socket) this.socket.emit('submit_guess', { roomCode, guessText });
  }

  submitBlindDescription(roomCode, description) {
    if (this.socket) this.socket.emit('submit_blind_description', { roomCode, description });
  }

  submitDrawing(roomCode, drawingDataUrl) {
    if (this.socket) this.socket.emit('submit_drawing', { roomCode, drawingDataUrl });
  }

  submitTelephoneDescription(roomCode, description) {
    if (this.socket) this.socket.emit('submit_telephone_description', { roomCode, description });
  }
}

window.socketClient = new SocketClient();
