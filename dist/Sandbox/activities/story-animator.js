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
let animCompleted = new Set();
let testedKeys = new Set();

function loadAnimLevel(idx) {
  currentLevel = idx;
  const lvl = ANIM_LEVELS[idx];

  document.querySelectorAll('.levels .level-btn').forEach((b, i) =>
    b.classList.toggle('active', i === idx));
  
  // Update main mission label with level-specific info
  const missionEl = document.querySelector('.mission');
  if (missionEl) missionEl.textContent = `🎬 Story Animator — Level ${idx + 1}`;
  
  document.getElementById('goal-text').textContent = lvl.goal;
  hideFeedback();

  seResetState();
  seRenderStage();
  seRenderKeys(lvl.keys);
  seClearLog('Press Run then click a button to animate!');

  seRegisterActionBlocks('anim_');
  
  // ┌─ CRITICAL: Clear blocklyDiv before injecting new workspace ─┐
  const blocklyDiv = document.getElementById('blocklyDiv');
  if (blocklyDiv) blocklyDiv.innerHTML = '';
  
  // Dispose other activities' workspaces to avoid multiple workspaces sharing #blocklyDiv
  try { if (animWorkspace) { animWorkspace.dispose(); animWorkspace = null; } } catch(e){}
  try { if (typeof workspace !== 'undefined' && workspace) { workspace.dispose(); workspace = null; } } catch(e){}
  try { if (typeof loopWorkspace !== 'undefined' && loopWorkspace) { loopWorkspace.dispose(); loopWorkspace = null; } } catch(e){}
  try { if (typeof ifWorkspace !== 'undefined' && ifWorkspace) { ifWorkspace.dispose(); ifWorkspace = null; } } catch(e){}
  try { if (typeof fpWorkspace !== 'undefined' && fpWorkspace) { fpWorkspace.dispose(); fpWorkspace = null; } } catch(e){}

  animWorkspace = Blockly.inject('blocklyDiv', {
    toolbox: buildAnimToolbox(lvl.keys),
    scrollbars: true, trashcan: true,
    theme: getSandboxTheme(),
    grid: { spacing: 20, length: 3, colour: 'rgba(255,255,255,0.05)', snap: true }
  });

  disableFlyoutAutoClose(animWorkspace);
  animWorkspace.addChangeListener(() => {
    const el = document.getElementById('anim-block-count');
    if (el) el.textContent = String(animWorkspace.getAllBlocks(false).length);
    // reset tested keys and hide next button when workspace changes
    testedKeys.clear();
    const btn = document.getElementById('anim-next-btn');
    if (btn) btn.style.display = 'none';
  });

  // create Next Level button (hidden) in the ws-toolbar so users can advance after testing
  try {
    const toolbar = document.querySelector('#panel-anim .ws-toolbar');
    if (toolbar && !document.getElementById('anim-next-btn')) {
      const nb = document.createElement('button');
      nb.id = 'anim-next-btn';
      nb.className = 'btn btn-run';
      nb.textContent = 'Next Level →';
      nb.style.display = 'none';
      nb.style.marginLeft = '8px';
      nb.onclick = () => nextLevel();
      toolbar.appendChild(nb);
    }
    const existingBtn = document.getElementById('anim-next-btn');
    if (existingBtn) existingBtn.style.display = 'none';
  } catch(e) {}

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
  // reset tested keys when running so user must test after code changes
  testedKeys.clear();
  const btn = document.getElementById('anim-next-btn');
  if (btn) btn.style.display = 'none';

  seIsRunning = true;
  showFeedback('success', `✅ ${count} event${count !== 1 ? 's' : ''} programmed! Click the buttons to test.`);
  seLog(`▶ Running — ${count} event(s) active`);
}

function seOnKeyFired(key) {
  if (currentActivity !== 'anim') return;
  const lvl = ANIM_LEVELS[currentLevel];
  // if no event defined for this key, nothing to test
  if (!seEventMap[key]) return;
  // mark this key as tested
  testedKeys.add(key);

  // If user has tested all required keys and all have event handlers, show next button
  const allHaveHandler = lvl.keys.every(k => seEventMap[k]);
  const allTested = lvl.keys.every(k => testedKeys.has(k));
  if (allHaveHandler && allTested && !animCompleted.has(currentLevel)) {
    animCompleted.add(currentLevel);
    updateProgress();
    // show Next Level button and celebration; do NOT auto-advance immediately
    const btn = document.getElementById('anim-next-btn');
    if (btn) btn.style.display = 'inline-block';
    setTimeout(() => {
      showCelebration(currentLevel, lvl);
      // do NOT call nextLevel() automatically so user can test manually
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