/* ============================================================
   story-animator.js — Day 4: Story Animator
   Depends on: sandbox.js, stage-engine.js
   Runs inside lego.html (no DOMContentLoaded init)
   ============================================================ */

const ANIM_LEVELS = [
  { goal: 'Code LEFT and RIGHT buttons to move your character across the stage.',
    keys: ['LEFT', 'RIGHT'], successMsg: 'Your character moved! You just coded keyboard events.' },
  { goal: 'Add UP (say something) and DOWN (change costume). Now 4 buttons each do something different!',
    keys: ['LEFT', 'RIGHT', 'UP', 'DOWN'], successMsg: 'Four buttons, four events — you built an interactive character!' },
  { goal: 'Add SPACE to change the background scene. Character + background together tell a story!',
    keys: ['LEFT', 'RIGHT', 'UP', 'DOWN', 'SPACE'], successMsg: "Your stage is alive! That's a full story system!" },
  { goal: 'FREE STORY MODE — all 5 buttons unlocked. Recreate your LEGO storyboard and present it to the group!',
    keys: ['LEFT', 'RIGHT', 'UP', 'DOWN', 'SPACE'], successMsg: 'You told a story with code! The sequence of button presses IS the story.' }
];

let animWorkspace = null;

function loadAnimLevel(idx) {
  currentLevel = idx;
  const lvl = ANIM_LEVELS[idx];

  document.querySelectorAll('.levels .level-btn').forEach((b, i) =>
    b.classList.toggle('active', i === idx));
  document.getElementById('goal-text').textContent = lvl.goal;
  hideFeedback();

  seResetState();
  seRenderStage();
  seRenderKeys(lvl.keys);
  seClearLog('Press Run then click a button to animate!');

  seRegisterActionBlocks('anim_');
  try { if (animWorkspace) { animWorkspace.dispose(); animWorkspace = null; } } catch(e){}
  try { if (typeof workspace !== 'undefined' && workspace) { workspace.dispose(); workspace = null; } } catch(e){}
  try { if (typeof loopWorkspace !== 'undefined' && loopWorkspace) { loopWorkspace.dispose(); loopWorkspace = null; } } catch(e){}
  try { if (typeof ifWorkspace !== 'undefined' && ifWorkspace) { ifWorkspace.dispose(); ifWorkspace = null; } } catch(e){}
  try { if (typeof fpWorkspace !== 'undefined' && fpWorkspace) { fpWorkspace.dispose(); fpWorkspace = null; } } catch(e){}

  animWorkspace = Blockly.inject('blocklyDiv', {
    toolbox: buildAnimToolbox(lvl.keys),
    scrollbars: true, trashcan: true,
    grid: { spacing: 20, length: 3, colour: 'rgba(255,255,255,0.05)', snap: true }
  });

  disableFlyoutAutoClose(animWorkspace);
  animWorkspace.addChangeListener(() => {
    const el = document.getElementById('anim-block-count');
    if (el) el.textContent = String(animWorkspace.getAllBlocks(false).length);
  });

  updateProgress();
}

function buildAnimToolbox(keys) {
  const eventBlocks = keys.map(k =>
    `<block type="anim_when_key"><field name="KEY">${k}</field></block>`).join('');
  return `<xml xmlns="https://developers.google.com/blockly/xml">
    <category name="⚡ Events" colour="#7ec8e3">${eventBlocks}</category>
    <category name="🏃 Move" colour="#3498db">
      <block type="anim_move"><field name="ACTION">move_left</field></block>
      <block type="anim_move"><field name="ACTION">move_right</field></block>
      <block type="anim_move"><field name="ACTION">jump</field></block>
      <block type="anim_move"><field name="ACTION">spin</field></block>
    </category>
    <category name="💬 Speak" colour="#9b59b6"><block type="anim_say"></block></category>
    <category name="👀 Look" colour="#f1c40f">
      <block type="anim_costume"></block>
      <block type="anim_background"></block>
    </category>
    <category name="🔊 Sound" colour="#e94560"><block type="anim_sound"></block></category>
  </xml>`;
}

function runAnimCode() {
  seEventMap = seCompileEvents(animWorkspace, 'anim_');
  const count = Object.keys(seEventMap).length;
  if (count === 0) {
    showFeedback('info', 'No event blocks yet! Drag a "When KEY pressed" block and add actions inside it.');
    seIsRunning = false;
    return;
  }
  seIsRunning = true;
  showFeedback('success', `✅ ${count} event${count !== 1 ? 's' : ''} programmed! Click the buttons to test.`);
  seLog(`▶ Running — ${count} event(s) active`);
}

function seOnKeyFired(key) {
  if (currentActivity !== 'anim') return;
  const lvl = ANIM_LEVELS[currentLevel];
  if (lvl.keys.every(k => seEventMap[k]) && !completedLevels.has(currentLevel)) {
    completedLevels.add(currentLevel);
    updateProgress();
    setTimeout(() => {
      showCelebration(currentLevel, lvl);
      setTimeout(() => nextLevel(), 1800);
    }, 800);
  }
}

function clearAnimCode() {
  if (animWorkspace) animWorkspace.clear();
  seResetState();
  seRenderStage();
  seClearLog('Press Run then click a button to animate!');
  hideFeedback();
  const el = document.getElementById('anim-block-count');
  if (el) el.textContent = '0';
}