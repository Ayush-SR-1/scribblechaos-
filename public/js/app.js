// Main Application Orchestrator for ScribbleChaos / Pixel Telephone
class ScribbleApp {
  constructor() {
    this.currentView = 'profile';
    this.selectedMode = 'pixel_telephone';

    this.init();
  }

  init() {
    console.log('🚀 Pixel Telephone App Initialized');
    this.bindDOMEvents();
    if (window.socketClient) window.socketClient.init();
  }

  bindDOMEvents() {
    // Stage 1: Continue to Battleground Button
    const btnContinue = document.getElementById('btnContinueToBattleground');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.showGameSelectView();
      });
    }

    // Stage 2: Back Button to Profile
    const btnBackToProfile = document.getElementById('btnBackToProfile');
    if (btnBackToProfile) {
      btnBackToProfile.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.showProfileView();
      });
    }

    // Mode Radio Selection Cards (Stage 2)
    const radioCards = document.querySelectorAll('.mode-radio-card');
    radioCards.forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.getAttribute('data-mode');
        this.selectedMode = mode;

        radioCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const radioInput = card.querySelector('input[type="radio"]');
        if (radioInput) radioInput.checked = true;

        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // Create Room Button Submit
    const btnCreateRoomSubmit = document.getElementById('btnCreateRoomSubmit');
    if (btnCreateRoomSubmit) {
      btnCreateRoomSubmit.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.handleCreateRoom();
      });
    }

    // Join Room Button Submit
    const btnJoinRoomSubmit = document.getElementById('btnJoinRoomSubmit');
    const joinCodeInput = document.getElementById('joinRoomCodeInput');
    if (btnJoinRoomSubmit) {
      btnJoinRoomSubmit.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        const code = joinCodeInput ? joinCodeInput.value.trim().toUpperCase() : '';
        if (code) this.handleJoinRoom(code);
      });
    }

    // Settings Modal Open / Close
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
      btnCloseSettings.addEventListener('click', () => {
        modalSettings.classList.remove('active');
      });
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

    // Exit Room & Exit Game Buttons
    const btnExitLobby = document.getElementById('btnExitLobby');
    const btnExitGame = document.getElementById('btnExitGame');

    if (btnExitLobby) {
      btnExitLobby.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.leaveCurrentRoom();
      });
    }

    if (btnExitGame) {
      btnExitGame.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.leaveCurrentRoom();
      });
    }

    // Guess Input
    const guessInput = document.getElementById('guessInput');
    const btnSendGuess = document.getElementById('btnSendGuess');
    if (btnSendGuess && guessInput) {
      const sendAction = () => {
        const text = guessInput.value.trim();
        if (text && window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.submitGuess(window.socketClient.currentRoom.code, text);
          guessInput.value = '';
        }
      };
      btnSendGuess.addEventListener('click', sendAction);
      guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAction();
      });
    }

    // Mode 2 Blind Description Submit
    const btnSubmitBlindDesc = document.getElementById('btnSubmitBlindDesc');
    if (btnSubmitBlindDesc) {
      btnSubmitBlindDesc.addEventListener('click', () => {
        const input = document.getElementById('blindDescInput');
        if (input && input.value.trim() && window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.submitBlindDescription(window.socketClient.currentRoom.code, input.value.trim());
          if (window.soundEngine) window.soundEngine.playClick();
        }
      });
    }

    // Submit Canvas Drawing
    const btnSubmitCanvas = document.getElementById('btnSubmitCanvas');
    if (btnSubmitCanvas) {
      btnSubmitCanvas.addEventListener('click', () => {
        if (window.scribbleCanvas && window.socketClient && window.socketClient.currentRoom) {
          const dataUrl = window.scribbleCanvas.getDataUrl();
          window.socketClient.submitDrawing(window.socketClient.currentRoom.code, dataUrl);
          if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        }
      });
    }

    // Start Game from Lobby Button
    const btnLobbyStart = document.getElementById('btnLobbyStart');
    if (btnLobbyStart) {
      btnLobbyStart.addEventListener('click', () => {
        if (window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.startGame(window.socketClient.currentRoom.code);
          if (window.soundEngine) window.soundEngine.playClick();
        }
      });
    }
  }

  getPlayerName() {
    const input = document.getElementById('playerNameInput');
    const val = input ? input.value.trim() : '';
    return val || `Artist_${Math.floor(Math.random() * 899 + 100)}`;
  }

  showProfileView() {
    this.currentView = 'profile';
    document.getElementById('profileView').style.display = 'flex';
    document.getElementById('gameSelectView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('gameArenaView').classList.remove('active');
    document.getElementById('revealGalleryView').style.display = 'none';
  }

  showGameSelectView() {
    this.currentView = 'gameSelect';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('gameSelectView').style.display = 'flex';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('gameArenaView').classList.remove('active');
    document.getElementById('revealGalleryView').style.display = 'none';
  }

  goBackToHome() {
    this.showProfileView();
  }

  handleCreateRoom() {
    const playerName = this.getPlayerName();
    if (window.socketClient) {
      window.socketClient.playerName = playerName;
      window.socketClient.createRoom(this.selectedMode, 8, 60, (res) => {
        if (res && res.success) {
          this.showLobbyView(res.room);
        }
      });
    }
  }

  handleJoinRoom(code) {
    const playerName = this.getPlayerName();
    if (window.socketClient) {
      window.socketClient.playerName = playerName;
      window.socketClient.joinRoom(code, (res) => {
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
    document.getElementById('gameSelectView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'block';
    document.getElementById('gameArenaView').classList.remove('active');
    document.getElementById('revealGalleryView').style.display = 'none';

    document.getElementById('lobbyCodeDisplay').innerText = room.code;
    document.getElementById('lobbyModeBadge').innerText = `MODE: ${room.mode.toUpperCase().replace('_', ' ')}`;

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

  // Socket Event Callbacks
  onRoomUpdated(room) {
    if (this.currentView === 'lobby') {
      this.renderLobbyPlayers(room);
    }
  }

  onRoundStarted(data) {
    this.currentView = 'game';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('gameSelectView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('revealGalleryView').style.display = 'none';
    document.getElementById('gameArenaView').classList.add('active');

    const canvasEl = document.getElementById('mainCanvas');
    if (canvasEl && !window.scribbleCanvas) {
      window.scribbleCanvas = new ScribbleCanvas(canvasEl);
      window.scribbleCanvas.onStrokeCallback = (stroke) => {
        if (window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.sendStroke(window.socketClient.currentRoom.code, stroke);
        }
      };
    } else if (window.scribbleCanvas) {
      window.scribbleCanvas.clear();
    }

    document.getElementById('promptText').innerText = `Prompt: ${data.prompt}`;
    document.getElementById('timerDisplay').innerText = `${data.timeLimit}s`;
    document.getElementById('guessesFeed').innerHTML = `
      <div class="guess-msg ai">🤖 AI Judge joined the room! Sarcasm meter initialised.</div>
    `;

    const isMode1 = data.mode === 'ai_judges';
    const isMode2 = data.mode === 'blind_artist';
    const isMode3 = data.mode === 'pixel_telephone';

    document.getElementById('mode1GuessBox').style.display = isMode1 ? 'flex' : 'none';
    document.getElementById('mode2BlindBox').style.display = isMode2 ? 'block' : 'none';
    document.getElementById('mode3TelephoneBox').style.display = isMode3 ? 'block' : 'none';
  }

  onTimerTick(data) {
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.innerText = `${data.timeRemaining}s`;

    if (data.timeRemaining <= 10 && window.soundEngine) {
      window.soundEngine.playTick();
    }
  }

  onAICommentary(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = 'guess-msg ai';
      msg.innerHTML = `<strong>AI Guess:</strong> "${data.guess}" <br><small>💬 "${data.comment}"</small>`;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }
    if (window.soundEngine) window.soundEngine.playAICockyBuzz();
  }

  onGuessResult(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = data.success ? 'guess-msg correct' : 'guess-msg';
      msg.innerHTML = data.success 
        ? `🎉 <strong>${data.guesserName}</strong> guessed correctly! +${data.points} pts!` 
        : `💬 <strong>${data.guesserName}:</strong> ${data.guess}`;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }

    if (data.success && window.soundEngine) {
      window.soundEngine.playSuccessFanfare();
    }
  }

  onBlindDescriptionSet(data) {
    const blindBox = document.getElementById('mode2BlindBox');
    if (blindBox) {
      blindBox.innerHTML = `
        <div style="background:#ffffff; border:3px solid var(--color-navy); padding:1.2rem; border-radius:16px; box-shadow:var(--shadow-neo); color:var(--color-navy);">
          <strong>👁️ Secret Scene Description Received:</strong>
          <p style="margin-top:0.4rem; font-size:1.15rem; background:var(--color-yellow); padding:0.4rem 0.8rem; border-radius:8px; border:2px solid #000; font-weight:800;">"${data.description}"</p>
          <small style="color:var(--color-muted); display:block; margin-top:0.4rem;">Draw what you hear! AI will judge the match score.</small>
        </div>
      `;
    }
  }

  onBlindEvaluationResult(data) {
    const feed = document.getElementById('guessesFeed');
    if (feed) {
      const msg = document.createElement('div');
      msg.className = 'guess-msg ai';
      msg.innerHTML = `
        <strong>🏆 AI Evaluation for ${data.playerName}:</strong><br>
        Similarity Score: <strong>${data.similarityScore}%</strong> (+${data.points} pts)<br>
        <em>${data.aiCritique}</em>
      `;
      feed.appendChild(msg);
      feed.scrollTop = feed.scrollHeight;
    }
  }

  onTelephoneNextTurn(data) {
    const isMyTurn = socketClient.socket && socketClient.socket.id === data.nextPlayerId;
    const box = document.getElementById('mode3TelephoneBox');
    if (box) {
      box.innerHTML = isMyTurn ? `
        <div style="background:#ffffff; border:3px solid var(--color-navy); padding:1.2rem; border-radius:16px; box-shadow:var(--shadow-neo);">
          <h4 style="color:var(--color-navy); font-size:1.2rem;">IT'S YOUR TURN!</h4>
          <p style="margin-top:0.4rem;">Previous input: <em>"${data.previousContent}"</em></p>
          ${data.turnType === 'describe' ? `
            <input type="text" id="telephoneDescInput" class="neo-input" placeholder="Describe the drawing above..." style="width:100%; margin-top:0.8rem;">
            <button id="btnSubmitTelephoneDesc" class="btn-neo-yellow" style="margin-top:0.6rem; font-size:1rem;">Submit Description</button>
          ` : `
            <p style="margin-top:0.4rem; font-weight:700;">Draw based on the description above!</p>
          `}
        </div>
      ` : `
        <p style="color:rgba(255,255,255,0.9); font-weight:700; text-shadow:0 2px 4px #000;">Waiting for ${data.nextPlayerName} to complete their ${data.turnType} turn...</p>
      `;

      const btnSubmitTelephoneDesc = document.getElementById('btnSubmitTelephoneDesc');
      if (btnSubmitTelephoneDesc) {
        btnSubmitTelephoneDesc.addEventListener('click', () => {
          const input = document.getElementById('telephoneDescInput');
          if (input && input.value.trim() && window.socketClient && window.socketClient.currentRoom) {
            window.socketClient.submitTelephoneDescription(window.socketClient.currentRoom.code, input.value.trim());
            if (window.soundEngine) window.soundEngine.playClick();
          }
        });
      }
    }
  }

  onTelephoneReveal(data) {
    this.currentView = 'reveal';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('gameSelectView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('gameArenaView').classList.remove('active');
    
    const revealView = document.getElementById('revealGalleryView');
    revealView.style.display = 'block';

    const galleryContainer = document.getElementById('telephoneGallery');
    if (galleryContainer) {
      galleryContainer.innerHTML = data.chain.map((step, idx) => `
        <div style="background:#ffffff; border:3px solid var(--color-navy); border-radius:16px; box-shadow:var(--shadow-neo); padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem; align-items:center; color:var(--color-navy);">
          <span style="background:var(--color-yellow); color:#000; font-weight:900; padding:0.3rem 0.8rem; border-radius:8px; border:2px solid #000;">Step ${idx + 1}: ${step.type.toUpperCase()}</span>
          <p style="font-weight:700;">Player: ${step.playerName}</p>
          ${step.type === 'draw' 
            ? `<img src="${step.content}" style="width:100%; max-width:280px; border-radius:8px; border:2px solid #000;" />` 
            : `<div style="background:#0f172a; padding:1rem; border-radius:8px; width:100%; text-align:center; font-size:1.1rem; color:var(--color-yellow); font-weight:800;">"${step.content}"</div>`}
        </div>
      `).join('');
    }

    document.getElementById('telephoneSummary').innerText = `${data.summary} (Chaos Distortion Rating: ${data.distortionScore}%)`;
  }

  onGameOver(data) {
    alert('🏆 Game Over! Final Winner: ' + (data.leaderboard[0] ? data.leaderboard[0].name : 'Nobody'));
    this.showProfileView();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new ScribbleApp();
});
