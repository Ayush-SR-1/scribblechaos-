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

// ============================================================================
// 1000+ WORD BANK CATEGORIZED & MULTI-LANGUAGE DICTIONARY
// ============================================================================
const WORD_BANKS = {
  en: [
    // Animals (100+)
    'alligator', 'alpaca', 'ant', 'anteater', 'antelope', 'ape', 'armadillo', 'baboon', 'badger', 'bat',
    'bear', 'beaver', 'bee', 'beetle', 'bison', 'boar', 'buffalo', 'butterfly', 'camel', 'cat',
    'caterpillar', 'chameleon', 'cheetah', 'chicken', 'chimpanzee', 'chinchilla', 'cobra', 'cockroach', 'crab', 'cricket',
    'crocodile', 'crow', 'deer', 'dinosaur', 'dog', 'dolphin', 'donkey', 'dragonfly', 'duck', 'eagle',
    'elephant', 'falcon', 'flamingo', 'fly', 'fox', 'frog', 'giraffe', 'goat', 'goldfish', 'goose',
    'gorilla', 'grasshopper', 'hamster', 'hedgehog', 'hippopotamus', 'horse', 'hummingbird', 'hyena', 'iguana', 'jaguar',
    'jellyfish', 'kangaroo', 'koala', 'lemur', 'leopard', 'lion', 'lizard', 'llama', 'lobster', 'monkey',
    'moose', 'mosquito', 'mouse', 'octopus', 'ostrich', 'otter', 'owl', 'panda', 'panther', 'parrot',
    'peacock', 'pelican', 'penguin', 'pig', 'pigeon', 'polar bear', 'porcupine', 'rabbit', 'raccoon', 'rat',
    'rhinoceros', 'scorpion', 'seahorse', 'seal', 'shark', 'sheep', 'sloth', 'snail', 'snake', 'spider',
    'squid', 'squirrel', 'starfish', 'tiger', 'toad', 'turkey', 'turtle', 'walrus', 'wasp', 'whale',
    'wolf', 'zebra',

    // Objects & Household (200+)
    'anchor', 'anvil', 'backpack', 'balloon', 'banana', 'bandage', 'barrel', 'basket', 'battery', 'bed',
    'bell', 'bench', 'bicycle', 'binoculars', 'blanket', 'blender', 'book', 'boomerang', 'bottle', 'bow',
    'bowl', 'box', 'broom', 'brush', 'bucket', 'button', 'calculator', 'calendar', 'camera', 'candle',
    'cannon', 'canoe', 'car', 'carpet', 'castle', 'chair', 'chalk', 'chandelier', 'clock', 'compass',
    'computer', 'couch', 'crown', 'cup', 'curtain', 'desk', 'diamond', 'dice', 'door', 'drum',
    'envelope', 'eraser', 'fan', 'feather', 'fence', 'flag', 'flashlight', 'flute', 'fork', 'fountain',
    'fridge', 'frying pan', 'globe', 'glasses', 'glove', 'guitar', 'hammer', 'handcuffs', 'harp', 'hat',
    'headphones', 'helmet', 'hourglass', 'house', 'iron', 'jacket', 'jar', 'key', 'keyboard', 'kite',
    'knife', 'ladder', 'lamp', 'laptop', 'lantern', 'leash', 'lightbulb', 'lock', 'magnet', 'map',
    'mask', 'matchstick', 'microphone', 'microscope', 'mirror', 'mop', 'necklace', 'needle', 'newspaper', 'notebook',
    'padlock', 'paint brush', 'paperclip', 'passport', 'pen', 'pencil', 'phone', 'piano', 'pillow', 'pipe',
    'pitchfork', 'plate', 'plunger', 'postcard', 'purse', 'radio', 'rake', 'ring', 'robot', 'rocket',
    'rope', 'ruler', 'saddle', 'safe', 'saxophone', 'scissors', 'screwdriver', 'shield', 'shoe', 'shovel',
    'skateboard', 'skis', 'sled', 'soap', 'sock', 'sponge', 'spoon', 'stamp', 'stethoscope', 'suitcase',
    'sunglasses', 'sword', 'syringe', 'table', 'telephone', 'telescope', 'television', 'tent', 'thermometer', 'thimble',
    'tire', 'toaster', 'toilet', 'toothbrush', 'toothpaste', 'torch', 'towel', 'tractor', 'trash can', 'treasure chest',
    'trophy', 'trumpet', 'umbrella', 'vacuum', 'vase', 'violin', 'wallet', 'watch', 'watering can', 'wheelbarrow',
    'whistle', 'window', 'wrench', 'yo-yo', 'zipper',

    // Food & Drink (150+)
    'apple', 'avocado', 'bacon', 'bagel', 'baguette', 'banana', 'barbecue', 'beer', 'biscuit', 'blackberry',
    'blueberry', 'bread', 'broccoli', 'burger', 'butter', 'cabbage', 'cake', 'candy', 'carrot', 'caviar',
    'celery', 'cereal', 'cheese', 'cheesecake', 'cherry', 'chicken wing', 'chili', 'chocolate', 'cinnamon', 'coconut',
    'coffee', 'cookie', 'corn', 'cotton candy', 'croissant', 'cucumber', 'cupcake', 'donut', 'dragon fruit', 'egg',
    'eggplant', 'fig', 'french fries', 'garlic', 'ginger', 'grape', 'grapefruit', 'green bean', 'ham', 'hot dog',
    'ice cream', 'jelly', 'kiwi', 'lemon', 'lettuce', 'lime', 'lobster', 'lollipop', 'macaroni', 'mango',
    'marshmallow', 'milk', 'milkshake', 'muffin', 'mushroom', 'mustard', 'noodle', 'nut', 'oatmeal', 'onion',
    'orange', 'pancake', 'papaya', 'pasta', 'peach', 'peanut', 'pear', 'peas', 'pepper', 'pickle',
    'pie', 'pineapple', 'pizza', 'plum', 'popcorn', 'potato', 'pretzel', 'pumpkin', 'radish', 'raisin',
    'raspberry', 'rice', 'salad', 'salmon', 'sandwich', 'sausage', 'shrimp', 'soup', 'spaghetti', 'spinach',
    'steak', 'strawberry', 'sushi', 'taco', 'tea', 'toast', 'tomato', 'waffle', 'watermelon', 'yogurt',

    // Nature, Places & Transportation (150+)
    'airport', 'amusement park', 'apartment', 'aquarium', 'arch', 'archipelago', 'arctic', 'arena', 'asteroid', 'attic',
    'bakery', 'bank', 'barn', 'beach', 'bridge', 'bus', 'cabin', 'cable car', 'cactus', 'canyon',
    'cave', 'cemetery', 'church', 'circus', 'city', 'cliff', 'cloud', 'comet', 'constellation', 'desert',
    'dock', 'dune', 'earthquake', 'eclipse', 'factory', 'farm', 'fire station', 'forest', 'galaxy', 'garage',
    'garden', 'glacier', 'greenhouse', 'harbor', 'hospital', 'hotel', 'house', 'hurricane', 'iceberg', 'island',
    'jungle', 'lagoon', 'lake', 'library', 'lighthouse', 'marsh', 'meadow', 'meteor', 'metro', 'mill',
    'mountain', 'museum', 'nebula', 'oasis', 'ocean', 'observatory', 'office', 'park', 'pyramid', 'railway',
    'rain', 'rainbow', 'river', 'road', 'roadblock', 'rocket ship', 'ruins', 'satellite', 'school', 'skyscraper',
    'snow', 'space station', 'stadium', 'star', 'submarine', 'sun', 'swamp', 'temple', 'tornado', 'tower',
    'town', 'train', 'tunnel', 'universe', 'valley', 'volcano', 'waterfall', 'windmill', 'zoo',

    // Actions, Concepts & Fantasy (200+)
    'alien', 'angel', 'angel wings', 'archery', 'astronaut', 'baking', 'ballerina', 'climbing', 'cooking', 'dancing',
    'demon', 'detective', 'disguise', 'diver', 'drawing', 'dream', 'dwarf', 'elf', 'exercise', 'explosion',
    'fairy', 'fireman', 'fishing', 'flying', 'ghost', 'giant', 'fairy tale', 'graffiti', 'hero', 'hiking',
    'hypnosis', 'illusion', 'juggler', 'karate', 'king', 'knight', 'laser', 'magic', 'magician', 'martian',
    'monster', 'mummy', 'ninja', 'ninja star', 'painting', 'pirate', 'prince', 'princess', 'reading', 'running',
    'sculpture', 'shadow', 'singing', 'skating', 'skiing', 'sleeping', 'superhero', 'surfing', 'swimming', 'vampire',
    'witch', 'wizard', 'wrestling', 'zombie'
  ],
  es: [
    'gato', 'perro', 'casa', 'sol', 'luna', 'arbol', 'flor', 'coche', 'barco', 'avion',
    'manzana', 'platano', 'pizza', 'helado', 'libro', 'lapiz', 'reloj', 'telefono', 'ordenador', 'guitarra',
    'pelota', 'zapato', 'sombrero', 'camisa', 'pantalon', 'silla', 'mesa', 'cama', 'puerta', 'ventana'
  ],
  fr: [
    'chat', 'chien', 'maison', 'soleil', 'lune', 'arbre', 'fleur', 'voiture', 'bateau', 'avion',
    'pomme', 'banane', 'pizza', 'glace', 'livre', 'crayon', 'horloge', 'telephone', 'ordinateur', 'guitare'
  ],
  de: [
    'katze', 'hund', 'haus', 'sonne', 'mond', 'baum', 'blume', 'auto', 'schiff', 'flugzeug',
    'mehl', 'banane', 'pizza', 'eis', 'buch', 'stift', 'uhr', 'telefon', 'computer', 'gitarre'
  ],
  pt: [
    'gato', 'cachorro', 'casa', 'sol', 'lua', 'arvore', 'flor', 'carro', 'barco', 'aviao',
    'maca', 'banana', 'pizza', 'sorvete', 'livro', 'lapis', 'relogio', 'telefone', 'computador', 'violao'
  ],
  hi: [
    'cat', 'dog', 'house', 'sun', 'moon', 'tree', 'flower', 'car', 'boat', 'airplane',
    'apple', 'banana', 'pizza', 'ice cream', 'book', 'pencil', 'clock', 'phone', 'computer', 'guitar'
  ]
};

// Basic Profanity Filter List
const BAD_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy', 'bastard', 'whore', 'slut'];

function filterProfanity(text) {
  let clean = text || '';
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    clean = clean.replace(regex, '****');
  });
  return clean;
}

// Levenshtein Distance for Close Guess Detection
function getLevenshteinDistance(a, b) {
  const matrix = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenB; i++) matrix[i] = [i];
  for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[lenB][lenA];
}

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomWords(count = 3, language = 'en', customWords = [], customOnly = false) {
  let pool = [];
  if (customOnly && customWords.length > 0) {
    pool = [...customWords];
  } else if (customWords.length > 0) {
    const langPool = WORD_BANKS[language] || WORD_BANKS['en'];
    pool = [...customWords, ...langPool];
  } else {
    pool = WORD_BANKS[language] || WORD_BANKS['en'];
  }

  // Shuffle & pick unique
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  return selected;
}

function generateWordHint(word, revealedIndexes = []) {
  if (!word) return '';
  return word.split('').map((char, index) => {
    if (char === ' ') return '  ';
    if (revealedIndexes.includes(index)) return char.toUpperCase();
    return '_';
  }).join(' ');
}

function createRoomObject(code, isPrivate = false, settings = {}) {
  return {
    code,
    isPrivate,
    maxPlayers: Math.min(20, Math.max(2, parseInt(settings.maxPlayers) || 8)),
    drawTime: Math.min(180, Math.max(30, parseInt(settings.drawTime) || 60)),
    totalRounds: Math.min(10, Math.max(2, parseInt(settings.totalRounds) || 3)),
    wordChoicesCount: Math.min(5, Math.max(1, parseInt(settings.wordChoicesCount) || 3)),
    hintsCount: Math.min(5, Math.max(0, parseInt(settings.hintsCount) || 2)),
    language: settings.language || 'en',
    customWords: (settings.customWords || '').split(',').map(w => w.trim()).filter(Boolean),
    customWordsOnly: !!settings.customWordsOnly,
    
    players: [],
    hostId: null,
    status: 'lobby', // 'lobby', 'selecting_word', 'drawing', 'turn_end', 'ended'
    currentRound: 1,
    currentTurnIndex: 0,
    activeDrawerId: null,
    currentWord: '',
    currentHint: '',
    wordChoices: [],
    revealedIndexes: [],
    correctGuessers: new Set(),
    voteKicks: new Map(), // playerId -> Set(voterIds)
    timer: null,
    timeRemaining: 60,
    latestDrawingDataUrl: null,
    canvasStrokes: []
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ScribbleChaos Skribbl Engine',
    uptime: process.uptime(),
    activeRooms: rooms.size,
    totalWordsInBank: WORD_BANKS.en.length,
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Create Private Room
  socket.on('create_room', ({ playerName, settings, avatar }, callback) => {
    const roomCode = generateRoomCode();
    const room = createRoomObject(roomCode, true, settings || {});

    const player = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substring(0, 4)}`,
      avatar: avatar || {},
      score: 0,
      scoreDelta: 0,
      isHost: true,
      hasGuessed: false
    };

    room.hostId = socket.id;
    room.players.push(player);
    rooms.set(roomCode, room);

    socket.join(roomCode);
    console.log(`🎮 Private Room created: ${roomCode} by ${player.name}`);

    if (typeof callback === 'function') callback({ success: true, roomCode, room });
    io.to(roomCode).emit('room_updated', sanitizeRoomForClient(room));
  });

  // Join Room
  socket.on('join_room', ({ roomCode, playerName, avatar }, callback) => {
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
      avatar: avatar || {},
      score: 0,
      scoreDelta: 0,
      isHost: room.players.length === 0,
      hasGuessed: false
    };

    if (player.isHost) room.hostId = socket.id;

    room.players.push(player);
    socket.join(code);

    console.log(`👤 ${player.name} joined room ${code}`);

    if (typeof callback === 'function') callback({ success: true, roomCode: code, room: sanitizeRoomForClient(room) });
    io.to(code).emit('room_updated', sanitizeRoomForClient(room));

    // Broadcast current canvas to late joiner
    if (room.latestDrawingDataUrl) {
      socket.emit('load_canvas_state', { dataUrl: room.latestDrawingDataUrl });
    }
  });

  // Quick Public Matchmaking
  socket.on('quick_match', ({ playerName, avatar }, callback) => {
    let targetRoom = null;
    for (const [code, r] of rooms.entries()) {
      if (!r.isPrivate && r.status === 'lobby' && r.players.length < r.maxPlayers) {
        targetRoom = r;
        break;
      }
    }

    if (!targetRoom) {
      const code = generateRoomCode();
      targetRoom = createRoomObject(code, false, { drawTime: 60, totalRounds: 3, maxPlayers: 8 });
      rooms.set(code, targetRoom);
    }

    const player = {
      id: socket.id,
      name: playerName || `SpeedArtist_${socket.id.substring(0, 3)}`,
      avatar: avatar || {},
      score: 0,
      scoreDelta: 0,
      isHost: targetRoom.players.length === 0,
      hasGuessed: false
    };

    if (player.isHost) targetRoom.hostId = socket.id;

    targetRoom.players.push(player);
    socket.join(targetRoom.code);

    if (typeof callback === 'function') callback({ success: true, roomCode: targetRoom.code, room: sanitizeRoomForClient(targetRoom) });
    io.to(targetRoom.code).emit('room_updated', sanitizeRoomForClient(targetRoom));
  });

  // Host Kick Player
  socket.on('kick_player', ({ roomCode, playerId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    removePlayerFromRoom(room, playerId, 'kicked');
  });

  // Vote Kick Player
  socket.on('vote_kick', ({ roomCode, targetPlayerId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const targetPlayer = room.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer || targetPlayer.isHost) return;

    if (!room.voteKicks.has(targetPlayerId)) {
      room.voteKicks.set(targetPlayerId, new Set());
    }

    const votes = room.voteKicks.get(targetPlayerId);
    votes.add(socket.id);

    const neededVotes = Math.ceil(room.players.length / 2);
    io.to(roomCode).emit('vote_kick_updated', {
      targetPlayerId,
      targetName: targetPlayer.name,
      currentVotes: votes.size,
      neededVotes
    });

    if (votes.size >= neededVotes) {
      removePlayerFromRoom(room, targetPlayerId, 'vote_kicked');
    }
  });

  // Host Start Game
  socket.on('start_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id || room.status !== 'lobby') return;

    room.currentRound = 1;
    room.currentTurnIndex = 0;
    room.players.forEach(p => { p.score = 0; p.scoreDelta = 0; });
    startWordSelectionPhase(room);
  });

  // Word Selection Choice by Drawer
  socket.on('select_word', ({ roomCode, word }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'selecting_word' || room.activeDrawerId !== socket.id) return;

    room.currentWord = word;
    startDrawingPhase(room);
  });

  // Real-time Stroke & Canvas Operations
  socket.on('draw_stroke', ({ roomCode, strokeData }) => {
    const room = rooms.get(roomCode);
    if (room && room.activeDrawerId === socket.id) {
      socket.to(roomCode).emit('receive_stroke', strokeData);
    }
  });

  socket.on('clear_canvas', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (room && room.activeDrawerId === socket.id) {
      room.latestDrawingDataUrl = null;
      socket.to(roomCode).emit('canvas_cleared');
    }
  });

  socket.on('update_canvas_image', ({ roomCode, dataUrl }) => {
    const room = rooms.get(roomCode);
    if (room && room.activeDrawerId === socket.id) {
      room.latestDrawingDataUrl = dataUrl;
    }
  });

  // Chat & Guess Message Handling
  socket.on('send_chat', ({ roomCode, messageText }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const rawText = (messageText || '').trim();
    if (!rawText) return;

    const cleanText = filterProfanity(rawText);

    // If game is in drawing phase, check if message is a guess
    if (room.status === 'drawing') {
      const isDrawer = room.activeDrawerId === socket.id;
      const targetWord = (room.currentWord || '').toLowerCase().trim();
      const guessWord = cleanText.toLowerCase().trim();

      // Prevent drawer from revealing word in chat
      if (isDrawer && targetWord && (guessWord.includes(targetWord) || targetWord.includes(guessWord))) {
        socket.emit('chat_blocked', { message: 'You cannot type the word or part of it in chat while drawing!' });
        return;
      }

      // If player already guessed, broadcast chat only to drawer and other correct guessers
      if (player.hasGuessed || isDrawer) {
        room.players.forEach(p => {
          if (p.hasGuessed || p.id === room.activeDrawerId) {
            io.to(p.id).emit('chat_message', {
              senderName: player.name,
              message: cleanText,
              isGuessed: true
            });
          }
        });
        return;
      }

      // Exact Match (Correct Guess)
      if (guessWord === targetWord) {
        player.hasGuessed = true;
        room.correctGuessers.add(socket.id);

        const timeRatio = room.timeRemaining / room.drawTime;
        const guesserPoints = Math.round(500 * timeRatio + 100);
        player.score += guesserPoints;
        player.scoreDelta = guesserPoints;

        // Reward drawer based on correct guessers count
        const drawer = room.players.find(p => p.id === room.activeDrawerId);
        if (drawer) {
          const drawerPoints = Math.round(150 * (room.correctGuessers.size / (room.players.length - 1)));
          drawer.score += drawerPoints;
          drawer.scoreDelta = (drawer.scoreDelta || 0) + drawerPoints;
        }

        io.to(roomCode).emit('correct_guess', {
          guesserId: player.id,
          guesserName: player.name,
          points: guesserPoints,
          room: sanitizeRoomForClient(room)
        });

        // Check if all non-drawers have guessed correctly
        const nonDrawersCount = room.players.length - 1;
        if (room.correctGuessers.size >= nonDrawersCount) {
          endTurnPhase(room, 'all_guessed');
        }
        return;
      }

      // Close Guess Check (Levenshtein distance = 1)
      if (targetWord && getLevenshteinDistance(guessWord, targetWord) === 1) {
        socket.emit('close_guess', { message: `"${rawText}" is very close!` });
      }
    }

    // Normal Broadcast Chat
    io.to(roomCode).emit('chat_message', {
      senderName: player.name,
      message: cleanText,
      isGuessed: false
    });
  });

  // Play Again Action
  socket.on('play_again', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.status = 'lobby';
    room.currentRound = 1;
    room.currentTurnIndex = 0;
    room.players.forEach(p => { p.score = 0; p.scoreDelta = 0; p.hasGuessed = false; });
    io.to(roomCode).emit('room_updated', sanitizeRoomForClient(room));
  });

  // Disconnect Handling
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    for (const [code, room] of rooms.entries()) {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        removePlayerFromRoom(room, socket.id, 'disconnected');
      }
    }
  });
});

function removePlayerFromRoom(room, playerId, reason = 'left') {
  const idx = room.players.findIndex(p => p.id === playerId);
  if (idx === -1) return;

  const player = room.players.splice(idx, 1)[0];
  const targetSocket = io.sockets.sockets.get(playerId);
  if (targetSocket) {
    targetSocket.leave(room.code);
    targetSocket.emit('player_removed', { reason });
  }

  console.log(`🚪 ${player.name} removed from room ${room.code} (${reason})`);

  if (room.players.length === 0) {
    clearInterval(room.timer);
    rooms.delete(room.code);
    return;
  }

  // Re-assign host if host left
  if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  // If active drawer left during turn, skip turn
  if (room.activeDrawerId === playerId && ['selecting_word', 'drawing'].includes(room.status)) {
    clearInterval(room.timer);
    io.to(room.code).emit('chat_message', { senderName: 'SYSTEM', message: `Drawer ${player.name} disconnected! Skipping turn...` });
    endTurnPhase(room, 'drawer_left');
  } else {
    io.to(room.code).emit('room_updated', sanitizeRoomForClient(room));
  }
}

// ============================================================================
// GAME FLOW CONTROLLER
// ============================================================================

function startWordSelectionPhase(room) {
  clearInterval(room.timer);

  // Check if round should advance
  if (room.currentTurnIndex >= room.players.length) {
    room.currentTurnIndex = 0;
    room.currentRound++;
  }

  if (room.currentRound > room.totalRounds) {
    room.status = 'ended';
    const leaderboard = [...room.players].sort((a, b) => b.score - a.score);
    io.to(room.code).emit('game_over', { leaderboard });
    return;
  }

  const activeDrawer = room.players[room.currentTurnIndex];
  if (!activeDrawer) return;

  room.status = 'selecting_word';
  room.activeDrawerId = activeDrawer.id;
  room.correctGuessers.clear();
  room.players.forEach(p => { p.hasGuessed = false; p.scoreDelta = 0; });
  room.latestDrawingDataUrl = null;

  // Generate 3 random words
  room.wordChoices = getRandomWords(room.wordChoicesCount, room.language, room.customWords, room.customWordsOnly);
  room.timeRemaining = 15;

  io.to(room.code).emit('word_selection_phase', {
    round: room.currentRound,
    totalRounds: room.totalRounds,
    activeDrawerId: activeDrawer.id,
    activeDrawerName: activeDrawer.name,
    timeLimit: 15
  });

  // Send word choices ONLY to the active drawer
  const drawerSocket = io.sockets.sockets.get(activeDrawer.id);
  if (drawerSocket) {
    drawerSocket.emit('choose_word_prompt', { choices: room.wordChoices });
  }

  room.timer = setInterval(() => {
    room.timeRemaining--;
    io.to(room.code).emit('timer_tick', { timeRemaining: room.timeRemaining, phase: 'selecting_word' });

    if (room.timeRemaining <= 0) {
      clearInterval(room.timer);
      // Auto-pick first word if drawer didn't choose
      room.currentWord = room.wordChoices[0] || 'apple';
      startDrawingPhase(room);
    }
  }, 1000);
}

function startDrawingPhase(room) {
  clearInterval(room.timer);
  room.status = 'drawing';
  room.timeRemaining = room.drawTime;
  room.revealedIndexes = [];

  const wordLen = room.currentWord.length;
  room.currentHint = generateWordHint(room.currentWord, room.revealedIndexes);

  io.to(room.code).emit('drawing_phase_started', {
    activeDrawerId: room.activeDrawerId,
    wordHint: room.currentHint,
    wordLength: wordLen,
    timeLimit: room.drawTime,
    room: sanitizeRoomForClient(room)
  });

  // Calculate reveal intervals for hints
  const hintsToReveal = Math.min(room.hintsCount, Math.floor(wordLen / 2));
  const hintIntervals = [];
  if (hintsToReveal > 0) {
    const step = Math.floor(room.drawTime / (hintsToReveal + 1));
    for (let i = 1; i <= hintsToReveal; i++) {
      hintIntervals.push(room.drawTime - step * i);
    }
  }

  room.timer = setInterval(() => {
    room.timeRemaining--;

    // Reveal random unrevealed letter on interval ticks
    if (hintIntervals.includes(room.timeRemaining)) {
      revealRandomHintLetter(room);
    }

    io.to(room.code).emit('timer_tick', {
      timeRemaining: room.timeRemaining,
      wordHint: room.currentHint,
      phase: 'drawing'
    });

    if (room.timeRemaining <= 0) {
      endTurnPhase(room, 'time_up');
    }
  }, 1000);
}

function revealRandomHintLetter(room) {
  const word = room.currentWord;
  const unrevealed = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== ' ' && !room.revealedIndexes.includes(i)) {
      unrevealed.push(i);
    }
  }

  if (unrevealed.length > 0) {
    const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    room.revealedIndexes.push(randomIndex);
    room.currentHint = generateWordHint(room.currentWord, room.revealedIndexes);
    io.to(room.code).emit('hint_updated', { wordHint: room.currentHint });
  }
}

function endTurnPhase(room, reason = 'time_up') {
  clearInterval(room.timer);
  room.status = 'turn_end';

  io.to(room.code).emit('turn_ended', {
    reason,
    revealedWord: room.currentWord,
    room: sanitizeRoomForClient(room)
  });

  setTimeout(() => {
    room.currentTurnIndex++;
    startWordSelectionPhase(room);
  }, 4500);
}

function sanitizeRoomForClient(room) {
  return {
    code: room.code,
    isPrivate: room.isPrivate,
    maxPlayers: room.maxPlayers,
    drawTime: room.drawTime,
    totalRounds: room.totalRounds,
    wordChoicesCount: room.wordChoicesCount,
    hintsCount: room.hintsCount,
    language: room.language,
    hostId: room.hostId,
    status: room.status,
    currentRound: room.currentRound,
    activeDrawerId: room.activeDrawerId,
    timeRemaining: room.timeRemaining,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      scoreDelta: p.scoreDelta,
      isHost: p.isHost,
      hasGuessed: p.hasGuessed
    }))
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  =======================================================
  🎨 ScribbleChaos (Skribbl.io Parity Engine) Running
  👉 URL: http://localhost:${PORT}
  =======================================================
  `);
});
