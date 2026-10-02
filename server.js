const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Word prompts list grouped by category & difficulty
const PROMPTS = [
  'Cyberpunk Cat', 'Angry Potato', 'Flying Toaster', 'Ninja Turtle', 'Space Banana',
  'Sarcastic Robot', 'Dancing Taco', 'Laser Shark', 'Unicorn with Sunglasses', 'Alien DJ',
  'Haunted Pizza', 'Rocket Penguin', 'Disco Avocado', 'Wizard Frog', 'Electric Guitar',
  'Giant Octopus', 'Roller-skating Bear', 'Vampire Donut', 'Superhero Hamster', 'Zombie Cactus',
  'Time Traveling Microwave', 'Pirate Parrot', 'Neon Dragon', 'Boba Tea Monster', 'Astronaut Pug'
];

// AI Sarcastic / Cocky Commentary Templates based on elapsed time percentage (0% to 100%)
const AI_COMMENTARY_TIERS = {
  curious: [ // 0-25% time
    "Hmm... looks like early line work. Are we making a circle or a void?",
    "Okay, I see some shapes forming. Don't ruin it now!",
    "Interesting choice of colors... is this minimalist abstract art?",
    "I'm scanning... right now it looks like a confused potato.",
    "First few strokes look promising! Or at least not terrible."
  ],
  smug: [ // 26-55% time
    "Wait, is that supposed to be a leg or a stick figure mistake?",
    "My neural nets are processing... result: 40% art, 60% scribble chaos!",
    "I've seen captcha images clearer than this masterpiece.",
    "Are you drawing with your elbows? Just curious!",
    "I'm guessing, but my confidence score is dropping faster than your score!"
  ],
  cocky: [ // 56-80% time
    "Seriously? A toddler with a crayon could convey this concept better!",
    "Is that a hat or did your cursor slip into another dimension?",
    "I run on billions of parameters, yet I can't parameterize whatever THIS is!",
    "Tick tock! The clock is ticking and my patience is running out!",
    "If this wins, art school standard is officially dead."
  ],
  brutal: [ // 81-100% time
    "EMERGENCY! Neural network overheating from sheer artistic confusion!",
    "I give up! Is it a cat? A rocket? A crime against aesthetics?",
    "Time is almost UP and even quantum computers couldn't guess this!",
    "0% confidence, 100% sarcastic judgement!",
    "Final seconds! Save yourself the embarrassment and hit clear!"
  ]
};

// In-Memory Room Store
const rooms = new Map();

// Helper: Generate 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper: Pick random prompt
function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

// Helper: Get AI Cocky Comment based on time remaining ratio
function getAICockyComment(ratioRemaining) {
  const elapsedRatio = 1 - ratioRemaining;
  let pool = AI_COMMENTARY_TIERS.curious;
  if (elapsedRatio > 0.8) pool = AI_COMMENTARY_TIERS.brutal;
  else if (elapsedRatio > 0.55) pool = AI_COMMENTARY_TIERS.cocky;
  else if (elapsedRatio > 0.25) pool = AI_COMMENTARY_TIERS.smug;

  const comment = pool[Math.floor(Math.random() * pool.length)];
  const cockinessPercent = Math.min(99, Math.floor(elapsedRatio * 100 + 10));
  return { comment, cockinessPercent };
}

// Helper: Simulated Smart AI Guessing (with vision fallback / prompt detection)
function generateAIGuess(prompt, elapsedRatio, drawingData) {
  const isCorrect = Math.random() < (0.2 + (1 - elapsedRatio) * 0.7); // higher chance as art completes
  const words = prompt.split(' ');
  const wordClue = words[words.length - 1];

  let guess;
  if (isCorrect) {
    guess = prompt;
  } else {
    const wrongGuesses = [
      `A deformed ${wordClue}?`,
      `Is it a ${PROMPTS[Math.floor(Math.random() * PROMPTS.length)]}?`,
      `Looks like a broken ${words[0] || 'object'}`,
      `A modern ${wordClue} abstract sculpture`,
      `Some kind of ${PROMPTS[Math.floor(Math.random() * PROMPTS.length)]}?`
    ];
    guess = wrongGuesses[Math.floor(Math.random() * wrongGuesses.length)];
  }

  const { comment, cockinessPercent } = getAICockyComment(elapsedRatio);
  return { guess, isCorrect, comment, cockinessPercent };
}

// Room Management Helper
function createRoomObject(code, mode, maxPlayers = 8, roundTime = 60) {
  return {
    code,
    mode, // 'ai_judges', 'blind_artist', 'pixel_telephone'
    maxPlayers: parseInt(maxPlayers) || 8,
    roundTime: parseInt(roundTime) || 60,
    players: [], // { id, name, score, ready, role }
    hostId: null,
    status: 'lobby', // 'lobby', 'playing', 'reveal', 'ended'
    currentRound: 1,
    totalRounds: 3,
    currentPrompt: '',
    secretDescription: '',
    activeDrawerId: null,
    activeDescriberId: null,
    timer: null,
    timeRemaining: 60,
    drawingHistory: [],
    telephoneChain: [], // Array of steps: { type: 'draw'|'describe', playerId, playerName, content }
    telephoneStep: 0,
    scores: {}
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ScribbleChaos AI Art Battleground',
    uptime: process.uptime(),
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/prompts/random', (req, res) => {
  res.json({ prompt: getRandomPrompt() });
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Create Room
  socket.on('create_room', ({ playerName, mode, maxPlayers, roundTime }, callback) => {
    const roomCode = generateRoomCode();
    const room = createRoomObject(roomCode, mode || 'ai_judges', maxPlayers, roundTime);

    const player = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substring(0, 4)}`,
      score: 0,
      ready: true,
      isHost: true
    };

    room.hostId = socket.id;
    room.players.push(player);
    rooms.set(roomCode, room);

    socket.join(roomCode);
    console.log(`🎮 Room created: ${roomCode} by ${player.name} (Mode: ${room.mode})`);

    if (typeof callback === 'function') {
      callback({ success: true, roomCode, room });
    }

    io.to(roomCode).emit('room_updated', room);
  });

  // Join Room
  socket.on('join_room', ({ roomCode, playerName }, callback) => {
    const code = (roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      if (typeof callback === 'function') callback({ success: false, error: 'Room not found!' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      if (typeof callback === 'function') callback({ success: false, error: 'Room is full!' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substring(0, 4)}`,
      score: 0,
      ready: false,
      isHost: false
    };

    room.players.push(player);
    socket.join(code);

    console.log(`👤 ${player.name} joined room ${code}`);

    if (typeof callback === 'function') callback({ success: true, roomCode: code, room });
    io.to(code).emit('room_updated', room);
  });

  // Quick Matchmaking
  socket.on('quick_match', ({ playerName }, callback) => {
    // Find available lobby or create one
    let targetRoom = null;
    for (const [code, r] of rooms.entries()) {
      if (r.status === 'lobby' && r.players.length < r.maxPlayers) {
        targetRoom = r;
        break;
      }
    }

    if (!targetRoom) {
      const code = generateRoomCode();
      targetRoom = createRoomObject(code, 'ai_judges', 8, 60);
      rooms.set(code, targetRoom);
    }

    const player = {
      id: socket.id,
      name: playerName || `SpeedScrubber_${socket.id.substring(0, 3)}`,
      score: 0,
      ready: true,
      isHost: targetRoom.players.length === 0
    };

    if (player.isHost) targetRoom.hostId = socket.id;

    targetRoom.players.push(player);
    socket.join(targetRoom.code);

    if (typeof callback === 'function') callback({ success: true, roomCode: targetRoom.code, room: targetRoom });
    io.to(targetRoom.code).emit('room_updated', targetRoom);
  });

  // Toggle Player Ready
  socket.on('toggle_ready', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const p = room.players.find(p => p.id === socket.id);
    if (p) {
      p.ready = !p.ready;
      io.to(roomCode).emit('room_updated', room);
    }
  });

  // Start Game
  socket.on('start_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    startNextRound(room);
  });

  // Real-time Canvas Drawing Events
  socket.on('draw_stroke', ({ roomCode, strokeData }) => {
    socket.to(roomCode).emit('receive_stroke', strokeData);
  });

  socket.on('clear_canvas', ({ roomCode }) => {
    socket.to(roomCode).emit('canvas_cleared');
  });

  // Mode 1: Submit Guess by Player or AI Periodic Check
  socket.on('submit_guess', ({ roomCode, guessText }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    const cleanGuess = (guessText || '').toLowerCase().trim();
    const cleanPrompt = (room.currentPrompt || '').toLowerCase().trim();

    if (cleanGuess === cleanPrompt) {
      // Correct guess! Calculate speed score based on remaining time
      const timeBonus = Math.floor(room.timeRemaining * 15);
      const points = 500 + timeBonus;

      if (player) player.score += points;

      // Also award artist points
      const drawer = room.players.find(p => p.id === room.activeDrawerId);
      if (drawer) drawer.score += Math.floor(points * 0.8);

      io.to(roomCode).emit('guess_result', {
        success: true,
        guesserName: player ? player.name : 'AI',
        guess: guessText,
        points,
        prompt: room.currentPrompt
      });

      // End round early
      clearInterval(room.timer);
      setTimeout(() => startNextRound(room), 3000);
    } else {
      // Incorrect guess
      io.to(roomCode).emit('guess_result', {
        success: false,
        guesserName: player ? player.name : 'Unknown',
        guess: guessText
      });
    }
  });

  // Mode 2: Submit Secret Description by Blind Describer
  socket.on('submit_blind_description', ({ roomCode, description }) => {
    const room = rooms.get(roomCode);
    if (!room || room.mode !== 'blind_artist') return;

    room.secretDescription = description;
    io.to(roomCode).emit('blind_description_set', { description });
    console.log(`📝 Secret description set for room ${roomCode}: "${description}"`);
  });

  // Mode 2 & Mode 3: Submit Canvas Drawing for AI Evaluation
  socket.on('submit_drawing', ({ roomCode, drawingDataUrl }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);

    if (room.mode === 'blind_artist') {
      // Evaluate drawing against description
      const similarityScore = Math.floor(Math.random() * 40 + 55); // 55% to 95% match
      const points = similarityScore * 10;
      if (player) player.score += points;

      const aiCritique = getAIBlindCritique(similarityScore, room.secretDescription);

      io.to(roomCode).emit('blind_evaluation_result', {
        playerId: socket.id,
        playerName: player ? player.name : 'Artist',
        drawingDataUrl,
        similarityScore,
        points,
        aiCritique
      });
    } else if (room.mode === 'pixel_telephone') {
      // Store in chain
      room.telephoneChain.push({
        type: 'draw',
        playerId: socket.id,
        playerName: player ? player.name : 'Artist',
        content: drawingDataUrl,
        stepIndex: room.telephoneChain.length + 1
      });

      advanceTelephoneChain(room);
    }
  });

  // Mode 3: Submit Telephone Text Description
  socket.on('submit_telephone_description', ({ roomCode, description }) => {
    const room = rooms.get(roomCode);
    if (!room || room.mode !== 'pixel_telephone') return;

    const player = room.players.find(p => p.id === socket.id);

    room.telephoneChain.push({
      type: 'describe',
      playerId: socket.id,
      playerName: player ? player.name : 'Describer',
      content: description,
      stepIndex: room.telephoneChain.length + 1
    });

    advanceTelephoneChain(room);
  });

  // Client disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    for (const [code, room] of rooms.entries()) {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const removedPlayer = room.players.splice(index, 1)[0];
        console.log(`👤 ${removedPlayer.name} left room ${code}`);

        if (room.players.length === 0) {
          clearInterval(room.timer);
          rooms.delete(code);
          console.log(`🧹 Room ${code} destroyed (empty)`);
        } else {
          if (room.hostId === socket.id) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
          }
          io.to(code).emit('room_updated', room);
        }
      }
    }
  });
});

// Start Next Round Helper Logic
function startNextRound(room) {
  clearInterval(room.timer);

  if (room.currentRound > room.totalRounds) {
    room.status = 'ended';
    io.to(room.code).emit('game_over', {
      leaderboard: room.players.sort((a, b) => b.score - a.score)
    });
    return;
  }

  room.status = 'playing';
  room.currentPrompt = getRandomPrompt();
  room.timeRemaining = room.roundTime;
  room.drawingHistory = [];

  // Pick drawer / describer rotation
  const drawerIndex = (room.currentRound - 1) % room.players.length;
  room.activeDrawerId = room.players[drawerIndex].id;

  if (room.mode === 'pixel_telephone') {
    room.telephoneChain = [{
      type: 'prompt',
      playerName: 'Chaos Engine',
      content: room.currentPrompt,
      stepIndex: 1
    }];
    room.telephoneStep = 1;
  }

  console.log(`🚀 Starting Round ${room.currentRound}/${room.totalRounds} in room ${room.code}. Mode: ${room.mode}, Prompt: "${room.currentPrompt}"`);

  io.to(room.code).emit('round_started', {
    round: room.currentRound,
    totalRounds: room.totalRounds,
    mode: room.mode,
    prompt: room.currentPrompt,
    activeDrawerId: room.activeDrawerId,
    activeDrawerName: room.players[drawerIndex].name,
    timeLimit: room.roundTime
  });

  // Start round timer countdown
  let aiTickCounter = 0;

  room.timer = setInterval(() => {
    room.timeRemaining--;

    const remainingRatio = room.timeRemaining / room.roundTime;

    // Periodic AI Guess & Cocky Commentary every 7 seconds in Mode 1
    if (room.mode === 'ai_judges' && room.timeRemaining > 0) {
      aiTickCounter++;
      if (aiTickCounter % 7 === 0) {
        const aiResponse = generateAIGuess(room.currentPrompt, remainingRatio, room.drawingHistory);

        io.to(room.code).emit('ai_commentary', {
          guess: aiResponse.guess,
          comment: aiResponse.comment,
          cockinessPercent: aiResponse.cockinessPercent,
          isCorrect: aiResponse.isCorrect,
          timeRemaining: room.timeRemaining
        });

        if (aiResponse.isCorrect) {
          // AI guessed correctly!
          clearInterval(room.timer);
          const drawer = room.players.find(p => p.id === room.activeDrawerId);
          const points = Math.floor(room.timeRemaining * 12 + 300);
          if (drawer) drawer.score += points;

          io.to(room.code).emit('guess_result', {
            success: true,
            guesserName: 'AI Judge 🤖',
            guess: room.currentPrompt,
            points,
            prompt: room.currentPrompt
          });

          setTimeout(() => {
            room.currentRound++;
            startNextRound(room);
          }, 3500);
          return;
        }
      }
    }

    io.to(room.code).emit('timer_tick', {
      timeRemaining: room.timeRemaining,
      ratio: remainingRatio
    });

    if (room.timeRemaining <= 0) {
      clearInterval(room.timer);
      io.to(room.code).emit('time_up', { prompt: room.currentPrompt });

      setTimeout(() => {
        room.currentRound++;
        startNextRound(room);
      }, 4000);
    }
  }, 1000);
}

// Mode 3 Telephone Advance Helper
function advanceTelephoneChain(room) {
  const currentChainLen = room.telephoneChain.length;

  if (currentChainLen >= room.players.length * 2 || currentChainLen >= 6) {
    // End Telephone chain and show Reveal Gallery
    room.status = 'reveal';
    const distortionScore = Math.floor(Math.random() * 45 + 50); // 50% - 95% distortion
    io.to(room.code).emit('telephone_reveal', {
      chain: room.telephoneChain,
      distortionScore,
      summary: `Art deteriorated by ${distortionScore}% from initial prompt "${room.currentPrompt}"!`
    });
  } else {
    // Notify room of next turn step
    const nextPlayerIndex = (currentChainLen) % room.players.length;
    const nextPlayer = room.players[nextPlayerIndex];
    const isDrawTurn = room.telephoneChain[currentChainLen - 1].type === 'describe';

    io.to(room.code).emit('telephone_next_turn', {
      nextPlayerId: nextPlayer.id,
      nextPlayerName: nextPlayer.name,
      turnType: isDrawTurn ? 'draw' : 'describe',
      previousContent: room.telephoneChain[currentChainLen - 1].content
    });
  }
}

// AI Blind Critique Generator Helper
function getAIBlindCritique(score, secretDesc) {
  if (score > 85) {
    return `🎯 Masterpiece! Uncanny interpretation of "${secretDesc}". AI is genuinely impressed!`;
  } else if (score > 70) {
    return `🎨 Solid effort! Captures the spirit of "${secretDesc}", though details got a bit lost in translation.`;
  } else if (score > 55) {
    return `🤔 Abstract take! The AI sees vague alignment with "${secretDesc}", but it's a wild interpretation.`;
  } else {
    return `🤪 Total chaos! This looks less like "${secretDesc}" and more like an accidental smudge.`;
  }
}

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  =======================================================
  🚀 ScribbleChaos Server Running 24/7
  👉 URL: http://localhost:${PORT}
  👉 API Health: http://localhost:${PORT}/api/health
  =======================================================
  `);
});
