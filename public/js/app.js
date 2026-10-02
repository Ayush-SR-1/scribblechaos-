// Main Application Orchestrator for ScribbleChaos (Skribbl Engine)
class ScribbleApp {
  constructor() {
    this.currentView = 'profile';
    this.isDrawer = false;
    this.init();
  }

  init() {
    console.log('🎨 ScribbleChaos Skribbl App Initialized');
    this.bindDOMEvents();
    this.checkUrlRoomCode();
    if (window.socketClient) window.socketClient.init();
  }

  checkUrlRoomCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      const joinInput = document.getElementById('joinRoomCodeInput');
      if (joinInput) joinInput.value = roomParam.toUpperCase().trim();
    }
  }

  bindDOMEvents() {
    // 1. Play Public Button
    const btnPlayPublic = document.getElementById('btnPlayPublic');
    if (btnPlayPublic) {
      btnPlayPublic.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.handlePlayPublic();
      });
    }

    // 2. Open Private Room Settings Modal
    const btnOpenCreateModal = document.getElementById('btnOpenCreateRoomModal');
    const modalCreateRoom = document.getElementById('createRoomModal');
    const btnCloseCreateModal = document.getElementById('btnCloseCreateRoomModal');
    const btnConfirmCreateRoom = document.getElementById('btnConfirmCreateRoom');

    if (btnOpenCreateModal && modalCreateRoom) {
      btnOpenCreateModal.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        modalCreateRoom.classList.add('active');
      });
    }
    if (btnCloseCreateModal && modalCreateRoom) {
      btnCloseCreateModal.addEventListener('click', () => {
        modalCreateRoom.classList.remove('active');
      });
    }
    if (btnConfirmCreateRoom && modalCreateRoom) {
      btnConfirmCreateRoom.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        modalCreateRoom.classList.remove('active');
        this.handleCreatePrivateRoom();
      });
    }

    // 3. How to Play Modal
    const btnOpenHowTo = document.getElementById('btnOpenHowToPlay');
    const modalHowTo = document.getElementById('howToPlayModal');
    const btnCloseHowTo = document.getElementById('btnCloseHowToPlay');
    const btnGotItHowTo = document.getElementById('btnGotItHowToPlay');

    if (btnOpenHowTo && modalHowTo) {
      btnOpenHowTo.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        modalHowTo.classList.add('active');
      });
    }
    if (btnCloseHowTo && modalHowTo) {
      btnCloseHowTo.addEventListener('click', () => modalHowTo.classList.remove('active'));
    }
    if (btnGotItHowTo && modalHowTo) {
      btnGotItHowTo.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        modalHowTo.classList.remove('active');
      });
    }

    // 4. Join Room Submit
    const btnJoinRoom = document.getElementById('btnJoinRoomSubmit');
    const joinCodeInput = document.getElementById('joinRoomCodeInput');
    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        const code = joinCodeInput ? joinCodeInput.value.trim().toUpperCase() : '';
        if (code) this.handleJoinRoom(code);
      });
    }

    // 5. Settings Modal (Audio)
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const modalSettings = document.getElementById('settingsModal');

    if (btnOpenSettings && modalSettings) {
      btnOpenSettings.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        modalSettings.classList.add('active');
      });
    }
    if (btnCloseSettings && modalSettings) {
      btnCloseSettings.addEventListener('click', () => modalSettings.classList.remove('active'));
    }
    if (btnSaveSettings && modalSettings) {
      btnSaveSettings.addEventListener('click', () => {
        const sfxToggle = document.getElementById('toggleSFX');
        const musicToggle = document.getElementById('toggleMusic');
        if (window.soundEngine) {
          window.soundEngine.sfxEnabled = sfxToggle ? sfxToggle.checked : true;
          window.soundEngine.toggleMusic(musicToggle ? musicToggle.checked : false);
        }
        modalSettings.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // 6. Leaderboard Close & Play Again
    const btnCloseLeaderboard = document.getElementById('btnCloseLeaderboard');
    const btnPlayAgain = document.getElementById('btnPlayAgain');
    const modalLeaderboard = document.getElementById('leaderboardModal');

    if (btnCloseLeaderboard && modalLeaderboard) {
      btnCloseLeaderboard.addEventListener('click', () => modalLeaderboard.classList.remove('active'));
    }
    if (btnPlayAgain && modalLeaderboard) {
      btnPlayAgain.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        modalLeaderboard.classList.remove('active');
        if (window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.playAgain(window.socketClient.currentRoom.code);
        }
      });
    }

    // 7. Exit Buttons
    const btnExitLobby = document.getElementById('btnExitLobby');
    const btnExitGame = document.getElementById('btnExitGame');
    if (btnExitLobby) btnExitLobby.addEventListener('click', () => this.leaveCurrentRoom());
    if (btnExitGame) btnExitGame.addEventListener('click', () => this.leaveCurrentRoom());

    // 8. Start Game from Lobby
    const btnLobbyStart = document.getElementById('btnLobbyStart');
    if (btnLobbyStart) {
      btnLobbyStart.addEventListener('click', () => {
        if (window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.startGame(window.socketClient.currentRoom.code);
          if (window.soundEngine) window.soundEngine.playClick();
        }
      });
    }

    // 9. Canvas Tools & Colors Binding
    this.bindCanvasToolbar();

    // 10. Guess & Chat Input
    const guessInput = document.getElementById('guessInput');
    const btnSendGuess = document.getElementById('btnSendGuess');
    if (btnSendGuess && guessInput) {
      const sendAction = () => {
        const text = guessInput.value.trim();
        if (text && window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.sendChat(window.socketClient.currentRoom.code, text);
          guessInput.value = '';
        }
      };
      btnSendGuess.addEventListener('click', sendAction);
      guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAction();
      });
    }
  }

  bindCanvasToolbar() {
    const brushTools = [
      { id: 'btnBrush', type: 'pencil' },
      { id: 'btnMarker', type: 'marker' },
      { id: 'btnSpray', type: 'spray' },
      { id: 'btnNeon', type: 'neon' },
      { id: 'btnFill', type: 'fill' }
    ];

    brushTools.forEach(tool => {
      const el = document.getElementById(tool.id);
      if (el) {
        el.addEventListener('click', () => {
          if (!this.isDrawer) return;
          if (window.scribbleCanvas) window.scribbleCanvas.setBrushType(tool.type);
          brushTools.forEach(t => {
            const b = document.getElementById(t.id);
            if (b) b.classList.remove('active');
          });
          const btnEraser = document.getElementById('btnEraser');
          if (btnEraser) btnEraser.classList.remove('active');
          el.classList.add('active');
          if (window.soundEngine) window.soundEngine.playClick();
        });
      }
    });

    const btnEraser = document.getElementById('btnEraser');
    if (btnEraser) {
      btnEraser.addEventListener('click', () => {
        if (!this.isDrawer) return;
        if (window.scribbleCanvas) window.scribbleCanvas.setEraser();
        brushTools.forEach(t => {
          const b = document.getElementById(t.id);
          if (b) b.classList.remove('active');
        });
        btnEraser.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    const btnClear = document.getElementById('btnClear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (!this.isDrawer) return;
        if (window.scribbleCanvas) window.scribbleCanvas.clear();
      });
    }

    const btnUndo = document.getElementById('btnUndo');
    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        if (!this.isDrawer) return;
        if (window.scribbleCanvas) window.scribbleCanvas.undo();
      });
    }

    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.isDrawer) return;
        const sz = parseInt(btn.getAttribute('data-size')) || 8;
        if (window.scribbleCanvas) window.scribbleCanvas.setSize(sz);
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        if (!this.isDrawer) return;
        const col = swatch.getAttribute('data-color');
        if (window.scribbleCanvas) window.scribbleCanvas.setColor(col);
        colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const btnBrush = document.getElementById('btnBrush');
        if (btnBrush) btnBrush.classList.add('active');
        if (btnEraser) btnEraser.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  getPlayerName() {
    const input = document.getElementById('playerNameInput');
    const val = input ? input.value.trim() : '';
    return val || `Artist_${Math.floor(Math.random() * 899 + 100)}`;
  }

  getAvatarData() {
    return window.avatarEngine ? window.avatarEngine.state : {};
  }

  showProfileView() {
    this.currentView = 'profile';
    document.getElementById('profileView').style.display = 'flex';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('gameArenaView').classList.remove('active');
  }

  goBackToHome() {
    this.showProfileView();
  }

  handlePlayPublic() {
    const playerName = this.getPlayerName();
    const avatar = this.getAvatarData();
    if (window.socketClient) {
      window.socketClient.playerName = playerName;
      window.socketClient.quickMatch(avatar, (res) => {
        if (res && res.success) this.showLobbyView(res.room);
      });
    }
  }

  handleCreatePrivateRoom() {
    const playerName = this.getPlayerName();
    const avatar = this.getAvatarData();

    const settings = {
      maxPlayers: document.getElementById('settingMaxPlayers').value,
      drawTime: document.getElementById('settingDrawTime').value,
      totalRounds: document.getElementById('settingTotalRounds').value,
      wordChoicesCount: document.getElementById('settingWordChoicesCount').value,
      hintsCount: document.getElementById('settingHintsCount').value,
      customWords: document.getElementById('settingCustomWords').value,
      customWordsOnly: document.getElementById('settingCustomWordsOnly').checked,
      language: document.getElementById('languageSelect').value
    };

    if (window.socketClient) {
      window.socketClient.playerName = playerName;
      window.socketClient.createRoom(settings, avatar, (res) => {
        if (res && res.success) {
          const shareUrl = `${window.location.origin}${window.location.pathname}?room=${res.roomCode}`;
          navigator.clipboard.writeText(shareUrl).catch(() => {});
          alert(`Private Room Created! Shareable Link Copied:\n${shareUrl}`);
          this.showLobbyView(res.room);
        }
      });
    }
  }

  handleJoinRoom(code) {
    const playerName = this.getPlayerName();
    const avatar = this.getAvatarData();
    if (window.socketClient) {
      window.socketClient.playerName = playerName;
      window.socketClient.joinRoom(code, avatar, (res) => {
        if (res && res.success) {
          this.showLobbyView(res.room);
        } else {
          alert((res && res.error) || 'Could not join room!');
        }
      });
    }
  }

  leaveCurrentRoom() {
    if (window.socketClient && window.socketClient.socket) {
      window.socketClient.socket.disconnect();
      window.socketClient.socket.connect();
    }
    this.showProfileView();
  }

  showLobbyView(room) {
    this.currentView = 'lobby';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'block';
    document.getElementById('gameArenaView').classList.remove('active');

    document.getElementById('lobbyCodeDisplay').innerText = room.code;
    document.getElementById('lobbySettingsBadge').innerText = `${room.totalRounds} Rounds | ${room.drawTime}s Draw | ${room.maxPlayers} Players Max`;
    document.getElementById('playerCount').innerText = room.players.length;
    document.getElementById('maxPlayerCount').innerText = room.maxPlayers;

    this.renderLobbyPlayers(room);
  }

  renderLobbyPlayers(room) {
    const listEl = document.getElementById('lobbyPlayersList');
    if (!listEl) return;

    const currentAvatarSvg = window.avatarEngine ? window.avatarEngine.getSvgString() : '';

    listEl.innerHTML = room.players.map(p => `
      <div class="lobby-player-card">
        <div style="display:flex; align-items:center; gap:0.85rem;">
          <div class="player-avatar-badge">${currentAvatarSvg}</div>
          <span style="font-weight:800; font-size:1.05rem;">${p.name} ${p.isHost ? '👑 (Host)' : ''}</span>
        </div>
        <span style="color:var(--color-navy); font-size:0.85rem; font-weight:900; background:var(--color-yellow); padding:0.25rem 0.75rem; border-radius:8px; border:2px solid #000;">READY</span>
      </div>
    `).join('');

    const startBtn = document.getElementById('btnLobbyStart');
    if (startBtn) {
      const isHost = socketClient.socket && socketClient.socket.id === room.hostId;
      startBtn.style.display = isHost ? 'inline-block' : 'none';
    }
  }

  onRoomUpdated(room) {
    if (this.currentView === 'lobby') {
      this.renderLobbyPlayers(room);
    } else if (this.currentView === 'game') {
      this.renderPlayerLeaderboard(room);
    }
  }

  onWordSelectionPhase(data) {
    this.currentView = 'game';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('gameArenaView').classList.add('active');

    document.getElementById('roundDisplay').innerText = `Round ${data.round} of ${data.totalRounds}`;
    document.getElementById('timerDisplay').innerText = `${data.timeLimit}s`;
    document.getElementById('wordHintDisplay').innerText = `Selecting Word...`;

    // Hide turn end overlay
    document.getElementById('turnEndOverlay').style.display = 'none';

    // Check if I am active drawer
    const myId = window.socketClient.socket ? window.socketClient.socket.id : null;
    this.isDrawer = (myId === data.activeDrawerId);

    // Initialize or clear canvas
    const canvasEl = document.getElementById('mainCanvas');
    if (canvasEl && !window.scribbleCanvas) {
      window.scribbleCanvas = new ScribbleCanvas(canvasEl);
      window.scribbleCanvas.onStrokeCallback = (stroke) => {
        if (this.isDrawer && window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.sendStroke(window.socketClient.currentRoom.code, stroke);
        }
      };
    } else if (window.scribbleCanvas) {
      window.scribbleCanvas.clear();
    }

    this.toggleDrawingToolbar(this.isDrawer);

    if (window.soundEngine) window.soundEngine.playClick();
  }

  onChooseWordPrompt(data) {
    const overlay = document.getElementById('wordSelectionOverlay');
    const container = document.getElementById('wordChoicesContainer');
    const timerEl = document.getElementById('selectWordTimer');

    if (!overlay || !container) return;
    overlay.style.display = 'flex';
    if (timerEl) timerEl.innerText = '15';

    container.innerHTML = (data.choices || []).map(word => `
      <div class="word-choice-card" onclick="app.selectWordChoice('${word}')">${word}</div>
    `).join('');
  }

  selectWordChoice(word) {
    const overlay = document.getElementById('wordSelectionOverlay');
    if (overlay) overlay.style.display = 'none';

    if (window.socketClient && window.socketClient.currentRoom) {
      window.socketClient.selectWord(window.socketClient.currentRoom.code, word);
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  onDrawingPhaseStarted(data) {
    const overlay = document.getElementById('wordSelectionOverlay');
    if (overlay) overlay.style.display = 'none';

    document.getElementById('wordHintDisplay').innerText = data.wordHint;
    document.getElementById('timerDisplay').innerText = `${data.timeLimit}s`;

    if (data.room) this.renderPlayerLeaderboard(data.room);
  }

  onHintUpdated(data) {
    const hintEl = document.getElementById('wordHintDisplay');
    if (hintEl && data.wordHint) hintEl.innerText = data.wordHint;
  }

  onTimerTick(data) {
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.innerText = `${data.timeRemaining}s`;

    if (data.phase === 'selecting_word') {
      const choiceTimer = document.getElementById('selectWordTimer');
      if (choiceTimer) choiceTimer.innerText = `${data.timeRemaining}`;
    }

    if (data.timeRemaining <= 10 && window.soundEngine) {
      window.soundEngine.playTick();
    }
  }

  onTurnEnded(data) {
    const overlay = document.getElementById('turnEndOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      document.getElementById('revealedWordText').innerText = data.revealedWord || '';
      document.getElementById('turnEndReasonTitle').innerText = data.reason === 'all_guessed' ? 'Everyone Guessed Correctly!' : 'Time\'s Up!';
    }
    if (data.room) this.renderPlayerLeaderboard(data.room);
  }

  onCorrectGuess(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = 'guess-msg correct';
      msg.innerHTML = `🎉 <strong>${data.guesserName}</strong> guessed the word! (+${data.points} pts)`;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }
    if (window.soundEngine) window.soundEngine.playSuccessFanfare();
    if (data.room) this.renderPlayerLeaderboard(data.room);
  }

  onCloseGuess(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = 'guess-msg ai';
      msg.innerHTML = `⚠️ <em>${data.message}</em>`;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }
    if (window.soundEngine) window.soundEngine.playClick();
  }

  onChatBlocked(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = 'guess-msg sys';
      msg.innerHTML = `🚫 <strong>${data.message}</strong>`;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }
  }

  onChatMessage(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = data.isGuessed ? 'guess-msg correct' : 'guess-msg';
      msg.innerHTML = `<strong>${data.senderName}:</strong> ${data.message}`;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }
  }

  onVoteKickUpdated(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = 'guess-msg sys';
      msg.innerHTML = `👢 <strong>Vote Kick:</strong> ${data.currentVotes}/${data.neededVotes} votes to kick ${data.targetName}`;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }
  }

  onPlayerRemoved(data) {
    alert(`You were ${data.reason} from the room.`);
    this.showProfileView();
  }

  renderPlayerLeaderboard(room) {
    const panel = document.getElementById('playerLeaderboardList');
    if (!panel) return;

    const myId = window.socketClient.socket ? window.socketClient.socket.id : null;
    const sorted = [...room.players].sort((a, b) => b.score - a.score);

    panel.innerHTML = sorted.map((p, idx) => {
      const isDrawer = p.id === room.activeDrawerId;
      const cardClass = isDrawer ? 'leaderboard-player-card drawing' : (p.hasGuessed ? 'leaderboard-player-card guessed' : 'leaderboard-player-card');

      return `
        <div class="${cardClass}">
          <div class="player-rank-badge">#${idx + 1}</div>
          <div class="player-card-info">
            <span class="player-card-name">${p.name} ${isDrawer ? '✏️' : ''} ${p.isHost ? '👑' : ''}</span>
            <span class="player-score-text">${p.score} pts</span>
          </div>
          ${p.scoreDelta > 0 ? `<span class="score-delta-tag">+${p.scoreDelta}</span>` : ''}
          ${!p.isHost && p.id !== myId ? `
            <button onclick="app.triggerVoteKick('${p.id}')" title="Vote to kick player" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; padding:0 0.2rem;">
              <i class="fa-solid fa-ban"></i>
            </button>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  triggerVoteKick(targetId) {
    if (window.socketClient && window.socketClient.currentRoom) {
      window.socketClient.voteKick(window.socketClient.currentRoom.code, targetId);
    }
  }

  toggleDrawingToolbar(enabled) {
    const toolbar = document.getElementById('drawingToolbar');
    if (toolbar) {
      toolbar.style.opacity = enabled ? '1' : '0.5';
      toolbar.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }

  onGameOver(data) {
    const leaderboard = data.leaderboard || [];
    const podiumEl = document.getElementById('podiumContainer');

    if (podiumEl) {
      const p1 = leaderboard[0] || { name: 'Player 1', score: 0 };
      const p2 = leaderboard[1] || { name: 'Player 2', score: 0 };
      const p3 = leaderboard[2] || { name: 'Player 3', score: 0 };

      podiumEl.innerHTML = `
        <div class="podium-step second">
          <div class="podium-medal">🥈</div>
          <div class="podium-name">${p2.name}</div>
          <div class="podium-score">${p2.score} pts</div>
        </div>
        <div class="podium-step first">
          <div class="podium-medal">👑 🥇</div>
          <div class="podium-name">${p1.name}</div>
          <div class="podium-score">${p1.score} pts</div>
        </div>
        <div class="podium-step third">
          <div class="podium-medal">🥉</div>
          <div class="podium-name">${p3.name}</div>
          <div class="podium-score">${p3.score} pts</div>
        </div>
      `;
    }

    const modal = document.getElementById('leaderboardModal');
    if (modal) modal.classList.add('active');

    if (window.soundEngine) window.soundEngine.playSuccessFanfare();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new ScribbleApp();
});
