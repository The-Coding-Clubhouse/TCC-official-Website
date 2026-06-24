/* ============================================================
   stage-engine.js  —  shared runtime for Days 3, 4 & 5
   Provides: constants, stage state, action executor,
             key-press handler, event log, block compiler helpers
   ============================================================ */

/* ── Shared constants ── */
const SE_COSTUMES = [
  '🧒','🧑','👧','🧙','🦸','🤖',   // original characters
  '🐱','🐶','🐭','🐰',              // cat, dog, rat, bunny
  '🥕','🐦','🦜','🐤'               // carrot, birds
];

const SE_BACKGROUNDS = [
  { name:'City',   cls:'bg-city'   },
  { name:'Forest', cls:'bg-forest' },
  { name:'Space',  cls:'bg-space'  },
  { name:'Beach',  cls:'bg-beach'  },
  { name:'Home',   cls:'bg-home'   },
];

const SE_MESSAGES = [
  'Hello!', 'Watch me!', 'I love coding!', 'Wheee!',
  "I'm the hero!", 'Look out!', 'To the rescue!', "Let's go!"
];

const SE_REACTIONS = {
  STOP:        { emoji:'✋', label:'STOP!',      color:'#e63946' },
  'SLOW DOWN': { emoji:'🐢', label:'SLOW DOWN',  color:'#f4d35e' },
  GO:          { emoji:'🏃', label:'GO!',         color:'#2ecc71' },
  HONK:        { emoji:'📯', label:'HONK HONK!',  color:'#e67e22' },
  DANCE:       { emoji:'💃', label:'DANCE!',       color:'#ff69b4' },
  FREEZE:      { emoji:'🥶', label:'FREEZE!',      color:'#7ec8e3' },
  SPIN:        { emoji:'🌀', label:'SPIN!',        color:'#9b59b6' },
  WAVE:        { emoji:'👋', label:'WAVE!',        color:'#f1c40f' },
};

const SE_MOVE_OPTIONS = [
  ['move left','move_left'],   ['move right','move_right'],
  ['move up','move_up'],       ['move down','move_down'],
  ['jump','jump'],             ['spin','spin']
];

const SE_SOUND_OPTIONS = [
  ['clap 👏','clap'], ['beep 🔔','beep'],
  ['cheer 🎉','cheer'], ['woosh 💨','woosh']
];

const SE_KEY_LABELS = {
  LEFT:'◀ Left', RIGHT:'▶ Right',
  UP:'▲ Up',     DOWN:'▼ Down', SPACE:'⎵ Space'
};

const SE_ALL_KEYS = ['LEFT','RIGHT','UP','DOWN','SPACE'];

// Default pause (ms) automatically inserted between actions in a sequence,
// so stacked costume/background/say changes are visible one at a time
// without a child needing to drag an explicit wait block.
const SE_DEFAULT_STEP_DELAY_MS = 700;

/* ── Stage state (reset per level/activity) ── */
let seState = {
  charX:   50,   // percent, 10–90 (horizontal)
  charY:   0,    // px offset, negative = up, positive = down (vertical)
  costume: 0,
  bgIndex: 0,
};

let seIsRunning = false;
let seEventMap  = {};   // key → [{type, value}]

/* ── Reset stage state ── */
function seResetState() {
  seState     = { charX:50, charY:0, costume:0, bgIndex:0 };
  seIsRunning = false;
  seEventMap  = {};
}

/* ── Render stage to DOM ── */
function seRenderStage() {
  const char   = document.getElementById('stage-character');
  const screen = document.getElementById('stage-screen');
  const bgLbl  = document.getElementById('bg-label');
  const speech = document.getElementById('stage-speech');

  if (char) {
    char.textContent    = SE_COSTUMES[seState.costume];
    char.style.left     = seState.charX + '%';
    char.style.position = 'relative';
    char.style.transform = seState.charY ? `translateY(${seState.charY}px)` : '';
  }
  if (screen) {
    screen.className = 'stage-screen ' + SE_BACKGROUNDS[seState.bgIndex].cls;
  }
  if (bgLbl)  bgLbl.textContent = SE_BACKGROUNDS[seState.bgIndex].name;
  if (speech) speech.classList.add('hidden');
}

/* ── Render key buttons ── */
function seRenderKeys(activeKeys) {
  const container = document.getElementById('stage-buttons');
  if (!container) return;
  container.innerHTML = '';
  SE_ALL_KEYS.forEach(key => {
    const btn = document.createElement('button');
    const isActive = activeKeys.includes(key);
    btn.className   = 'key-btn' + (isActive ? '' : ' locked');
    btn.dataset.key = key;
    btn.textContent = SE_KEY_LABELS[key];
    if (isActive) btn.addEventListener('click', () => seHandleKeyPress(key));
    container.appendChild(btn);
  });
}

/* ── Run a list of compiled actions one at a time, auto-paced.
   After each action, a short default pause is inserted automatically
   so kids can actually see each costume/background/say change land —
   no manual "wait" block required. If an action's executor returns its
   own Promise (e.g. a future custom-duration wait action), that promise
   is awaited instead of adding a second delay on top of it.
   Returns a Promise that resolves once every action has run.        */
function seRunActionSequence(actions, key, executor, stepDelayMs) {
  const delay = stepDelayMs == null ? SE_DEFAULT_STEP_DELAY_MS : stepDelayMs;
  let chain = Promise.resolve();
  (actions || []).forEach(action => {
    chain = chain.then(() => {
      const result = executor(action, key);
      if (result && typeof result.then === 'function') return result;
      return new Promise(resolve => setTimeout(resolve, delay));
    });
  });
  return chain;
}

/* ── Execute a single action on the stage ──
   FIX: every case that may run async work now returns a Promise
        so seRunActionSequence can properly await it.              */
function seExecuteAction(action, key) {
  const char   = document.getElementById('stage-character');
  const speech = document.getElementById('stage-speech');

  switch (action.type) {
    case 'move': {
      const step = 12;
      const stepY = 25; // px per up/down press
      if (action.value === 'move_left') {
        seState.charX = Math.max(10, seState.charX - step);
        seLog(`◀ ${key}: moved left`);
      } else if (action.value === 'move_right') {
        seState.charX = Math.min(90, seState.charX + step);
        seLog(`▶ ${key}: moved right`);
      } else if (action.value === 'move_up') {
        seState.charY = Math.max(-60, seState.charY - stepY);
        seLog(`🔼 ${key}: moved up`);
      } else if (action.value === 'move_down') {
        seState.charY = Math.min(60, seState.charY + stepY);
        seLog(`🔽 ${key}: moved down`);
      } else if (action.value === 'jump') {
        if (char) {
          const base = seState.charY ? `translateY(${seState.charY}px) ` : '';
          char.style.transform = `${base}translateY(-30px)`;
          setTimeout(() => { char.style.transform = seState.charY ? `translateY(${seState.charY}px)` : ''; }, 400);
        }
        seLog(`⬆ ${key}: jumped!`);
      } else if (action.value === 'spin') {
        if (char) {
          const base = seState.charY ? `translateY(${seState.charY}px) ` : '';
          char.style.transform = `${base}rotate(360deg)`;
          setTimeout(() => { char.style.transform = seState.charY ? `translateY(${seState.charY}px)` : ''; }, 500);
        }
        seLog(`🌀 ${key}: spin!`);
      }
      if (char) {
        char.style.left = seState.charX + '%';
        if (action.value === 'move_left' || action.value === 'move_right' || action.value === 'move_up' || action.value === 'move_down') {
          char.style.transform = seState.charY ? `translateY(${seState.charY}px)` : '';
        }
      }
      return Promise.resolve();
    }

    case 'say': {
      if (speech) {
        speech.textContent = action.value;
        speech.classList.remove('hidden');
        setTimeout(() => speech.classList.add('hidden'), 5000);
      }
      seLog(`💬 ${key}: says "${action.value}"`);
      return Promise.resolve();
    }

    case 'costume': {
      const idx = parseInt(action.value, 10);
      seState.costume = idx;
      if (char) char.textContent = SE_COSTUMES[idx] || '🧒';
      seLog(`👗 ${key}: costume → ${SE_COSTUMES[idx]}`);
      return Promise.resolve();
    }

    case 'background': {
      const idx = parseInt(action.value, 10);
      seState.bgIndex = idx;
      const screen = document.getElementById('stage-screen');
      const bgLbl  = document.getElementById('bg-label');
      if (screen) screen.className = 'stage-screen ' + SE_BACKGROUNDS[idx].cls;
      if (bgLbl)  bgLbl.textContent = SE_BACKGROUNDS[idx].name;
      seLog(`🏙 ${key}: background → ${SE_BACKGROUNDS[idx].name}`);
      return Promise.resolve();
    }

    case 'sound': {
      seLog(`🔊 ${key}: ${action.value}`);
      showFeedback('info', `🔊 Playing ${action.value}!`);
      setTimeout(hideFeedback, 1000);
      return Promise.resolve();
    }

    case 'wait': {
      const seconds = Number(action.value) || 1;
      seLog(`⏳ ${key}: waiting ${seconds}s`);
      // FIX: this was already returning a Promise — kept as-is (correct)
      return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    case 'reaction': {
      // Used by if-then activity: show reaction on the reaction screen
      const r = SE_REACTIONS[action.value] || { emoji:'⚡', label: action.value, color:'#fff' };
      seShowReaction(r.emoji, r.label, `Rule fired: IF ${action.key?.toUpperCase()} → ${action.value}`, r.color);
      seLog(`🚦 IF ${action.key} → ${action.value}: ${r.label}`);
      return Promise.resolve();
    }

    default:
      return Promise.resolve();
  }
}

/* ── Handle a key button press ── */
function seHandleKeyPress(key) {
  if (!seIsRunning) {
    showFeedback('info', 'Press ▶ Run first to activate your code!');
    return;
  }

  // Flash button
  const btn = document.querySelector(`.key-btn[data-key="${key}"]`);
  if (btn) { btn.classList.add('active'); setTimeout(() => btn.classList.remove('active'), 200); }

  const actions = seEventMap[key];
  if (!actions || !actions.length) {
    seLog(`🔘 ${key} pressed — no rule coded, nothing happens`);
    showFeedback('info', `No rule for ${key} — drag a "When ${key} pressed" block to make it do something!`);
    return;
  }

  seRunActionSequence(actions, key, seExecuteAction).then(() => {
    // Notify the active activity that a key fired (for completion checks)
    if (typeof seOnKeyFired === 'function') seOnKeyFired(key);
  });
}

/* ── Compile a Blockly workspace's action blocks into an action array ──
   Works with both 'anim_' (Day 4) and 'fp_' (Day 5) prefixes.
   FIX: fp_repeat now expands its inner actions inline (loops work).
   FIX: fp_if_score nested actions are compiled recursively (conditions work).
   FIX: random_pos and hide_sprite are recognised here too.              */
function seCompileActions(block, prefix) {
  const actions = [];
  let b = block;
  while (b) {
    const t = b.type;
    // Helper: read SPRITE field safely — returns 0 if the block has no such field
    // (so Day 4 anim_ blocks without a sprite selector default to sprite 0).
    const si = () => { const v = b.getFieldValue('SPRITE'); return v !== null ? Number(v) : 0; };

    if (t === prefix + 'new_sprite') {
      actions.push({ type:'new_sprite', spriteIdx: si(), costume: b.getFieldValue('COSTUME') ?? '0' });
    } else if (t === prefix + 'move') {
      actions.push({ type:'move', value:b.getFieldValue('ACTION'), spriteIdx: si() });
    } else if (t === prefix + 'say') {
      actions.push({ type:'say', value:b.getFieldValue('MSG'), spriteIdx: si() });
    } else if (t === prefix + 'costume') {
      actions.push({ type:'costume', value:b.getFieldValue('IDX'), spriteIdx: si() });
    } else if (t === prefix + 'background') {
      actions.push({ type:'background', value:b.getFieldValue('IDX') });
    } else if (t === prefix + 'sound') {
      actions.push({ type:'sound', value:b.getFieldValue('SOUND') });
    } else if (t === prefix + 'wait') {
      actions.push({ type:'wait', value:Number(b.getFieldValue('SECONDS')) || 1 });
    } else if (t === prefix + 'set_var') {
      actions.push({ type:'set_var', name:b.getFieldValue('NAME'), value:b.getFieldValue('VALUE') });
    } else if (t === prefix + 'change_var') {
      actions.push({ type:'change_var', name:b.getFieldValue('NAME'), value:b.getFieldValue('VALUE') });
    } else if (t === prefix + 'win') {
      actions.push({ type:'win' });
    } else if (t === prefix + 'lose') {
      actions.push({ type:'lose' });
    } else if (t === prefix + 'hide_sprite') {
      actions.push({ type:'hide_sprite', spriteIdx: si() });
    } else if (t === prefix + 'random_pos') {
      actions.push({ type:'random_pos', spriteIdx: si() });
    } else if (t === prefix + 'repeat') {
      // Expand loop inline so seRunActionSequence sees flat actions
      const times = Number(b.getFieldValue('TIMES')) || 1;
      const inner = seCompileActions(b.getInputTargetBlock('DO'), prefix);
      for (let i = 0; i < times; i++) {
        inner.forEach(a => actions.push({ ...a }));
      }
    } else if (t === prefix + 'if_score') {
      // Compile nested actions inside the condition block recursively
      const nested = seCompileActions(b.getInputTargetBlock('DO'), prefix);
      actions.push({
        type:'if_score',
        name: b.getFieldValue('NAME'),
        op:   b.getFieldValue('OP') || '>=',
        value: Number(b.getFieldValue('VALUE') || 0),
        actions: nested
      });
    }
    b = b.getNextBlock();
  }
  return actions;
}

/* ── Compile a Blockly workspace's event blocks into seEventMap ──
   Works with both 'anim_when_key' (Day 4) and 'fp_when_key' (Day 5)
   block type prefixes.                                              */
function seCompileEvents(ws, blockPrefix) {
  const map = {};
  const prefix = blockPrefix || '';

  ws.getAllBlocks(false).forEach(block => {
    if (block.type === prefix + 'when_key') {
      const key = block.getFieldValue('KEY');
      const actions = seCompileActions(block.getInputTargetBlock('DO'), prefix);
      if (actions.length) map[key] = actions;
    } else if (block.type === prefix + 'when_start') {
      const actions = seCompileActions(block.getInputTargetBlock('DO'), prefix);
      if (actions.length) map.START = actions;
    }
  });

  // Compile touch/collision events into a dedicated __touches__ list
  const touchBlocks = ws.getAllBlocks(false)
    .filter(b => b.type === prefix + 'when_touch');

  map['__touches__'] = touchBlocks.map(block => ({
    spriteA: parseInt(block.getFieldValue('SPRITE_A'), 10),
    spriteB: parseInt(block.getFieldValue('SPRITE_B'), 10),
    actions: seCompileActions(block.getInputTargetBlock('DO'), prefix)
  }));

  return map;
}

/* ── Compile if-then rules from workspace ──
   Works with 'if_light_rule' (Day 3) and 'fp_if_light' (Day 5).  */
function seCompileRules(ws, blockType) {
  const rules = {};
  ws.getTopBlocks(true).forEach(block => {
    let b = block;
    while (b) {
      if (b.type === blockType) {
        rules[b.getFieldValue('COLOR')] = b.getFieldValue('REACTION');
      }
      b = b.getNextBlock();
    }
  });
  return rules;
}

/* ── If-Then reaction screen ── */
function seShowReaction(emoji, label, hint, color) {
  const eEl = document.getElementById('reaction-emoji');
  const lEl = document.getElementById('reaction-label');
  const hEl = document.getElementById('reaction-hint');
  if (eEl) eEl.textContent = emoji;
  if (lEl) { lEl.textContent = label; lEl.style.color = color || '#fff'; }
  if (hEl) hEl.textContent  = hint;
}

function seResetReactionScreen() {
  seShowReaction('❓', 'No light clicked yet', 'Click Run then click a light above', '#7ec8e3');
}

/* ── Event log ── */
function seLog(msg) {
  const log = document.getElementById('event-log');
  if (!log) return;
  const p = document.createElement('p');
  p.className = 'new';
  p.textContent = msg;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

function seClearLog(placeholder) {
  const log = document.getElementById('event-log');
  if (log) log.innerHTML = `<p>${placeholder || 'Press Run then click a button!'}</p>`;
}

/* ── Register shared action blocks (used by Day 4 & 5) ──
   Pass a prefix string ('anim_' or 'fp_' or '') to namespace blocks.
   Calling with a prefix that already has blocks registered is safe.  */
function seRegisterActionBlocks(prefix) {
  const p = prefix || '';

  if (!Blockly.Blocks[p + 'move']) {
    Blockly.Blocks[p + 'move'] = {
      init() {
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown(SE_MOVE_OPTIONS), 'ACTION');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(230);
      }
    };
  }

  if (!Blockly.Blocks[p + 'say']) {
    Blockly.Blocks[p + 'say'] = {
      init() {
        this.appendDummyInput()
          .appendField('💬 say')
          .appendField(new Blockly.FieldTextInput('Hello!'), 'MSG');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(300);
        this.setTooltip('Click the text and type anything you want the sprite to say!');
      }
    };
  }

  if (!Blockly.Blocks[p + 'costume']) {
    Blockly.Blocks[p + 'costume'] = {
      init() {
        this.appendDummyInput()
          .appendField('👗 change costume to')
          .appendField(new Blockly.FieldDropdown(SE_COSTUMES.map((c, i) => [c, String(i)])), 'IDX');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(60);
      }
    };
  }

  if (!Blockly.Blocks[p + 'background']) {
    Blockly.Blocks[p + 'background'] = {
      init() {
        this.appendDummyInput()
          .appendField('🏙 change background to')
          .appendField(new Blockly.FieldDropdown(SE_BACKGROUNDS.map((b, i) => [b.name, String(i)])), 'IDX');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(60);
      }
    };
  }

  if (!Blockly.Blocks[p + 'sound']) {
    Blockly.Blocks[p + 'sound'] = {
      init() {
        this.appendDummyInput()
          .appendField('🔊 play sound')
          .appendField(new Blockly.FieldDropdown(SE_SOUND_OPTIONS), 'SOUND');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(330);
      }
    };
  }

  if (!Blockly.Blocks[p + 'wait']) {
    Blockly.Blocks[p + 'wait'] = {
      init() {
        this.appendDummyInput()
          .appendField('⏳ wait')
          .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SECONDS')
          .appendField('seconds');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(0);
        this.setTooltip('Pause before running the next action — use it to space out costume or background changes');
      }
    };
  }

  if (!Blockly.Blocks[p + 'when_key']) {
    Blockly.Blocks[p + 'when_key'] = {
      init() {
        this.appendStatementInput('DO')
          .appendField('⚡ When')
          .appendField(new Blockly.FieldDropdown(SE_ALL_KEYS.map(k => [k, k])), 'KEY')
          .appendField('pressed →');
        this.setColour(180);
        this.setPreviousStatement(true, 'Event');
        this.setNextStatement(true, 'Event');
        this.setTooltip('Runs these actions when the key is pressed');
      }
    };
  }
}