# 🎨 ScribbleChaos — Ultra-Modern AI Art Battleground

ScribbleChaos is an ultra-modern, dark-themed gaming portal and real-time multiplayer drawing application. Players challenge each other across 3 unique game modes with an AI engine that gets progressively cockier and more sarcastic the longer it takes to guess!

---

## 🌟 Key Features

### 1. Hero Split-Screen Canvas
- **Left Side**: Animated headline (*"The Ultimate AI Art Battleground"*) and a pulsing **"Quick Match"** matchmaking bar.
- **Right Side**: Looping visual showcase canvas displaying sketches with dynamic AI speech bubbles containing cocky commentary.

### 2. Three Distinct Game Modes
1. **AI Judges Your Drawing**:
   - You draw, AI guesses in real time.
   - Multiplayer rooms with speed-based scoring.
   - **Twist**: As the timer counts down (0% to 100%), the AI's commentary escalates from curious → smug → cocky → brutally sarcastic!
2. **Blind Artist**:
   - Icon of an eye with a slash (`👁️❌`).
   - One player describes an image in text, while others draw it blindly.
   - AI evaluates and scores whose drawing matched the secret description best.
3. **Pixel Telephone**:
   - Chain-link step icon (`🔗`).
   - Player 1 draws → Player 2 describes in text → Player 3 draws from description → repeat.
   - Reveals the hilarious step-by-step art distortion sequence in the final reveal gallery with an AI Chaos Rating.

### 3. Team Actions & Global Navigation
- Prominent **"Create a Room / Team"** button launching a custom room builder modal.
- Clear yellow **"Back"** button (`#ffe600`) for global room and portal exit navigation.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

Access the application in your browser at:
`http://localhost:3000`

---

## 🌐 24/7 Production Deployment Guide

ScribbleChaos is engineered to run **24/7 on any server or cloud platform** without relying on a temporary localhost session.

### Option A: Free 24/7 Hosting on Render.com
1. Push this repository to GitHub/GitLab.
2. Log in to [Render.com](https://render.com) and click **New > Web Service**.
3. Select your repository. Render will automatically detect `render.yaml`.
4. Click **Deploy**. Your game will be live 24/7 with a public SSL URL (e.g., `https://scribblechaos.onrender.com`).

### Option B: Docker Container Deployment
```bash
# Build Docker Image
docker build -t scribblechaos .

# Run Docker Container 24/7
docker run -d -p 3000:3000 --name scribblechaos-app scribblechaos
```

### Option C: Production VPS / PM2
```bash
# Install PM2 Process Manager
npm install -g pm2

# Start server as a 24/7 background service
pm2 start server.js --name "scribblechaos"

# Enable auto-restart on system reboot
pm2 startup
pm2 save
```

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: HTML5 Canvas API, CSS3 Grid/Flexbox with Cyber-Cartoon dark neon theme, Web Audio API sound synthesizer, Vanilla ES6 JavaScript.
- **Backend**: Node.js, Express, Socket.IO real-time WebSocket state manager.
- **AI Engine**: Hybrid AI Guessing Engine with sarcasm curve (0-100% cockiness rating). Supports optional multimodal LLM API keys (`GEMINI_API_KEY` / `OPENAI_API_KEY` in `.env`).
