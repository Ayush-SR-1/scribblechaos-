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
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Word Prompts List
const PROMPTS = [
  'Cyberpunk Cat', 'Angry Potato', 'Flying Toaster', 'Ninja Turtle', 'Space Banana',
  'Sarcastic Robot', 'Dancing Taco', 'Laser Shark', 'Unicorn with Sunglasses', 'Alien DJ',
  'Haunted Pizza', 'Rocket Penguin', 'Disco Avocado', 'Wizard Frog', 'Electric Guitar',
  'Giant Octopus', 'Roller-skating Bear', 'Vampire Donut', 'Superhero Hamster', 'Zombie Cactus',
  'Time Traveling Microwave', 'Pirate Parrot', 'Neon Dragon', 'Boba Tea Monster', 'Astronaut Pug'
];

const AI_COMMENTARY_TIERS = {
  curious: [
    "Hmm... looks like early line work. Are we making a circle or a void?",
    "Okay, I see some shapes forming. Don't ruin it now!",
    "Interesting choice of colors... is this minimalist abstract art?",
    "I'm scanning... right now it looks like a confused potato.",
    "First few strokes look promising! Or at least not terrible."
  ],
  smug: [
    "Wait, is that supposed to be a leg or a stick figure mistake?",
    "My neural nets are processing... result: 40% art, 60% scribble chaos!",
    "I've seen captcha images clearer than this masterpiece.",
    "Are you drawing with your elbows? Just curious!",
    "I'm guessing, but my confidence score is dropping faster than your score!"
  ],
  cocky: [
    "Seriously? A toddler with a crayon could convey this concept better!",
    "Is that a hat or did your cursor slip into another dimension?",
    "I run on billions of parameters, yet I can't parameterize whatever THIS is!",
    "Tick tock! The clock is ticking and my patience is running out!",
    "If this wins, art school standard is officially dead."
  ],
  brutal: [
    "EMERGENCY! Neural network overheating from sheer artistic confusion!",
    "I give up! Is it a cat? A rocket? A crime against aesthetics?",
    "Time is almost UP and even quantum computers couldn't guess this!",
    "0% confidence, 100% sarcastic judgement!",
    "Final seconds! Save yourself the embarrassment and hit clear!"
  ]
};

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

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

// Vision LLM API Integration (Claude / GPT Vision / Gemini) with Fallback
async function callVisionLLMJudge(prompt, drawingDataUrl, elapsedRatio) {
  const base64Data = (drawingDataUrl || '').replace(/^data:image\/\w+;base64,/, '');

  // 1. Anthropic Claude Vision API (if ANTHROPIC_API_KEY is configured)
  if (process.env.ANTHROPIC_API_KEY && base64Data) {
    try {
      const fetch = (await import('node-fetch')).default;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64Data } },
              { type: 'text', text: `You are a hilarious sarcastic AI art judge in a game. The secret word is "${prompt}". Output a short single sentence sarcastic guess or critique!` }
            ]
          }]
        })
      });
      const data = await res.json();
      if (data.content && data.content[0] && data.content[0].text) {
        const text = data.content[0].text.trim();
        const { cockinessPercent } = getAICockyComment(elapsedRatio);
        return { guess: prompt, comment: text, cockinessPercent, isCorrect: text.toLowerCase().includes(prompt.toLowerCase()) };
      }
    } catch (e) {
      console.warn('Claude API call failed, falling back to local engine:', e.message);
    }
  }

  // 2. OpenAI GPT-4o Vision API (if OPENAI_API_KEY is configured)
  if (process.env.OPENAI_API_KEY && base64Data) {
    try {
      const fetch = (await import('node-fetch')).default;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: `You are a sarcastic AI drawing judge guessing the drawing. The target prompt is "${prompt}". Give a short 1-line sarcastic reaction!` },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Data}` } }
            ]
          }]
        })
      });
      const data = await res.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const text = data.choices[0].message.content.trim();
        const { cockinessPercent } = getAICockyComment(elapsedRatio);
        return { guess: prompt, comment: text, cockinessPercent, isCorrect: text.toLowerCase().includes(prompt.toLowerCase()) };
      }
    } catch (e) {
      console.warn('OpenAI API call failed, falling back to local engine:', e.message);
    }
  }

  // 3. Fallback Procedural Sarcastic AI Engine
  const isCorrect = Math.random() < (0.2 + (1 - elapsedRatio) * 0.7);
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
      `A modern ${wordClue} abstract sculpture`
    ];
    guess = wrongGuesses[Math.floor(Math.random() * wrongGuesses.length)];
  }

  const { comment, cockinessPercent } = getAICockyComment(elapsedRatio);
  return { guess, isCorrect, comment, cockinessPercent };
}

function createRoomObject(code, mode, maxPlayers = 8, roundTime = 60, totalRounds = 3) {
  return {
    code,
    mode,
    maxPlayers: parseInt(maxPlayers) || 8,
    roundTime: parseInt(roundTime) || 60,
    totalRounds: parseInt(totalRounds) || 3,
    players: [],
    hostId: null,
    status: 'lobby',
    currentRound: 1,
    currentPrompt: '',
    secretDescription: '',
    activeDrawerId: null,
    timer: null,
    timeRemaining: 60,
    latestDrawingDataUrl: null,
    telephoneChain: []
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ScribbleChaos AI Art Battleground',
    uptime: process.uptime(),
    activeRooms: rooms.size,
    aiVisionSupport: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    },
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Create Room
  socket.on('create_room', ({ playerName, mode, maxPlayers, roundTime, totalRounds }, callback) => {
    const roomCode = generateRoomCode();
    const room = createRoomObject(roomCode, mode || 'pixel_telephone', maxPlayers, roundTime, totalRounds);

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

    if (typeof callback === 'function') callback({ success: true, roomCode, room });
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
    let targetRoom = null;
    for (const [code, r] of rooms.entries()) {
      if (r.status === 'lobby' && r.players.length < r.maxPlayers) {
        targetRoom = r;
        break;
      }
    }

    if (!targetRoom) {
      const code = generateRoomCode();
      targetRoom = createRoomObject(code, 'pixel_telephone', 8, 60, 3);
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

  // Host Kick Player
  socket.on('kick_player', ({ roomCode, playerId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    const idx = room.players.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      const kicked = room.players.splice(idx, 1)[0];
      const kickedSocket = io.sockets.sockets.get(playerId);
      if (kickedSocket) {
        kickedSocket.leave(roomCode);
        kickedSocket.emit('kicked_from_room');
      }
      io.to(roomCode).emit('room_updated', room);
      console.log(`👢 Host kicked ${kicked.name} from room ${roomCode}`);
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

  socket.on('fabric_sync', ({ roomCode, jsonState }) => {
    socket.to(roomCode).emit('receive_fabric_sync', jsonState);
  });

  socket.on('clear_canvas', ({ roomCode }) => {
    socket.to(roomCode).emit('canvas_cleared');
  });

  socket.on('update_canvas_image', ({ roomCode, dataUrl }) => {
    const room = rooms.get(roomCode);
    if (room) room.latestDrawingDataUrl = dataUrl;
  });

  // Submit Guess in Mode 1
  socket.on('submit_guess', ({ roomCode, guessText }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    const cleanGuess = (guessText || '').toLowerCase().trim();
    const cleanPrompt = (room.currentPrompt || '').toLowerCase().trim();

    if (cleanGuess === cleanPrompt) {
      const timeBonus = Math.floor(room.timeRemaining * 15);
      const points = 500 + timeBonus;

      if (player) player.score += points;

      const drawer = room.players.find(p => p.id === room.activeDrawerId);
      if (drawer) drawer.score += Math.floor(points * 0.8);

      io.to(roomCode).emit('guess_result', {
        success: true,
        guesserName: player ? player.name : 'AI',
        guess: guessText,
        points,
        prompt: room.currentPrompt
      });

      clearInterval(room.timer);
      setTimeout(() => startNextRound(room), 3000);
    } else {
      io.to(roomCode).emit('guess_result', {
        success: false,
        guesserName: player ? player.name : 'Unknown',
        guess: guessText
      });
    }
  });

  // Mode 2: Submit Secret Description
  socket.on('submit_blind_description', ({ roomCode, description }) => {
    const room = rooms.get(roomCode);
    if (!room || room.mode !== 'blind_artist') return;

    room.secretDescription = description;
    io.to(roomCode).emit('blind_description_set', { description });
  });

  // Mode 2 & Mode 3: Submit Canvas Drawing
  socket.on('submit_drawing', ({ roomCode, drawingDataUrl }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);

    if (room.mode === 'blind_artist') {
      const similarityScore = Math.floor(Math.random() * 40 + 55);
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

  // Mode 3: Submit Telephone Description
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

  // Disconnect
  socket.on('disconnect', () => {
    for (const [code, room] of rooms.entries()) {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const removedPlayer = room.players.splice(index, 1)[0];

        if (room.players.length === 0) {
          clearInterval(room.timer);
          rooms.delete(code);
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

function startNextRound(room) {
  clearInterval(room.timer);

  if (room.currentRound > room.totalRounds) {
    room.status = 'ended';
    const sortedLeaderboard = [...room.players].sort((a, b) => b.score - a.score);
    io.to(room.code).emit('game_over', {
      leaderboard: sortedLeaderboard
    });
    return;
  }

  room.status = 'playing';
  room.currentPrompt = getRandomPrompt();
  room.timeRemaining = room.roundTime;

  const drawerIndex = (room.currentRound - 1) % room.players.length;
  room.activeDrawerId = room.players[drawerIndex].id;

  if (room.mode === 'pixel_telephone') {
    room.telephoneChain = [{
      type: 'prompt',
      playerName: 'Chaos Engine',
      content: room.currentPrompt,
      stepIndex: 1
    }];
  }

  io.to(room.code).emit('round_started', {
    round: room.currentRound,
    totalRounds: room.totalRounds,
    mode: room.mode,
    prompt: room.currentPrompt,
    activeDrawerId: room.activeDrawerId,
    activeDrawerName: room.players[drawerIndex].name,
    timeLimit: room.roundTime
  });

  let aiTickCounter = 0;

  room.timer = setInterval(async () => {
    room.timeRemaining--;

    const remainingRatio = room.timeRemaining / room.roundTime;

    if (room.mode === 'ai_judges' && room.timeRemaining > 0) {
      aiTickCounter++;
      if (aiTickCounter % 7 === 0) {
        const aiResponse = await callVisionLLMJudge(room.currentPrompt, room.latestDrawingDataUrl, remainingRatio);

        io.to(room.code).emit('ai_commentary', {
          guess: aiResponse.guess,
          comment: aiResponse.comment,
          cockinessPercent: aiResponse.cockinessPercent,
          isCorrect: aiResponse.isCorrect,
          timeRemaining: room.timeRemaining
        });

        if (aiResponse.isCorrect) {
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

function advanceTelephoneChain(room) {
  const currentChainLen = room.telephoneChain.length;

  if (currentChainLen >= room.players.length * 2 || currentChainLen >= 6) {
    room.status = 'reveal';
    const distortionScore = Math.floor(Math.random() * 45 + 50);
    io.to(room.code).emit('telephone_reveal', {
      chain: room.telephoneChain,
      distortionScore,
      summary: `Art deteriorated by ${distortionScore}% from initial prompt "${room.currentPrompt}"!`
    });
  } else {
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

function getAIBlindCritique(score, secretDesc) {
  if (score > 85) return `🎯 Masterpiece! Uncanny interpretation of "${secretDesc}". AI is genuinely impressed!`;
  if (score > 70) return `🎨 Solid effort! Captures the spirit of "${secretDesc}", though details got a bit lost in translation.`;
  if (score > 55) return `🤔 Abstract take! Vague alignment with "${secretDesc}".`;
  return `🤪 Total chaos! Looks less like "${secretDesc}" and more like an accidental smudge.`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  =======================================================
  🚀 ScribbleChaos Server Running (Vision AI Integrated)
  👉 URL: http://localhost:${PORT}
  =======================================================
  `);
});
