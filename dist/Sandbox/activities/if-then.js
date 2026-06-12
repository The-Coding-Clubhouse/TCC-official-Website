/* ============================================================
   if-then.js — Day 3: Traffic Light If-Then Builder
   Depends on: sandbox.js, stage-engine.js
   Runs inside lego.html (no DOMContentLoaded init)
   ============================================================ */

const IF_LEVELS = [
  {
    goal: 'Code ONE rule: IF red → STOP. Then click the red light to test it. Other lights have no rule yet.',
    bulbs: ['red', 'yellow', 'green'], activeBulbs: ['red'],
    reactions: ['STOP', 'SLOW DOWN', 'GO', 'HONK'], maxRules: 1,
    successMsg: 'Great! You coded your first IF rule. The other lights do nothing — no rule exists for them yet!',
  },
  {
    goal: 'Code TWO rules: IF red → STOP and IF green → GO. Test both lights. The computer picks the right reaction automatically!',
    bulbs: ['red', 'yellow', 'green'], activeBulbs: ['red', 'green'],
    reactions: ['STOP', 'SLOW DOWN', 'GO', 'HONK', 'DANCE'], maxRules: 2,
    successMsg: 'Two rules working perfectly! The computer checks each condition and picks the right one.',
  },
  {
    goal: 'Code ALL THREE lights. Every colour has a rule — full traffic light logic!',
    bulbs: ['red', 'yellow', 'green'], activeBulbs: ['red', 'yellow', 'green'],
    reactions: ['STOP', 'SLOW DOWN', 'GO', 'HONK', 'DANCE', 'FREEZE'], maxRules: 3,
    successMsg: "Full traffic light! You coded all three conditions. That's a complete IF-THEN system!",
  },
  {
    goal: 'FREE MODE — 5 lights including orange and pink! Invent your own funny reactions. IF pink → DANCE, IF orange → SPIN… you decide!',
    bulbs: ['red', 'yellow', 'green', 'orange', 'pink'],
    activeBulbs: ['red', 'yellow', 'green', 'orange', 'pink'],
    reactions: ['STOP', 'SLOW DOWN', 'GO', 'HONK', 'DANCE', 'FREEZE', 'SPIN', 'WAVE'], maxRules: 5,
    successMsg: "Amazing! You invented your own rule system. That's exactly what programmers do!",
  }
];

let ifWorkspace = null;
let compiledRules = {};
let testedLights = new Set();

function registerIfBlocks(colors, reactions) {
  Blockly.Blocks['if_light_rule'] = {
    init() {
      this.appendDummyInput()
        .appendField('IF light is')
        .appendField(new Blockly.FieldDropdown(colors.map(c => [c.toUpperCase(), c])), 'COLOR')
        .appendField('→')
        .appendField(new Blockly.FieldDropdown(reactions.map(r => [r, r])), 'REACTION');
      this.setPreviousStatement(true, 'Rule');
      this.setNextStatement(true, 'Rule');
      this.setColour(200);
    }
  };
}

function loadIfLevel(idx) {
  currentLevel = idx;
  const lvl = IF_LEVELS[idx];

  document.querySelectorAll('.levels .level-btn').forEach((b, i) =>
    b.classList.toggle('active', i === idx));
  document.getElementById('goal-text').textContent = lvl.goal;
  hideFeedback();

  compiledRules = {};
  testedLights.clear();
  seResetReactionScreen();
  renderBulbs(lvl.bulbs, lvl.activeBulbs);
  registerIfBlocks(lvl.bulbs, lvl.reactions);

  try { if (ifWorkspace) { ifWorkspace.dispose(); ifWorkspace = null; } } catch(e){}
  try { if (typeof workspace !== 'undefined' && workspace) { workspace.dispose(); workspace = null; } } catch(e){}
  try { if (typeof loopWorkspace !== 'undefined' && loopWorkspace) { loopWorkspace.dispose(); loopWorkspace = null; } } catch(e){}
  try { if (typeof animWorkspace !== 'undefined' && animWorkspace) { animWorkspace.dispose(); animWorkspace = null; } } catch(e){}
  try { if (typeof fpWorkspace !== 'undefined' && fpWorkspace) { fpWorkspace.dispose(); fpWorkspace = null; } } catch(e){}

  ifWorkspace = Blockly.inject('blocklyDiv', {
    toolbox: `<xml xmlns="https://developers.google.com/blockly/xml">
      <category name="🚦 Rules" colour="#e94560">
        <block type="if_light_rule"></block>
      </category></xml>`,
    maxBlocks: lvl.maxRules,
    scrollbars: true, trashcan: true,
    grid: { spacing: 20, length: 3, colour: 'rgba(255,255,255,0.05)', snap: true }
  });

  disableFlyoutAutoClose(ifWorkspace);
  ifWorkspace.addChangeListener(() => {
    const el = document.getElementById('if-block-count');
    if (el) el.textContent = String(ifWorkspace.getAllBlocks(false).length);
  });

  try {
    const toolbar = document.querySelector('#panel-ifthen .ws-toolbar');
    if (toolbar && !document.getElementById('if-next-btn')) {
      const nb = document.createElement('button');
      nb.id = 'if-next-btn';
      nb.className = 'btn btn-run';
      nb.textContent = 'Next Level →';
      nb.style.display = 'none';
      nb.style.marginLeft = '8px';
      nb.onclick = () => nextLevel();
      toolbar.appendChild(nb);
    }
    const existingBtn = document.getElementById('if-next-btn');
    if (existingBtn) existingBtn.style.display = 'none';
  } catch(e) {}

  updateProgress();
}

function renderBulbs(bulbs, activeBulbs) {
  const housing = document.getElementById('traffic-light');
  if (!housing) return;
  housing.innerHTML = '';
  bulbs.forEach(color => {
    const bulb = document.createElement('div');
    bulb.className = 'bulb off';
    bulb.dataset.color = color;
    if (!activeBulbs.includes(color)) {
      bulb.classList.add('locked');
    } else {
      bulb.addEventListener('click', () => testLight(color));
    }
    housing.appendChild(bulb);
  });
}

function runIfCode() {
  compiledRules = seCompileRules(ifWorkspace, 'if_light_rule');
  const count = Object.keys(compiledRules).length;
  const lvl = IF_LEVELS[currentLevel];

  if (count === 0) {
    showFeedback('info', 'No rules yet! Drag an "IF light is" block into the workspace.');
    return;
  }

  document.getElementById('traffic-light')
    .querySelectorAll('.bulb:not(.locked)')
    .forEach(b => { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 300); });

  showFeedback('success', `✅ ${count} rule${count !== 1 ? 's' : ''} loaded! Now click a light to test.`);
}

function testLight(color) {
  const bulb = document.querySelector(`.bulb[data-color="${color}"]`);
  if (bulb) { bulb.classList.add('on'); setTimeout(() => bulb.classList.remove('on'), 600); }

  const reaction = compiledRules[color];
  if (!reaction) {
    seShowReaction('❓', `No rule for ${color.toUpperCase()}`, 'The computer does nothing — no rule exists!', '#7ec8e3');
    showFeedback('info', `💡 No rule for ${color.toUpperCase()} — the computer does nothing. This is what FALSE looks like!`);
    return;
  }

  const r = SE_REACTIONS[reaction] || { emoji: '⚡', label: reaction, color: '#fff' };
  seShowReaction(r.emoji, r.label, `Rule fired: IF ${color.toUpperCase()} → ${reaction}`, r.color);
  hideFeedback();

  try {
    const lvl = IF_LEVELS[currentLevel];
    if (lvl.activeBulbs.includes(color) && compiledRules[color]) {
      testedLights.add(color);
    }
    const testedAll = lvl.activeBulbs.every(c => testedLights.has(c));
    const allHaveRule = lvl.activeBulbs.every(c => compiledRules[c]);
    if (testedAll && allHaveRule && !completedLevels.has(currentLevel)) {
      completedLevels.add(currentLevel);
      updateProgress();
      setTimeout(() => {
        showCelebration(currentLevel, lvl);
        setTimeout(() => nextLevel(), 1800);
      }, 800);
      const btn = document.getElementById('if-next-btn');
      if (btn) btn.style.display = 'inline-block';
    }
  } catch (e) {}
}

function clearIfCode() {
  if (ifWorkspace) ifWorkspace.clear();
  compiledRules = {};
  seResetReactionScreen();
  hideFeedback();
  const el = document.getElementById('if-block-count');
  if (el) el.textContent = '0';
}