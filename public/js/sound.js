// Web Audio API Sound & Music Synthesizer Engine for ScribbleChaos
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = false;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.3;
    
    this.bgMusicOsc = null;
    this.bgMusicGain = null;
    this.bgMusicTimer = null;

    this.loadSettings();
  }

  loadSettings() {
    const saved = localStorage.getItem('scribble_audio_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.sfxEnabled = parsed.sfxEnabled ?? true;
        this.musicEnabled = parsed.musicEnabled ?? false;
        this.sfxVolume = parsed.sfxVolume ?? 0.8;
        this.musicVolume = parsed.musicVolume ?? 0.3;
      } catch(e) {}
    }
  }

  saveSettings() {
    localStorage.setItem('scribble_audio_settings', JSON.stringify({
      sfxEnabled: this.sfxEnabled,
      musicEnabled: this.musicEnabled,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume
    }));
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playClick() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playDrawStroke() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180 + Math.random() * 80, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playAICockyBuzz() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.setValueAtTime(220, this.ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(90, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playSuccessFanfare() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.1);
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.25);
    });
  }

  playTick() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  toggleMusic(enable) {
    this.musicEnabled = enable;
    this.saveSettings();
    if (this.musicEnabled) {
      this.startBgMusic();
    } else {
      this.stopBgMusic();
    }
  }

  startBgMusic() {
    this.init();
    if (!this.ctx) return;
    this.stopBgMusic();

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    let noteIdx = 0;

    this.bgMusicTimer = setInterval(() => {
      if (!this.musicEnabled) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIdx], this.ctx.currentTime);
      noteIdx = (noteIdx + 1) % notes.length;

      gain.gain.setValueAtTime(0.03 * this.musicVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    }, 600);
  }

  stopBgMusic() {
    if (this.bgMusicTimer) {
      clearInterval(this.bgMusicTimer);
      this.bgMusicTimer = null;
    }
  }
}

window.soundEngine = new SoundEngine();
