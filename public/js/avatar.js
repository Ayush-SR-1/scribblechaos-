// Avatar Generator & Customizer Engine for ScribbleChaos
class AvatarEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.eyesIndex = 0;
    this.mouthIndex = 0;
    this.colorIndex = 0;

    this.eyesList = ['cute', 'sunglasses', 'wink', 'shock', 'cat', 'angry', 'pixel'];
    this.mouthsList = ['smile', 'grin', 'tongue', 'o_mouth', 'mustache', 'smug', 'vampire'];
    this.colorsList = ['#ffcc00', '#ff007f', '#00f0ff', '#39ff14', '#9d4edd', '#ff6600', '#ff3333', '#ffffff'];

    this.loadSaved();
  }

  loadSaved() {
    const saved = localStorage.getItem('scribble_avatar_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.eyesIndex = parsed.eyes % this.eyesList.length;
        this.mouthIndex = parsed.mouth % this.mouthsList.length;
        this.colorIndex = parsed.color % this.colorsList.length;
      } catch(e) {}
    }
  }

  save() {
    localStorage.setItem('scribble_avatar_config', JSON.stringify({
      eyes: this.eyesIndex,
      mouth: this.mouthIndex,
      color: this.colorIndex
    }));
  }

  getConfig() {
    return {
      eyes: this.eyesList[this.eyesIndex],
      mouth: this.mouthsList[this.mouthIndex],
      color: this.colorsList[this.colorIndex]
    };
  }

  randomize() {
    this.eyesIndex = Math.floor(Math.random() * this.eyesList.length);
    this.mouthIndex = Math.floor(Math.random() * this.mouthsList.length);
    this.colorIndex = Math.floor(Math.random() * this.colorsList.length);
    this.save();
    this.render();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  nextEyes(dir) {
    this.eyesIndex = (this.eyesIndex + dir + this.eyesList.length) % this.eyesList.length;
    this.save();
    this.render();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  nextMouth(dir) {
    this.mouthIndex = (this.mouthIndex + dir + this.mouthsList.length) % this.mouthsList.length;
    this.save();
    this.render();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  nextColor(dir) {
    this.colorIndex = (this.colorIndex + dir + this.colorsList.length) % this.colorsList.length;
    this.save();
    this.render();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  getSvgString(config) {
    const cfg = config || this.getConfig();
    const bgCol = cfg.color;

    let eyesSvg = '';
    switch (cfg.eyes) {
      case 'cute':
        eyesSvg = `<circle cx="35" cy="42" r="6" fill="#0f172a"/><circle cx="65" cy="42" r="6" fill="#0f172a"/><circle cx="37" cy="40" r="2" fill="#fff"/><circle cx="67" cy="40" r="2" fill="#fff"/>`;
        break;
      case 'sunglasses':
        eyesSvg = `<rect x="22" y="36" width="24" height="14" rx="3" fill="#0f172a"/><rect x="54" y="36" width="24" height="14" rx="3" fill="#0f172a"/><line x1="46" y1="42" x2="54" y2="42" stroke="#0f172a" stroke-width="3"/>`;
        break;
      case 'wink':
        eyesSvg = `<circle cx="35" cy="42" r="6" fill="#0f172a"/><path d="M 58 42 Q 65 34 72 42" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>`;
        break;
      case 'shock':
        eyesSvg = `<circle cx="35" cy="42" r="8" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="35" cy="42" r="3" fill="#0f172a"/><circle cx="65" cy="42" r="8" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="65" cy="42" r="3" fill="#0f172a"/>`;
        break;
      case 'angry':
        eyesSvg = `<line x1="26" y1="34" x2="42" y2="40" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/><line x1="74" y1="34" x2="58" y2="40" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/><circle cx="35" cy="44" r="4" fill="#0f172a"/><circle cx="65" cy="44" r="4" fill="#0f172a"/>`;
        break;
      case 'cat':
        eyesSvg = `<ellipse cx="35" cy="42" rx="6" ry="8" fill="#00f0ff" stroke="#0f172a" stroke-width="2"/><ellipse cx="65" cy="42" rx="6" ry="8" fill="#00f0ff" stroke="#0f172a" stroke-width="2"/><line x1="35" y1="36" x2="35" y2="48" stroke="#0f172a" stroke-width="3"/><line x1="65" y1="36" x2="65" y2="48" stroke="#0f172a" stroke-width="3"/>`;
        break;
      default: // pixel
        eyesSvg = `<rect x="30" y="38" width="10" height="10" fill="#0f172a"/><rect x="60" y="38" width="10" height="10" fill="#0f172a"/>`;
    }

    let mouthSvg = '';
    switch (cfg.mouth) {
      case 'smile':
        mouthSvg = `<path d="M 32 62 Q 50 78 68 62" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>`;
        break;
      case 'grin':
        mouthSvg = `<path d="M 30 60 Q 50 82 70 60 Z" fill="#fff" stroke="#0f172a" stroke-width="3"/>`;
        break;
      case 'tongue':
        mouthSvg = `<path d="M 32 60 Q 50 75 68 60" fill="none" stroke="#0f172a" stroke-width="4"/><path d="M 44 65 Q 50 78 56 65 Z" fill="#ff007f" stroke="#0f172a" stroke-width="2"/>`;
        break;
      case 'o_mouth':
        mouthSvg = `<circle cx="50" cy="65" r="8" fill="#0f172a"/>`;
        break;
      case 'mustache':
        mouthSvg = `<path d="M 30 60 Q 40 52 50 60 Q 60 52 70 60 Q 60 68 50 62 Q 40 68 30 60 Z" fill="#0f172a"/>`;
        break;
      case 'vampire':
        mouthSvg = `<path d="M 32 60 Q 50 76 68 60 Z" fill="#0f172a"/><polygon points="40,60 43,67 46,60" fill="#fff"/><polygon points="54,60 57,67 60,60" fill="#fff"/>`;
        break;
      default: // smug
        mouthSvg = `<path d="M 36 66 Q 52 64 64 58" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>`;
    }

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block;">
        <circle cx="50" cy="50" r="42" fill="${bgCol}" stroke="#0f172a" stroke-width="4.5"/>
        <circle cx="22" cy="54" r="6" fill="#ff77aa" opacity="0.4"/>
        <circle cx="78" cy="54" r="6" fill="#ff77aa" opacity="0.4"/>
        ${eyesSvg}
        ${mouthSvg}
      </svg>
    `;
  }

  render() {
    if (!this.container) return;
    const svgHTML = this.getSvgString();
    
    this.container.innerHTML = `
      <div class="avatar-customizer-box">
        
        <div class="avatar-left-section">
          <div class="avatar-display-area">
            ${svgHTML}
          </div>
          <button class="btn-dice-random" id="btnRandomAvatar" title="Randomize Avatar">🎲</button>
        </div>

        <div class="avatar-controls-rows">
          <div class="avatar-row">
            <button class="avatar-arrow-btn" onclick="window.avatarEngine.nextEyes(-1)">&lt;</button>
            <span class="avatar-row-label">Eyes</span>
            <button class="avatar-arrow-btn" onclick="window.avatarEngine.nextEyes(1)">&gt;</button>
          </div>
          <div class="avatar-row">
            <button class="avatar-arrow-btn" onclick="window.avatarEngine.nextMouth(-1)">&lt;</button>
            <span class="avatar-row-label">Mouth</span>
            <button class="avatar-arrow-btn" onclick="window.avatarEngine.nextMouth(1)">&gt;</button>
          </div>
          <div class="avatar-row">
            <button class="avatar-arrow-btn" onclick="window.avatarEngine.nextColor(-1)">&lt;</button>
            <span class="avatar-row-label">Color</span>
            <button class="avatar-arrow-btn" onclick="window.avatarEngine.nextColor(1)">&gt;</button>
          </div>
        </div>

      </div>
    `;

    const diceBtn = document.getElementById('btnRandomAvatar');
    if (diceBtn) {
      diceBtn.addEventListener('click', () => this.randomize());
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.avatarEngine = new AvatarEngine('avatarCustomizerContainer');
  window.avatarEngine.render();
});
