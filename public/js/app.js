// Main Application Orchestrator for ScribbleChaos
class ScribbleApp {
  constructor() {
    this.currentView = 'home'; // 'home', 'lobby', 'game_mode1', 'game_mode2', 'game_mode3', 'reveal'
    this.selectedMode = 'ai_judges';
    this.cockinessMeter = 15;
    this.mockShowcaseIndex = 0;

    this.mockComments = [
      "Wait, is that supposed to be a cat or a radioactive triangle?",
      "I run 100 billion parameters and still can't comprehend this shape!",
      "If art is subjective, this drawing is asking for an appeal.",
      "My confidence score just plummeted into negative infinity!"
    ];

    this.init();
  }

  init() {
    console.log('🚀 ScribbleChaos UI App Initialized');
    
    // Bind DOM events
    this.bindDOMEvents();
    
    // Start Hero Canvas looping showcase animation
    this.startHeroShowcaseAnimation();

    // Init socket client connection
    if (window.socketClient) window.socketClient.init();
  }

  bindDOMEvents() {
    // Quick Match Button
    const btnQuickMatch = document.getElementById('btnQuickMatch');
    if (btnQuickMatch) {
      btnQuickMatch.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.startQuickMatch();
      });
    }

    // Game Mode Selection Cards
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const mode = card.getAttribute('data-mode');
        if (window.soundEngine) window.soundEngine.playClick();
        this.openCreateRoomModal(mode);
      });
    });

    // Create Room / Team Button (Bottom Panel)
    const btnCreateRoom = document.getElementById('btnCreateRoom');
    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.openCreateRoomModal('ai_judges');
      });
    }

    // Global Yellow Back Button
    const btnBackGlobal = document.getElementById('btnBackGlobal');
    if (btnBackGlobal) {
      btnBackGlobal.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.goBackToHome();
      });
    }

    // Modal Close Button & Form Submit
    const btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => this.closeModal());
    }

    const modalForm = document.getElementById('createRoomForm');
    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateRoomSubmit();
      });
    }

    // Sound Toggle
    const btnSound = document.getElementById('btnSoundToggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        if (window.soundEngine) {
          window.soundEngine.enabled = !window.soundEngine.enabled;
          btnSound.innerText = window.soundEngine.enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        }
      });
    }

    // Guess submission input
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

    // Mode 2 & 3 Submit Drawing
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

    // Mode 3 Submit Description
    const btnSubmitTelephoneDesc = document.getElementById('btnSubmitTelephoneDesc');
    if (btnSubmitTelephoneDesc) {
      btnSubmitTelephoneDesc.addEventListener('click', () => {
        const input = document.getElementById('telephoneDescInput');
        if (input && input.value.trim() && window.socketClient && window.socketClient.currentRoom) {
          window.socketClient.submitTelephoneDescription(window.socketClient.currentRoom.code, input.value.trim());
          if (window.soundEngine) window.soundEngine.playClick();
          input.value = '';
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

  // Hero Canvas Looping Visual Sketch Showcase Animation
  startHeroShowcaseAnimation() {
    const speechEl = document.getElementById('heroSpeechBubble');
    const demoCanvas = document.getElementById('demoCanvasSvg');

    setInterval(() => {
      this.mockShowcaseIndex = (this.mockShowcaseIndex + 1) % this.mockComments.length;
      if (speechEl) {
        speechEl.style.transform = 'scale(0.9)';
        speechEl.style.opacity = '0.5';
        setTimeout(() => {
          speechEl.innerText = this.mockComments[this.mockShowcaseIndex];
          speechEl.style.transform = 'scale(1)';
          speechEl.style.opacity = '1';
        }, 200);
      }
    }, 4500);
  }

  openCreateRoomModal(mode) {
    this.selectedMode = mode;
    const modal = document.getElementById('createRoomModal');
    const modeSelect = document.getElementById('roomModeSelect');
    if (modeSelect) modeSelect.value = mode;
    if (modal) modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('createRoomModal');
    if (modal) modal.classList.remove('active');
  }

  handleCreateRoomSubmit() {
    const nameInput = document.getElementById('playerNameInput');
    const modeSelect = document.getElementById('roomModeSelect');
    const playersSelect = document.getElementById('maxPlayersSelect');

    const playerName = nameInput ? nameInput.value.trim() : 'Player';
    const mode = modeSelect ? modeSelect.value : 'ai_judges';
    const maxPlayers = playersSelect ? playersSelect.value : 8;

    if (window.socketClient) {
      window.socketClient.playerName = playerName;
      localStorage.setItem('scribble_player_name', playerName);

      window.socketClient.createRoom(mode, maxPlayers, 60, (res) => {
        if (res && res.success) {
          this.closeModal();
          this.showLobbyView(res.room);
        }
      });
    }
  }

  startQuickMatch() {
    const nameInput = document.getElementById('playerNameInput');
    const playerName = (nameInput && nameInput.value.trim()) || `Scrubber_${Math.floor(Math.random()*899+100)}`;
    
    if (window.socketClient) {
      window.socketClient.playerName = playerName;
      window.socketClient.quickMatch((res) => {
        if (res && res.success) {
          this.showLobbyView(res.room);
        }
      });
    }
  }

  // Navigation Logic
  goBackToHome() {
    this.currentView = 'home';
    document.getElementById('portalView').style.display = 'block';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('gameArenaView').classList.remove('active');
    document.getElementById('revealGalleryView').style.display = 'none';
  }

  showLobbyView(room) {
    this.currentView = 'lobby';
    document.getElementById('portalView').style.display = 'none';
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

    listEl.innerHTML = room.players.map(p => `
      <div style="background:rgba(255,255,255,0.05); padding:0.8rem 1.2rem; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(0,240,255,0.2);">
        <span style="font-weight:700; color:#fff;">${p.name} ${p.isHost ? '👑 (Host)' : ''}</span>
        <span style="color:var(--neon-green); font-weight:800;">READY</span>
      </div>
    `).join('');

    const startBtn = document.getElementById('btnLobbyStart');
    if (startBtn) {
      const isHost = socketClient.socket && socketClient.socket.id === room.hostId;
      startBtn.style.display = isHost ? 'block' : 'none';
    }
  }

  // Socket event callbacks
  onRoomUpdated(room) {
    if (this.currentView === 'lobby') {
      this.renderLobbyPlayers(room);
    }
  }

  onRoundStarted(data) {
    this.currentView = 'game';
    document.getElementById('portalView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('revealGalleryView').style.display = 'none';
    document.getElementById('gameArenaView').classList.add('active');

    // Setup Canvas
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

    // Set Header info
    document.getElementById('promptText').innerText = `Prompt: ${data.prompt}`;
    document.getElementById('timerDisplay').innerText = `${data.timeLimit}s`;
    document.getElementById('guessesFeed').innerHTML = `
      <div class="guess-msg ai">🤖 AI Judge joined the room! Sarcasm meter initialised at 15%.</div>
    `;

    // Configure mode specific UI controls
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
    const cockinessFill = document.getElementById('cockinessFill');
    const cockinessLabel = document.getElementById('cockinessLabel');

    if (cockinessFill) cockinessFill.style.width = `${data.cockinessPercent}%`;
    if (cockinessLabel) cockinessLabel.innerText = `AI Cockiness: ${data.cockinessPercent}%`;

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
        <div style="background:rgba(255,0,127,0.15); border:1px solid var(--neon-pink); padding:1rem; border-radius:10px; color:#fff;">
          <strong>👁️ Secret Description Received:</strong>
          <p style="margin-top:0.4rem; font-size:1.1rem; color:var(--neon-yellow);">"${data.description}"</p>
          <small style="color:var(--text-muted)">Draw what you hear! AI will judge the match score.</small>
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
        <div style="background:rgba(57,255,20,0.15); border:1px solid var(--neon-green); padding:1rem; border-radius:10px;">
          <h4 style="color:var(--neon-green);">IT'S YOUR TURN!</h4>
          <p style="margin-top:0.4rem;">Previous input: <em>"${data.previousContent}"</em></p>
          ${data.turnType === 'describe' ? `
            <input type="text" id="telephoneDescInput" class="form-input" placeholder="Describe the drawing above..." style="width:100%; margin-top:0.8rem;">
            <button id="btnSubmitTelephoneDesc" class="btn-play-mode" style="margin-top:0.5rem;">Submit Description</button>
          ` : `
            <p>Draw based on the description above!</p>
          `}
        </div>
      ` : `
        <p style="color:var(--text-muted)">Waiting for ${data.nextPlayerName} to complete their ${data.turnType} turn...</p>
      `;
    }
  }

  onTelephoneReveal(data) {
    this.currentView = 'reveal';
    document.getElementById('portalView').style.display = 'none';
    document.getElementById('lobbyView').style.display = 'none';
    document.getElementById('gameArenaView').classList.remove('active');
    
    const revealView = document.getElementById('revealGalleryView');
    revealView.style.display = 'block';

    const galleryContainer = document.getElementById('telephoneGallery');
    if (galleryContainer) {
      galleryContainer.innerHTML = data.chain.map((step, idx) => `
        <div style="background:var(--bg-card); border:2px solid var(--neon-cyan); border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem; align-items:center;">
          <span class="mode-tag" style="background:var(--neon-cyan); color:#000;">Round Step ${idx + 1}: ${step.type.toUpperCase()}</span>
          <p style="font-weight:700;">Player: ${step.playerName}</p>
          ${step.type === 'draw' 
            ? `<img src="${step.content}" style="width:100%; max-width:280px; border-radius:8px; border:1px solid #fff;" />` 
            : `<div style="background:#000; padding:1rem; border-radius:8px; width:100%; text-align:center; font-size:1.1rem; color:var(--neon-yellow);">"${step.content}"</div>`}
        </div>
      `).join('');
    }

    document.getElementById('telephoneSummary').innerText = `${data.summary} (Chaos Distortion Rating: ${data.distortionScore}%)`;
  }

  onGameOver(data) {
    alert('🏆 Game Over! Final Winner: ' + (data.leaderboard[0] ? data.leaderboard[0].name : 'Nobody'));
    this.goBackToHome();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new ScribbleApp();
});
