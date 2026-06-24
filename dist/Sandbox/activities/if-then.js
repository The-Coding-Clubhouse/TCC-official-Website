/* ──────────────────────────────────────────────────────────
   Day 3: If-Then Builder Activity
   ────────────────────────────────────────────────────────── */

const IF_LEVELS = [
  {
    title: "Click a traffic light color and check what happens.",
    goal: "Green means go, Red means stop. Watch the Blockly workspace for clues!",
    successMsg: "You made your first condition! If color is green, then go.",
    colors: ['red','green','blue']
  },
  {
    title: "Make TWO conditions: if red → stop, if green → go",
    goal: "Build with 2 separate if-then blocks in Blockly.",
    successMsg: "Two conditions working! You're thinking like a programmer.",
    colors: ['red','green','blue']
  },
  {
    title: "Add a third: if blue → caution (slow)",
    goal: "Now handle all three colors: red=stop, green=go, blue=caution.",
    successMsg: "All three colors handled! You mastered if-then logic.",
    colors: ['red','green','blue']
  },
  {
    title: "Free builder: Create any condition logic you want!",
    goal: "Invent your own if-then rules with the traffic light.",
    successMsg: "You're a programmer! You can create any logic now.",
    colors: ['red','green','blue']
  }
];

let ifCompleted = new Set();
let ifWorkspace = null;
let ifRules = {};

function buildIfToolbox(colors) {
  return `<xml xmlns="https://developers.google.com/blockly/xml">
    <category name="🚦 IF Rules" colour="#3498db">
      <block type="if_light_rule"></block>
    </category>
  </xml>`;
}

function registerIfBlocks(colors) {
  if (Blockly.Blocks['if_light_rule']) return;

  Blockly.Blocks['if_light_rule'] = {
    init() {
      this.appendDummyInput()
        .appendField('🚦 IF light is')
        .appendField(new Blockly.FieldDropdown(colors.map(c => [c.toUpperCase(), c])), 'COLOR')
        .appendField('→')
        .appendField(new Blockly.FieldDropdown(Object.keys(SE_REACTIONS).map(r => [r, r])), 'REACTION');
      this.setPreviousStatement(true, 'Rule');
      this.setNextStatement(true, 'Rule');
      this.setColour(200);
      this.setTooltip('Define what happens when a traffic light color is clicked.');
    }
  };
}

function loadIfLevel(idx) {
  currentLevel = idx;
  const lvl = IF_LEVELS[idx];

  document.querySelectorAll('.levels .level-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  const titleEl = document.getElementById('if-title');
  const goalEl = document.getElementById('if-goal');
  const sharedGoalEl = document.getElementById('goal-text');
  if (titleEl) titleEl.textContent = lvl.title;
  if (goalEl) goalEl.textContent = lvl.goal;
  if (sharedGoalEl) sharedGoalEl.textContent = lvl.goal;

  // Update main mission label with level-specific info
  const missionEl = document.querySelector('.mission');
  if (missionEl) missionEl.textContent = `🚦 If-Then Builder — ${lvl.title}`;

  if (typeof updateLevelButtons === 'function') updateLevelButtons();

  registerIfBlocks(lvl.colors);

  const blocklyDiv = document.getElementById('blocklyDiv');
  if (blocklyDiv) blocklyDiv.innerHTML = '';

  try { if (ifWorkspace) ifWorkspace.dispose(); } catch (e) {}
  try { if (window.workspace) window.workspace.dispose(); } catch (e) {}
  try { if (typeof loopWorkspace !== 'undefined' && loopWorkspace) loopWorkspace.dispose(); } catch (e) {}
  try { if (typeof animWorkspace !== 'undefined' && animWorkspace) animWorkspace.dispose(); } catch (e) {}
  try { if (typeof fpWorkspace !== 'undefined' && fpWorkspace) fpWorkspace.dispose(); } catch (e) {}

  ifWorkspace = Blockly.inject('blocklyDiv', {
    toolbox: buildIfToolbox(lvl.colors),
    scrollbars: true,
    trashcan: true,
    theme: getSandboxTheme(),
    grid: { spacing: 20, length: 3, colour: 'rgba(255,255,255,0.05)', snap: true }
  });

  disableFlyoutAutoClose(ifWorkspace);
  ifWorkspace.addChangeListener(() => {
    const counter = document.getElementById('if-block-count');
    if (counter) counter.textContent = String(ifWorkspace.getAllBlocks(false).length);
  });

  ifRules = {};
  seResetReactionScreen();
  renderTrafficLight();
}

function setTrafficLightState(selectedColor) {
  const bulbs = document.querySelectorAll('#traffic-light .bulb');
  bulbs.forEach(b => {
    if (selectedColor && b.dataset.color === selectedColor) {
      b.classList.add('on');
    } else {
      b.classList.remove('on');
    }
  });
}

function setTrafficLightLocked(isLocked) {
  const bulbs = document.querySelectorAll('#traffic-light .bulb');
  bulbs.forEach(b => {
    b.classList.toggle('locked', isLocked);
  });
}

function renderTrafficLight() {
  const container = document.getElementById('traffic-light');
  if (!container) return;

  const lvl = IF_LEVELS[currentLevel] || { colors: ['red','green','blue'] };
  container.innerHTML = '';

  lvl.colors.forEach(color => {
    const bulb = document.createElement('div');
    bulb.className = 'bulb locked';
    bulb.dataset.color = color;
    bulb.title = `${color.toUpperCase()}`;
    bulb.addEventListener('click', () => {
      if (!seIsRunning) {
        showFeedback('info', 'Press ▶ Run first to activate your code.');
        return;
      }
      setTrafficLightState(color);
      testLight(color);
    });
    container.appendChild(bulb);
  });

  setTrafficLightState(null);
  setTrafficLightLocked(true);
}

function runIfCode() {
  if (!ifWorkspace) {
    showFeedback('error', 'If-Then workspace not loaded.');
    return;
  }

  ifRules = seCompileRules(ifWorkspace, 'if_light_rule');
  if (Object.keys(ifRules).length === 0) {
    showFeedback('info', 'Add at least one IF rule block before running.');
    return;
  }

  seResetReactionScreen();
  seIsRunning = true;
  setTrafficLightLocked(false);
  showFeedback('success', 'If-Then rules are active. Test a light color now.');
}

function testLight(color) {
  if (!ifWorkspace) {
    showFeedback('error', 'If-Then workspace not loaded.');
    return false;
  }

  if (!seIsRunning) {
    showFeedback('info', 'Press Run first to activate your code.');
    return false;
  }

  const selectedRule = ifRules[color];
  if (!selectedRule) {
    seShowReaction('❓', 'Nothing happens', `No rule for ${color.toUpperCase()}. Add one and press Run again.`, '#aaaaaa');
    return false;
  }

  const reaction = SE_REACTIONS[selectedRule] || { emoji: '⚡', label: selectedRule, color: '#ffffff' };
  seShowReaction(reaction.emoji, reaction.label, `Rule fired: IF ${color.toUpperCase()} → ${selectedRule}`, reaction.color);

  if (!ifCompleted.has(currentLevel)) {
    ifCompleted.add(currentLevel);
    if (typeof updateProgress === 'function') updateProgress();
    const lvl = IF_LEVELS[currentLevel];
    setTimeout(() => showCelebration(currentLevel, lvl), 600);
  }

  return true;
}

function clearIfCode() {
  if (ifWorkspace) {
    ifWorkspace.clear();
  }
  ifRules = {};
  seIsRunning = false;
  seResetReactionScreen();
  hideFeedback();
  const counter = document.getElementById('if-block-count');
  if (counter) counter.textContent = '0';
}
