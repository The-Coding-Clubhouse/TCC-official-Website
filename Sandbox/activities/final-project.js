/* ============================================================
   final-project.js — Day 5: Free Sandbox (all blocks)
   Depends on: sandbox.js, stage-engine.js
   Runs inside lego.html — exposes setupFPWorkspace()
   ============================================================ */

const FP_COLORS = ['red','blue','yellow','green','orange','purple','pink','white'];
const FP_VARIABLES = ['score','lives','coins'];
const FP_COLOR_HEX = {
  red:'#e74c3c', blue:'#3498db', yellow:'#f1c40f', green:'#2ecc71',
  orange:'#e67e22', purple:'#9b59b6', pink:'#ff69b4', white:'#ecf0f1'
};

// Dropdown options shared across sprite-aware blocks
const FP_SPRITE_OPTIONS = [['sprite 1','0'],['sprite 2','1'],['sprite 3','2'],['sprite 4','3']];

let fpWorkspace = null;

// Collision detection flag — prevents the touch handler firing every animation frame
let fpCollisionActive = false;

// Day 5 uses fp-sprite-0…3 DOM elements (not the old fp-stage-character).
// sprites[i]: { x (%), costume (index into SE_COSTUMES), visible }
function fpDefaultState() {
  return {
    bgIndex: 0,
    vars: { score: 0, lives: 3, coins: 0 },
    sprites: [
      { x: 20, y: 0, costume: 0, visible: false },
      { x: 40, y: 0, costume: 1, visible: false },
      { x: 60, y: 0, costume: 2, visible: false },
      { x: 80, y: 0, costume: 3, visible: false },
    ]
  };
}
let fpState = fpDefaultState();

function registerFPBlocks() {
  FP_COLORS.forEach(color => {
    const name = `brick_${color}`;
    if (Blockly.Blocks[name]) return;
    Blockly.Blocks[name] = {
      init() {
        this.appendDummyInput().appendField(`🧱 ${color.toUpperCase()} brick`);
        this.setPreviousStatement(true, 'Brick');
        this.setNextStatement(true, 'Brick');
        this.setColour(FP_COLOR_HEX[color] || '#aaa');
      }
    };
  });

  if (!Blockly.Blocks['fp_repeat']) {
    Blockly.defineBlocksWithJsonArray([{
      type: 'fp_repeat', message0: '🔁 repeat %1 times %2 do %3',
      args0: [
        { type:'field_number', name:'TIMES', value:2, min:1, precision:1 },
        { type:'input_dummy' },
        { type:'input_statement', name:'DO', check:'Action' }
      ],
      previousStatement: 'Action', nextStatement: 'Action', colour: 120
    }]);
  }

  if (!Blockly.Blocks['fp_if_score']) {
    Blockly.Blocks['fp_if_score'] = {
      init() {
        this.appendDummyInput()
          .appendField('🚦 if')
          .appendField(new Blockly.FieldDropdown(FP_VARIABLES.map(v => [v, v])), 'NAME')
          .appendField(new Blockly.FieldDropdown([['>=','>='], ['<=','<='], ['==','=='], ['>','>'], ['<','<']]), 'OP')
          .appendField(new Blockly.FieldNumber(0), 'VALUE');
        this.appendStatementInput('DO').setCheck('Action').appendField('then');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(200);
      }
    };
  }

  if (!Blockly.Blocks['fp_when_start']) {
    Blockly.Blocks['fp_when_start'] = {
      init() {
        this.appendStatementInput('DO')
          .setCheck('Action')
          .appendField('🚀 When run pressed');
        this.setPreviousStatement(true, 'Event');
        this.setNextStatement(true, 'Event');
        this.setColour(180);
      }
    };
  }

  if (!Blockly.Blocks['fp_set_var']) {
    Blockly.Blocks['fp_set_var'] = {
      init() {
        this.appendDummyInput()
          .appendField('📊 set')
          .appendField(new Blockly.FieldDropdown(FP_VARIABLES.map(v => [v, v])), 'NAME')
          .appendField('to')
          .appendField(new Blockly.FieldNumber(0), 'VALUE');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(65);
      }
    };
  }

  if (!Blockly.Blocks['fp_change_var']) {
    Blockly.Blocks['fp_change_var'] = {
      init() {
        this.appendDummyInput()
          .appendField('📈 change')
          .appendField(new Blockly.FieldDropdown(FP_VARIABLES.map(v => [v, v])), 'NAME')
          .appendField('by')
          .appendField(new Blockly.FieldNumber(1), 'VALUE');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(65);
      }
    };
  }

  if (!Blockly.Blocks['fp_win']) {
    Blockly.Blocks['fp_win'] = {
      init() {
        this.appendDummyInput().appendField('🏁 WIN the story');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(140);
      }
    };
  }

  if (!Blockly.Blocks['fp_lose']) {
    Blockly.Blocks['fp_lose'] = {
      init() {
        this.appendDummyInput().appendField('💥 LOSE the story');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(15);
      }
    };
  }

  // Touch/collision event block
  if (!Blockly.Blocks['fp_when_touch']) {
    Blockly.Blocks['fp_when_touch'] = {
      init() {
        this.appendStatementInput('DO')
          .setCheck('Action')
          .appendField('👥 when')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE_A')
          .appendField('touches')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE_B');
        this.setPreviousStatement(true, 'Event');
        this.setNextStatement(true, 'Event');
        this.setColour(30);
        this.setTooltip('Runs actions when two sprites overlap on stage. Make sure both sprites are created first!');
      }
    };
  }

  // Hide/disappear action block
  if (!Blockly.Blocks['fp_hide_sprite']) {
    Blockly.Blocks['fp_hide_sprite'] = {
      init() {
        this.appendDummyInput()
          .appendField('👻 hide')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(180);
        this.setTooltip('Makes a sprite disappear from the stage.');
      }
    };
  }

  // Random position block
  if (!Blockly.Blocks['fp_random_pos']) {
    Blockly.Blocks['fp_random_pos'] = {
      init() {
        this.appendDummyInput()
          .appendField('🎲 teleport')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE')
          .appendField('to random spot');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(65);
        this.setTooltip('Moves the sprite to a surprise location on stage!');
      }
    };
  }

  // ── Sprite-aware blocks (registered BEFORE seRegisterActionBlocks so the
  //    shared guard does not overwrite them with the sprite-less versions) ──

  // Create sprite — spawns a sprite on stage with a chosen costume
  if (!Blockly.Blocks['fp_new_sprite']) {
    Blockly.Blocks['fp_new_sprite'] = {
      init() {
        this.appendDummyInput()
          .appendField('🆕 create')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE')
          .appendField('as')
          .appendField(new Blockly.FieldDropdown(SE_COSTUMES.map((c, i) => [c, String(i)])), 'COSTUME');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(180);
        this.setTooltip('Puts a new character on stage. Use this before move or say blocks for that sprite.');
      }
    };
  }

  // Move block — with sprite selector
  if (!Blockly.Blocks['fp_move']) {
    Blockly.Blocks['fp_move'] = {
      init() {
        this.appendDummyInput()
          .appendField('🏃')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE')
          .appendField(new Blockly.FieldDropdown(SE_MOVE_OPTIONS), 'ACTION');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(230);
      }
    };
  }

  // Say block — with sprite selector and free-text input
  if (!Blockly.Blocks['fp_say']) {
    Blockly.Blocks['fp_say'] = {
      init() {
        this.appendDummyInput()
          .appendField('💬')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE')
          .appendField('says')
          .appendField(new Blockly.FieldTextInput('Hello!'), 'MSG');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(300);
        this.setTooltip('Type anything you want the sprite to say!');
      }
    };
  }

  // Costume block — with sprite selector
  if (!Blockly.Blocks['fp_costume']) {
    Blockly.Blocks['fp_costume'] = {
      init() {
        this.appendDummyInput()
          .appendField('👗')
          .appendField(new Blockly.FieldDropdown(FP_SPRITE_OPTIONS), 'SPRITE')
          .appendField('change costume to')
          .appendField(new Blockly.FieldDropdown(SE_COSTUMES.map((c, i) => [c, String(i)])), 'IDX');
        this.setPreviousStatement(true, 'Action');
        this.setNextStatement(true, 'Action');
        this.setColour(60);
      }
    };
  }

  // Register remaining shared blocks (background, sound, when_key, etc.)
  // The sprite-aware ones above will not be overwritten due to the if-guards inside.
  seRegisterActionBlocks('fp_');
}

function buildFPToolbox() {
  return `<xml xmlns="https://developers.google.com/blockly/xml">
    <category name="🚀 Start" colour="#7ec8e3">
      <block type="fp_when_start"></block>
      ${SE_ALL_KEYS.map(k=>`<block type="fp_when_key"><field name="KEY">${k}</field></block>`).join('')}
      <block type="fp_when_touch">
        <field name="SPRITE_A">0</field>
        <field name="SPRITE_B">1</field>
      </block>
    </category>
    <category name="🎭 Story" colour="#e94560">
      <block type="fp_new_sprite"><field name="SPRITE">0</field><field name="COSTUME">0</field></block>
      <block type="fp_say"><field name="SPRITE">0</field><field name="MSG">Hello!</field></block>
      <block type="fp_costume"><field name="SPRITE">0</field></block>
      <block type="fp_background"></block>
    </category>
    <category name="📊 Score" colour="#f1c40f">
      <block type="fp_set_var"></block>
      <block type="fp_change_var"></block>
      <block type="fp_win"></block>
      <block type="fp_lose"></block>
    </category>
    <category name="🏃 Actions" colour="#9b59b6">
      <block type="fp_move"><field name="SPRITE">0</field><field name="ACTION">move_left</field></block>
      <block type="fp_move"><field name="SPRITE">0</field><field name="ACTION">move_right</field></block>
      <block type="fp_move"><field name="SPRITE">0</field><field name="ACTION">jump</field></block>
      <block type="fp_move"><field name="SPRITE">0</field><field name="ACTION">spin</field></block>
      <block type="fp_hide_sprite"><field name="SPRITE">0</field></block>
      <block type="fp_random_pos"><field name="SPRITE">0</field></block>
    </category>
    <category name="🔁 Loops" colour="#2ecc71">
      <block type="fp_repeat"><field name="TIMES">3</field></block>
    </category>
    <category name="🚦 Conditions" colour="#3498db">
      <block type="fp_if_score"></block>
    </category>
    <category name="🔊 Sound" colour="#e74c3c"><block type="fp_sound"></block></category>
  </xml>`;
}

/* Ensures the 4 sprite slots exist inside fp-stage-screen regardless of
   what is in the HTML — creates them dynamically if missing. */
function ensureFPSprites() {
  const screen = document.getElementById('fp-stage-screen');
  if (!screen) return;

  // Hide the old single-character div if it is still there
  const legacy = document.getElementById('fp-stage-character');
  if (legacy) legacy.style.display = 'none';

  const defaultX = [20, 40, 60, 80];
  for (let i = 0; i < 4; i++) {
    if (!document.getElementById('fp-sprite-' + i)) {
      const el = document.createElement('div');
      el.id        = 'fp-sprite-' + i;
      el.className = 'fp-sprite';
      el.style.cssText = `position:absolute;bottom:8px;left:${defaultX[i]}%;font-size:28px;transition:all 0.3s;display:none;`;
      screen.appendChild(el);
    }
  }

  // Speech bubble — create if missing
  if (!document.getElementById('fp-stage-speech')) {
    const speech = document.createElement('div');
    speech.id        = 'fp-stage-speech';
    speech.className = 'hidden';
    speech.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);background:rgba(15,20,40,0.92);color:#ffffff;border:2px solid rgba(255,255,255,0.55);border-radius:10px;padding:5px 13px;font-size:13px;font-weight:800;white-space:nowrap;max-width:88%;overflow:hidden;text-overflow:ellipsis;box-shadow:0 3px 12px rgba(0,0,0,0.6);pointer-events:none;z-index:10;';
    screen.appendChild(speech);
  }
}

/* Called by switchActivity when entering Day 5 for the first time */
function setupFPWorkspace() {
  try { if (fpWorkspace) { fpWorkspace.dispose(); fpWorkspace = null; } } catch(e){}
  try { if (typeof workspace !== 'undefined' && workspace) { workspace.dispose(); workspace = null; } } catch(e){}
  try { if (typeof loopWorkspace !== 'undefined' && loopWorkspace) { loopWorkspace.dispose(); loopWorkspace = null; } } catch(e){}
  try { if (typeof ifWorkspace !== 'undefined' && ifWorkspace) { ifWorkspace.dispose(); ifWorkspace = null; } } catch(e){}
  try { if (typeof animWorkspace !== 'undefined' && animWorkspace) { animWorkspace.dispose(); animWorkspace = null; } } catch(e){}

  const missionEl = document.querySelector('.mission');
  if (missionEl) missionEl.textContent = '🌟 Story Engine — Build a mini game';

  ensureFPSprites();
  registerFPBlocks();

  const blocklyDiv = document.getElementById('blocklyDiv');
  if (blocklyDiv) blocklyDiv.innerHTML = '';

  fpWorkspace = Blockly.inject('blocklyDiv', {
    toolbox: buildFPToolbox(),
    scrollbars: true,
    trashcan: true,
    theme: getSandboxTheme(),
    grid: { spacing: 20, length: 3, colour: 'rgba(255,255,255,0.05)', snap: true }
  });

  disableFlyoutAutoClose(fpWorkspace);
  fpWorkspace.addChangeListener(() => {
    const el = document.getElementById('fp-block-count');
    if (el) el.textContent = String(fpWorkspace.getAllBlocks(false).length);
    updateFPStoryPreview();
  });

  renderFPKeys();
  renderFPStage();

  document.getElementById('goal-text').textContent =
    'Create sprites, make them move, speak, and change costumes. Use loops, conditions, and events to build your mini story or game.';
}

function renderFPKeys() {
  const container = document.getElementById('fp-stage-buttons');
  if (!container) return;
  container.innerHTML = '';
  SE_ALL_KEYS.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    btn.dataset.key = key;
    btn.textContent = { LEFT:'◀', RIGHT:'▶', UP:'▲', DOWN:'▼', SPACE:'⎵' }[key];
    btn.addEventListener('click', () => fpPressKey(key));
    container.appendChild(btn);
  });
}

function renderFPStage() {
  fpState.sprites.forEach((sp, i) => {
    const el = document.getElementById('fp-sprite-' + i);
    const lbl = document.querySelector(`.fp-sprite-label[data-idx="${i}"]`);
    if (!el) return;
    if (sp.visible) {
      el.textContent = SE_COSTUMES[sp.costume] || '🧒';
      el.style.left  = sp.x + '%';
      el.style.transform = sp.y ? `translateY(${sp.y}px)` : '';
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
    if (lbl) lbl.style.display = sp.visible ? '' : 'none';
  });

  const screen = document.getElementById('fp-stage-screen');
  const bgLbl  = document.getElementById('fp-bg-label');
  if (screen) screen.className = 'stage-screen ' + SE_BACKGROUNDS[fpState.bgIndex].cls;
  if (bgLbl)  bgLbl.textContent = SE_BACKGROUNDS[fpState.bgIndex].name;

  const scoreEl = document.getElementById('fp-score-label');
  if (scoreEl) scoreEl.textContent = `Score: ${fpState.vars?.score ?? 0} · Lives: ${fpState.vars?.lives ?? 3}`;
}

function fpPressKey(key) {
  if (!seIsRunning) { showFeedback('info', 'Press ▶ Run first!'); return; }
  const btn = document.querySelector(`#fp-stage-buttons .key-btn[data-key="${key}"]`);
  if (btn) { btn.classList.add('active'); setTimeout(() => btn.classList.remove('active'), 200); }

  const actions = seEventMap[key];
  if (!actions || !actions.length) {
    fpLog(`🔘 ${key} — no rule`);
    return;
  }
  seRunActionSequence(actions, key, fpExecute);
}

function fpCompare(current, op, value) {
  if (op === '>=') return current >= value;
  if (op === '<=') return current <= value;
  if (op === '==') return current === value;
  if (op === '>')  return current > value;
  if (op === '<')  return current < value;
  return false;
}

/* ── Execute a single FP action on the stage ──
   FIX: every case now returns a Promise so seRunActionSequence
        can properly chain and await nested action sequences.
   FIX: case 'if_score' returns the Promise from seRunActionSequence
        instead of firing it without awaiting (was the core bug).    */
function fpExecute(action, key) {
  const si     = action.spriteIdx ?? 0;
  const sp     = fpState.sprites[si];
  const el     = document.getElementById('fp-sprite-' + si);
  const speech = document.getElementById('fp-stage-speech');
  const screen = document.getElementById('fp-stage-screen');
  const bgLbl  = document.getElementById('fp-bg-label');

  switch (action.type) {

    case 'new_sprite': {
      const costume = parseInt(action.costume ?? '0', 10);
      sp.costume = costume;
      sp.visible = true;
      if (el) {
        el.textContent  = SE_COSTUMES[costume] || '🧒';
        el.style.left   = sp.x + '%';
        el.style.display = '';
      }
      const lbl = document.querySelector(`.fp-sprite-label[data-idx="${si}"]`);
      if (lbl) lbl.style.display = '';
      fpLog(`${key}: sprite ${si + 1} created as ${SE_COSTUMES[costume]}`);
      return Promise.resolve();
    }

    case 'move': {
      if (!sp?.visible) {
        fpLog(`${key}: sprite ${si+1} not on stage yet — use "create sprite" first`);
        return Promise.resolve();
      }
      if (action.value === 'move_left')  sp.x = Math.max(5, sp.x - 12);
      if (action.value === 'move_right') sp.x = Math.min(90, sp.x + 12);
      if (action.value === 'move_up')    sp.y = Math.max(-60, sp.y - 25);
      if (action.value === 'move_down')  sp.y = Math.min(60, sp.y + 25);
      if (action.value === 'jump' && el) {
        const base = sp.y ? `translateY(${sp.y}px) ` : '';
        el.style.transform = `${base}translateY(-30px)`;
        setTimeout(() => { el.style.transform = sp.y ? `translateY(${sp.y}px)` : ''; }, 400);
      }
      if (action.value === 'spin' && el) {
        const base = sp.y ? `translateY(${sp.y}px) ` : '';
        el.style.transform = `${base}rotate(360deg)`;
        setTimeout(() => { el.style.transform = sp.y ? `translateY(${sp.y}px)` : ''; }, 500);
      }
      if (el) {
        el.style.left = sp.x + '%';
        if (['move_left','move_right','move_up','move_down'].includes(action.value)) {
          el.style.transform = sp.y ? `translateY(${sp.y}px)` : '';
        }
      }
      fpLog(`${key}: sprite ${si+1} ${action.value.replace('_',' ')}`);
      return Promise.resolve();
    }

    case 'say': {
      if (speech && el) {
        // Position the bubble horizontally centred on the sprite and
        // vertically just above it, using the sprite's live DOM position.
        const stageEl   = document.getElementById('fp-stage-screen');
        const stageRect = stageEl  ? stageEl.getBoundingClientRect()  : null;
        const sprRect   = el.getBoundingClientRect();

        if (stageRect) {
          // Convert sprite's screen position to a percentage inside the stage
          const centreX = sprRect.left + sprRect.width  / 2 - stageRect.left;
          const topY    = sprRect.top               - stageRect.top;
          speech.style.left      = centreX + 'px';
          speech.style.transform = 'translateX(-50%)';
          // Place the bubble 6px above the top edge of the sprite
          speech.style.top    = (topY - 34) + 'px';
          speech.style.bottom = 'auto';
        } else {
          // Fallback: use stored x% if we can't measure the DOM
          speech.style.left      = sp.x + '%';
          speech.style.transform = 'translateX(-50%)';
          speech.style.top       = 'auto';
          speech.style.bottom    = '72px';
        }

        speech.textContent = action.value;
        speech.classList.remove('hidden');
        setTimeout(() => speech.classList.add('hidden'), 5000);
      }
      fpLog(`${key}: sprite ${si+1} says "${action.value}"`);
      return Promise.resolve();
    }

    case 'costume': {
      const idx = parseInt(action.value, 10);
      sp.costume = idx;
      if (el) el.textContent = SE_COSTUMES[idx] || '🧒';
      fpLog(`${key}: sprite ${si+1} costume → ${SE_COSTUMES[idx]}`);
      return Promise.resolve();
    }

    case 'background': {
      const idx = parseInt(action.value, 10);
      fpState.bgIndex = idx;
      if (screen) screen.className = 'stage-screen ' + SE_BACKGROUNDS[idx].cls;
      if (bgLbl)  bgLbl.textContent = SE_BACKGROUNDS[idx].name;
      fpLog(`${key}: bg → ${SE_BACKGROUNDS[idx].name}`);
      return Promise.resolve();
    }

    case 'sound': {
      fpLog(`${key}: 🔊 ${action.value}`);
      showFeedback('info', `🔊 Playing ${action.value}!`);
      setTimeout(hideFeedback, 900);
      return Promise.resolve();
    }

    case 'set_var': {
      fpState.vars = fpState.vars || {};
      fpState.vars[action.name || 'score'] = Number(action.value) || 0;
      fpLog(`${key}: set ${action.name || 'score'} = ${fpState.vars[action.name || 'score']}`);
      renderFPStage();
      return Promise.resolve();
    }

    case 'change_var': {
      fpState.vars = fpState.vars || {};
      const name = action.name || 'score';
      fpState.vars[name] = (fpState.vars[name] || 0) + (Number(action.value) || 0);
      fpLog(`${key}: change ${name} by ${action.value}`);
      renderFPStage();
      return Promise.resolve();
    }

    case 'win': {
      fpLog(`${key}: 🏁 WIN!`);
      showFeedback('success', '🏁 You reached the goal!');
      setTimeout(hideFeedback, 1200);
      return Promise.resolve();
    }

    case 'lose': {
      fpLog(`${key}: 💥 LOSE!`);
      showFeedback('error', '💥 Try again!');
      setTimeout(hideFeedback, 1200);
      return Promise.resolve();
    }

    case 'hide_sprite': {
      sp.visible = false;
      if (el) el.style.display = 'none';
      const lbl = document.querySelector(`.fp-sprite-label[data-idx="${si}"]`);
      if (lbl) lbl.style.display = 'none';
      fpLog(`${key}: sprite ${si + 1} disappeared 👻`);
      return Promise.resolve();
    }

    case 'random_pos': {
      if (!sp?.visible) {
        fpLog(`${key}: sprite ${si+1} not on stage yet — use "create sprite" first`);
        return Promise.resolve();
      }
      // Randomise both axes so the sprite can appear anywhere on the stage:
      //   x: 5% – 85% horizontally
      //   y: -80px (near top) to 0px (ground level)
      //   Negative y moves UP because the sprite is bottom-anchored.
      sp.x = Math.floor(Math.random() * 80) + 5;
      sp.y = -(Math.floor(Math.random() * 81));   // 0 to -80 px
      if (el) {
        el.style.left      = sp.x + '%';
        el.style.transform = `translateY(${sp.y}px)`;
      }
      fpLog(`${key}: sprite ${si+1} teleported to x=${sp.x}% y=${sp.y}px 🎲`);
      return Promise.resolve();
    }

    case 'if_score': {
      // FIX: was calling seRunActionSequence without returning its Promise,
      //      so the outer chain never awaited the nested actions.
      //      Now we return the Promise so the chain stays in order.
      fpState.vars = fpState.vars || {};
      const current = fpState.vars[action.name] ?? 0;
      const pass = fpCompare(current, action.op, action.value);
      fpLog(`${key}: if ${action.name} ${action.op} ${action.value} → ${pass ? 'YES ✅' : 'NO ❌'}`);
      if (pass && action.actions && action.actions.length) {
        return seRunActionSequence(action.actions, key, fpExecute);
      }
      return Promise.resolve();
    }

    default:
      return Promise.resolve();
  }
}

/* ── Collision detection loop ──
   Runs every animation frame while the project is running.
   Uses x-position distance (< 10% apart) as the overlap test.
   fpCollisionActive prevents the handler firing hundreds of times
   per second — it pauses while actions run, then re-enables.    */
function fpCheckCollisions() {
  // Stop the loop entirely only when the project itself has stopped running.
  // fpCollisionActive being false should just skip THIS frame's checks —
  // it must NOT stop the loop from scheduling its next frame, or the whole
  // collision system dies after the very first touch.
  if (!seIsRunning) return;

  if (fpCollisionActive) {
    const touchEvents = seEventMap['__touches__'] || [];
    touchEvents.forEach(({ spriteA, spriteB, actions }) => {
      if (!actions || !actions.length) return;
      const spA = fpState.sprites[spriteA];
      const spB = fpState.sprites[spriteB];

      if (!spA?.visible || !spB?.visible) return;

      const dist = Math.abs(spA.x - spB.x);
      if (dist < 10) {
        fpCollisionActive = false;
        fpLog(`👥 sprite ${spriteA + 1} touched sprite ${spriteB + 1}!`);
        seRunActionSequence(actions, 'TOUCH', fpExecute)
          .then(() => {
            // Wait until the sprites actually separate before re-arming —
            // otherwise it would re-trigger instantly on the very next frame
            // since they're often still overlapping right after the actions run.
            fpWaitForSeparation(spriteA, spriteB);
          });
      }
    });
  }

  requestAnimationFrame(fpCheckCollisions);
}

/* Re-arms collision detection only once the two sprites are no longer
   overlapping, so a single touch doesn't fire the event dozens of times
   in a row while the sprites happen to still be next to each other. */
function fpWaitForSeparation(spriteA, spriteB) {
  const spA = fpState.sprites[spriteA];
  const spB = fpState.sprites[spriteB];
  const dist = spA && spB ? Math.abs(spA.x - spB.x) : 999;

  if (dist >= 10 || !seIsRunning) {
    fpCollisionActive = true;
    return;
  }
  requestAnimationFrame(() => fpWaitForSeparation(spriteA, spriteB));
}

function fpLog(msg) {
  const log = document.getElementById('fp-event-log');
  if (!log) return;
  const p = document.createElement('p'); p.className = 'new'; p.textContent = msg;
  log.appendChild(p); log.scrollTop = log.scrollHeight;
}

function updateFPStoryPreview() {
  const row = document.getElementById('fp-story-row');
  if (!row || !fpWorkspace) return;
  row.innerHTML = '';

  const count = fpWorkspace.getAllBlocks(false).length;
  if (!count) {
    const tip = document.createElement('span');
    tip.style.cssText = 'font-size:10px;color:#aaa;font-weight:700';
    tip.textContent = 'Start with "create sprite", then add move and say blocks.';
    row.appendChild(tip);
    return;
  }

  const chips = ['🆕', '🏃', '💬', '🔁', '🚦', '🔊', '👥', '👻', '🎲'];
  chips.slice(0, Math.min(count, chips.length)).forEach(icon => {
    const chip = document.createElement('span');
    chip.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:999px;background:#0f3460;color:#fff;font-size:10px;font-weight:800;border:1px solid rgba(255,255,255,0.08)';
    chip.textContent = icon;
    row.appendChild(chip);
  });

  const total = document.createElement('span');
  total.style.cssText = 'font-size:10px;color:#aaa;font-weight:700';
  total.textContent = `${count} story blocks`;
  row.appendChild(total);
}

function extractFPBricks() {
  if (!fpWorkspace) return [];
  const tops = fpWorkspace.getTopBlocks(true)
    .filter(b => b.type.startsWith('brick_') || b.type === 'fp_repeat');
  const result = [];
  tops.forEach(top => collectFPBricks(top, result));
  return result.reverse();
}

function collectFPBricks(block, out) {
  if (!block) return;
  if (block.type.startsWith('brick_')) {
    out.push(block.type.replace('brick_', ''));
  } else if (block.type === 'fp_repeat') {
    const times = Number(block.getFieldValue('TIMES')) || 1;
    const inner = [];
    let ib = block.getInputTargetBlock('DO');
    while (ib) { if (ib.type.startsWith('brick_')) inner.push(ib.type.replace('brick_','')); ib = ib.getNextBlock(); }
    for (let i = 0; i < times; i++) inner.forEach(c => out.push(c));
  }
  collectFPBricks(block.getNextBlock(), out);
}

function runFP() {
  seEventMap  = seCompileEvents(fpWorkspace, 'fp_');
  seIsRunning = true;

  // Start collision detection loop
  fpCollisionActive = true;
  fpCheckCollisions();

  const ec = Object.keys(seEventMap).filter(k => k !== '__touches__').length;
  if (seEventMap.START) {
    seRunActionSequence(seEventMap.START, 'START', fpExecute);
  }
  let msg = '';
  if (ec) msg += `⚡ ${ec} event${ec !== 1 ? 's' : ''} ready. `;
  const touchCount = (seEventMap['__touches__'] || []).length;
  if (touchCount) msg += `👥 ${touchCount} touch rule${touchCount !== 1 ? 's' : ''} active. `;
  msg += 'Click the stage buttons to animate!';
  showFeedback('success', msg);
  fpLog('▶ Running');
}

function clearFP() {
  // Stop collision detection
  fpCollisionActive = false;

  if (fpWorkspace) fpWorkspace.clear();
  seResetState();
  fpState = fpDefaultState();
  renderFPStage();
  const log = document.getElementById('fp-event-log');
  if (log) log.innerHTML = '<p>Press Run then use the buttons!</p>';
  hideFeedback();
  const el = document.getElementById('fp-block-count');
  if (el) el.textContent = '0';
  updateFPStoryPreview();
}