const COLORS_MAP = {
  red: '#e63946',
  blue: '#457b9d',
  yellow: '#f4d35e',
  green: '#2d6a4f',
  orange: '#f77f00',
  purple: '#7b2d8b',
  pink: '#e07a96',
  white: '#e9ecef'
};

function rgbToHue(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r: h = ((g-b)/d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b-r)/d + 2) * 60; break;
      case b: h = ((r-g)/d + 4) * 60; break;
    }
  }
  return Math.round(h);
}

function shadeColor(hex, pct) {
  const num = parseInt(hex.replace('#',''),16);
  const r = Math.min(255, Math.max(0, (num >> 16) + pct));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
  const b = Math.min(255, Math.max(0, (num & 0xff) + pct));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function registerBlocks(colors) {
  colors.forEach(color => {
    const blockType = 'place_' + color + '_brick';
    if (Blockly.Blocks[blockType]) return;

    const displayColor = COLORS_MAP[color];
    Blockly.Blocks[blockType] = {
      init: function() {
        this.appendDummyInput()
          .appendField('🧱 place')
          .appendField(new Blockly.FieldLabel(color.toUpperCase()))
          .appendField('brick');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(rgbToHue(displayColor));
        this.setTooltip('Place a ' + color + ' brick on your stack');
        this.setHelpUrl('');
      }
    };
  });
}

function buildToolbox(colors) {
  const items = colors.map(c => `<block type="place_${c}_brick"></block>`).join('\n');
  return `<xml id="toolbox"><category name="🧱 Bricks" colour="#e94560">${items}</category></xml>`;
}

function renderBrick(color, state = '') {
  const div = document.createElement('div');
  div.className = 'lego-brick ' + color + (state ? ' ' + state : '');
  div.textContent = color.toUpperCase();
  return div;
}

function renderTargetStack(colors) {
  const el = document.getElementById('target-stack');
  el.innerHTML = '';
  if (!colors || colors.length === 0) {
    const ghost = renderBrick('white', 'ghost');
    ghost.textContent = 'YOUR DESIGN';
    el.appendChild(ghost);
    return;
  }
  colors.forEach(c => el.appendChild(renderBrick(c)));
}

function renderMyStack(colors, targetColors) {
  const el = document.getElementById('my-stack');
  el.innerHTML = '';
  if (!colors.length) {
    const ghost = renderBrick('white', 'ghost');
    ghost.textContent = 'RUN CODE';
    el.appendChild(ghost);
    return;
  }
  colors.forEach((c, i) => {
    const correct = !targetColors || targetColors[i] === c;
    const state = targetColors ? (correct ? 'correct' : 'wrong') : '';
    el.appendChild(renderBrick(c, state));
  });
}

function extractStack() {
  const stack = [];
  const topBlocks = workspace.getTopBlocks(true);
  let block = topBlocks.length ? topBlocks[0] : null;
  while (block) {
    const type = block.type;
    if (type.startsWith('place_') && type.endsWith('_brick')) {
      const color = type.replace('place_','').replace('_brick','');
      stack.push(color);
    }
    block = block.getNextBlock ? block.getNextBlock() : null;
  }
  return stack.reverse();
}

function showFeedback(type, msg) {
  const el = document.getElementById('feedback');
  el.className = 'feedback ' + type;
  el.textContent = msg;
}

function hideFeedback() {
  const el = document.getElementById('feedback');
  el.className = 'feedback';
  el.textContent = '';
}

function updateProgress() {
  const n = completedLevels.size;
  document.getElementById('progress-text').textContent = n + ' / 4';
  document.getElementById('progress-fill').style.width = (n / 4 * 100) + '%';
}

function showCelebration(idx, lvl) {
  document.getElementById('celeb-emoji').textContent = lvl.emoji + ' 🎉';
  document.getElementById('celeb-title').textContent = 'Level ' + (idx + 1) + ' Complete!';
  document.getElementById('celeb-msg').textContent = lvl.successMsg;
  const nextBtn = document.querySelector('#celebration .btn-next');
  if (idx >= LEVELS.length - 1) {
    nextBtn.textContent = '🏅 Finish!';
    nextBtn.onclick = () => {
      document.getElementById('celeb-title').textContent = 'All Levels Done!';
      document.getElementById('celeb-emoji').textContent = '🏅';
      document.getElementById('celeb-msg').textContent = 'You completed all 4 levels. You are an Instruction Explorer!';
      nextBtn.style.display = 'none';
    };
  } else {
    nextBtn.textContent = 'Next Level →';
    nextBtn.onclick = nextLevel;
  }
  document.getElementById('celebration').classList.add('show');
}

function nextLevel() {
  document.getElementById('celebration').classList.remove('show');
  const next = Math.min(currentLevel + 1, LEVELS.length - 1);
  loadLevel(next);
}
