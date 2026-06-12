/* ============================================================
   final-project.js — Day 5: Free Sandbox (all blocks)
   Depends on: sandbox.js, stage-engine.js
   Runs inside lego.html — exposes setupFPWorkspace()
   ============================================================ */

const FP_COLORS = ['red','blue','yellow','green','orange','purple','pink','white'];
const FP_COLOR_HEX = {
  red:'#e74c3c', blue:'#3498db', yellow:'#f1c40f', green:'#2ecc71',
  orange:'#e67e22', purple:'#9b59b6', pink:'#ff69b4', white:'#ecf0f1'
};

let fpWorkspace = null;
// Day 5 uses its own stage elements (fp- prefixed IDs) so it doesn't
// clash with Day 4's stage when both panels exist in the DOM.
let fpState = { charX: 50, costume: 0, bgIndex: 0 };

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
        { type:'input_statement', name:'DO', check:'Brick' }
      ],
      previousStatement: null, nextStatement: null, colour: 120
    }]);
  }

  if (!Blockly.Blocks['fp_if_light']) {
    Blockly.Blocks['fp_if_light'] = {
      init() {
        this.appendDummyInput()
          .appendField('🚦 IF light is')
          .appendField(new Blockly.FieldDropdown(
            ['red','yellow','green','orange','pink'].map(c => [c.toUpperCase(), c])
          ), 'COLOR')
          .appendField('→')
          .appendField(new Blockly.FieldDropdown(
            Object.keys(SE_REACTIONS).map(r => [r, r])
          ), 'REACTION');
        this.setPreviousStatement(true, 'Rule');
        this.setNextStatement(true, 'Rule');
        this.setColour(200);
      }
    };
  }

  seRegisterActionBlocks('fp_');
}

function buildFPToolbox() {
  const brickBlocks = FP_COLORS.map(c => `<block type="brick_${c}"></block>`).join('');
  return `<xml xmlns="https://developers.google.com/blockly/xml">
    <category name="🧱 Bricks" colour="#e94560">${brickBlocks}</category>
    <category name="🔁 Loops" colour="#2ecc71">
      <block type="fp_repeat"><field name="TIMES">3</field></block>
    </category>
    <category name="🚦 IF Rules" colour="#3498db">
      <block type="fp_if_light"></block>
    </category>
    <category name="⚡ Events" colour="#7ec8e3">
      ${SE_ALL_KEYS.map(k=>`<block type="fp_when_key"><field name="KEY">${k}</field></block>`).join('')}
    </category>
    <category name="🏃 Move" colour="#9b59b6">
      <block type="fp_move"><field name="ACTION">move_left</field></block>
      <block type="fp_move"><field name="ACTION">move_right</field></block>
      <block type="fp_move"><field name="ACTION">jump</field></block>
      <block type="fp_move"><field name="ACTION">spin</field></block>
    </category>
    <category name="💬 Speak" colour="#f1c40f"><block type="fp_say"></block></category>
    <category name="👀 Look" colour="#e67e22">
      <block type="fp_costume"></block>
      <block type="fp_background"></block>
    </category>
    <category name="🔊 Sound" colour="#e74c3c"><block type="fp_sound"></block></category>
  </xml>`;
}

/* Called by switchActivity when entering Day 5 for the first time */
function setupFPWorkspace() {
  try { if (fpWorkspace) { fpWorkspace.dispose(); fpWorkspace = null; } } catch(e){}
  try { if (typeof workspace !== 'undefined' && workspace) { workspace.dispose(); workspace = null; } } catch(e){}
  try { if (typeof loopWorkspace !== 'undefined' && loopWorkspace) { loopWorkspace.dispose(); loopWorkspace = null; } } catch(e){}
  try { if (typeof ifWorkspace !== 'undefined' && ifWorkspace) { ifWorkspace.dispose(); ifWorkspace = null; } } catch(e){}
  try { if (typeof animWorkspace !== 'undefined' && animWorkspace) { animWorkspace.dispose(); animWorkspace = null; } } catch(e){}

  fpWorkspace = Blockly.inject('blocklyDiv', {
    toolbox: buildFPToolbox(),
    scrollbars: true, trashcan: true,
    grid: { spacing: 20, length: 3, colour: 'rgba(255,255,255,0.05)', snap: true }
  });

  disableFlyoutAutoClose(fpWorkspace);
  fpWorkspace.addChangeListener(() => {
    const el = document.getElementById('fp-block-count');
    if (el) el.textContent = String(fpWorkspace.getAllBlocks(false).length);
    updateFPBrickPreview();
  });

  // Render key buttons for Day 5's stage (uses fp- prefixed IDs)
  renderFPKeys();
  renderFPStage();

  document.getElementById('goal-text').textContent =
    'All blocks from Days 1–4 are unlocked. Build your own interactive story and present it to the group!';
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
  const char = document.getElementById('fp-stage-character');
  if (char) { char.textContent = SE_COSTUMES[0]; char.style.left = '50%'; char.style.position = 'relative'; }
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
  actions.forEach(a => fpExecute(a, key));
}

function fpExecute(action, key) {
  const char   = document.getElementById('fp-stage-character');
  const speech = document.getElementById('fp-stage-speech');
  const screen = document.getElementById('fp-stage-screen');
  const bgLbl  = document.getElementById('fp-bg-label');

  switch (action.type) {
    case 'move': {
      if (action.value === 'move_left')  { fpState.charX = Math.max(10, fpState.charX - 12); char.style.transform = 'scaleX(-1)'; setTimeout(() => char.style.transform = '', 400); }
      if (action.value === 'move_right') { fpState.charX = Math.min(90, fpState.charX + 12); }
      if (action.value === 'jump')       { char.style.transform = 'translateY(-30px)'; setTimeout(() => char.style.transform = '', 400); }
      if (action.value === 'spin')       { char.style.transform = 'rotate(360deg)'; setTimeout(() => char.style.transform = '', 500); }
      if (char) char.style.left = fpState.charX + '%';
      fpLog(`${key}: ${action.value.replace('_', ' ')}`);
      break;
    }
    case 'say': {
      if (speech) { speech.textContent = action.value; speech.classList.remove('hidden'); setTimeout(() => speech.classList.add('hidden'), 2500); }
      fpLog(`${key}: says "${action.value}"`);
      break;
    }
    case 'costume': {
      const idx = parseInt(action.value, 10); fpState.costume = idx;
      if (char) char.textContent = SE_COSTUMES[idx] || '🧒';
      fpLog(`${key}: costume → ${SE_COSTUMES[idx]}`);
      break;
    }
    case 'background': {
      const idx = parseInt(action.value, 10); fpState.bgIndex = idx;
      if (screen) screen.className = 'stage-screen ' + SE_BACKGROUNDS[idx].cls;
      if (bgLbl) bgLbl.textContent = SE_BACKGROUNDS[idx].name;
      fpLog(`${key}: bg → ${SE_BACKGROUNDS[idx].name}`);
      break;
    }
    case 'sound': {
      fpLog(`${key}: 🔊 ${action.value}`);
      showFeedback('info', `🔊 Playing ${action.value}!`);
      setTimeout(hideFeedback, 900);
      break;
    }
  }
}

function fpLog(msg) {
  const log = document.getElementById('fp-event-log');
  if (!log) return;
  const p = document.createElement('p'); p.className = 'new'; p.textContent = msg;
  log.appendChild(p); log.scrollTop = log.scrollHeight;
}

function updateFPBrickPreview() {
  const row = document.getElementById('fp-brick-row');
  if (!row) return;
  row.innerHTML = '';
  const stack = extractFPBricks();
  stack.slice(-8).forEach(color => {
    const b = document.createElement('div');
    b.className = 'mini-brick';
    b.style.background = FP_COLOR_HEX[color] || '#aaa';
    row.appendChild(b);
  });
  if (stack.length > 8) {
    const s = document.createElement('span');
    s.style.cssText = 'font-size:10px;color:#aaa;font-weight:700';
    s.textContent = `+${stack.length - 8}`;
    row.appendChild(s);
  }
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
  const ec = Object.keys(seEventMap).length;
  const bc = extractFPBricks().length;
  let msg = '';
  if (bc) msg += `🧱 ${bc} bricks. `;
  if (ec) msg += `⚡ ${ec} event${ec !== 1 ? 's' : ''} ready. `;
  msg += 'Click the stage buttons to animate!';
  showFeedback('success', msg);
  fpLog('▶ Running');
}

function clearFP() {
  if (fpWorkspace) fpWorkspace.clear();
  seResetState();
  fpState = { charX: 50, costume: 0, bgIndex: 0 };
  renderFPStage();
  const log = document.getElementById('fp-event-log');
  if (log) log.innerHTML = '<p>Press Run then use the buttons!</p>';
  hideFeedback();
  const el = document.getElementById('fp-block-count');
  if (el) el.textContent = '0';
  updateFPBrickPreview();
}