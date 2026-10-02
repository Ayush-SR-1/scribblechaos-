// Socket.IO Client Module for ScribbleChaos (Skribbl Engine)
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
    });

    this.socket.on('disconnect', () => {
      console.warn('❌ Socket disconnected');
    });

    this.socket.on('room_updated', (room) => {
      this.currentRoom = room;
      if (window.app) window.app.onRoomUpdated(room);
    });

    this.socket.on('word_selection_phase', (data) => {
      if (window.app) window.app.onWordSelectionPhase(data);
    });

    this.socket.on('choose_word_prompt', (data) => {
      if (window.app) window.app.onChooseWordPrompt(data);
    });

    this.socket.on('drawing_phase_started', (data) => {
      if (window.app) window.app.onDrawingPhaseStarted(data);
    });

    this.socket.on('hint_updated', (data) => {
      if (window.app) window.app.onHintUpdated(data);
    });

    this.socket.on('timer_tick', (data) => {
      if (window.app) window.app.onTimerTick(data);
    });

    this.socket.on('turn_ended', (data) => {
      if (window.app) window.app.onTurnEnded(data);
    });

    this.socket.on('correct_guess', (data) => {
      if (window.app) window.app.onCorrectGuess(data);
    });

    this.socket.on('close_guess', (data) => {
      if (window.app) window.app.onCloseGuess(data);
    });

    this.socket.on('chat_blocked', (data) => {
      if (window.app) window.app.onChatBlocked(data);
    });

    this.socket.on('chat_message', (data) => {
      if (window.app) window.app.onChatMessage(data);
    });

    this.socket.on('vote_kick_updated', (data) => {
      if (window.app) window.app.onVoteKickUpdated(data);
    });

    this.socket.on('player_removed', (data) => {
      if (window.app) window.app.onPlayerRemoved(data);
    });

    this.socket.on('receive_stroke', (stroke) => {
      if (window.scribbleCanvas) window.scribbleCanvas.drawRemoteStroke(stroke);
    });

    this.socket.on('canvas_cleared', () => {
      if (window.scribbleCanvas) window.scribbleCanvas.clear();
    });

    this.socket.on('load_canvas_state', (data) => {
      if (window.scribbleCanvas && data.dataUrl) window.scribbleCanvas.loadDataUrl(data.dataUrl);
    });

    this.socket.on('game_over', (data) => {
      if (window.app) window.app.onGameOver(data);
    });
  }

  createRoom(settings, avatar, callback) {
    if (!this.socket) return;
    this.socket.emit('create_room', {
      playerName: this.playerName,
      settings,
      avatar
    }, callback);
  }

  joinRoom(roomCode, avatar, callback) {
    if (!this.socket) return;
    this.socket.emit('join_room', {
      roomCode,
      playerName: this.playerName,
      avatar
    }, callback);
  }

  quickMatch(avatar, callback) {
    if (!this.socket) return;
    this.socket.emit('quick_match', {
      playerName: this.playerName,
      avatar
    }, callback);
  }

  startGame(roomCode) {
    if (this.socket) this.socket.emit('start_game', { roomCode });
  }

  selectWord(roomCode, word) {
    if (this.socket) this.socket.emit('select_word', { roomCode, word });
  }

  sendStroke(roomCode, strokeData) {
    if (this.socket) this.socket.emit('draw_stroke', { roomCode, strokeData });
  }

  sendClear(roomCode) {
    if (this.socket) this.socket.emit('clear_canvas', { roomCode });
  }

  sendChat(roomCode, messageText) {
    if (this.socket) this.socket.emit('send_chat', { roomCode, messageText });
  }

  kickPlayer(roomCode, playerId) {
    if (this.socket) this.socket.emit('kick_player', { roomCode, playerId });
  }

  voteKick(roomCode, targetPlayerId) {
    if (this.socket) this.socket.emit('vote_kick', { roomCode, targetPlayerId });
  }

  playAgain(roomCode) {
    if (this.socket) this.socket.emit('play_again', { roomCode });
  }
}

window.socketClient = new SocketClient();
