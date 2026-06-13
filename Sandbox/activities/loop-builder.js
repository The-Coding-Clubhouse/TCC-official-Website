// Loop Builder activity for Virtual Lego
// Exposes switchActivity('stack'|'loop'), runActivity(), clearActivity()

const LOOP_LEVELS = [
  {
    title: "Level 1 — Repeat pair",
    goal: "Reproduce a 6-brick red-blue pattern. Try using a repeat to be more efficient!",
    target: ['red','blue','red','blue','red','blue'],
    naiveBlocks: 6
  },
  {
    title: "Level 2 — Double pair repeat",
    goal: "An 8-brick green-yellow pattern repeated 4 times.",
    target: Array(4).fill(['green','yellow']).flat(),
    naiveBlocks: 8
  },
  {
    title: "Level 3 — Three-colour loop",
    goal: "A 9-brick 3-colour pattern (red-blue-yellow × 3). Use a repeat wrapping 3 bricks.",
    target: Array(3).fill(['red','blue','yellow']).flat(),
    naiveBlocks: 9
  },
  {
    title: "Level 4 — Free design",
    goal: "Pick any 2 colours and a repeat count, then describe your loop to your group.",
    target: null,
    naiveBlocks: null
  }
];

let loopWorkspace = null;
let currentLoopLevel = 0;
let loopCompleted = new Set();
let currentActivity = 'stack'; // default

function switchActivity(name) {
  currentActivity = name;
  currentLevel = 0; // Reset to first level when switching activities
  
  document.getElementById('activity-stack').classList.toggle('active', name === 'stack');
  document.getElementById('activity-loop').classList.toggle('active', name === 'loop');
  document.getElementById('activity-if').classList.toggle('active', name === 'if');
  document.getElementById('activity-anim').classList.toggle('active', name === 'anim');
  document.getElementById('activity-fp').classList.toggle('active', name === 'fp');

  // ┌─ CRITICAL: Clear Blockly workspace div BEFORE disposing ─┐
  const blocklyDiv = document.getElementById('blocklyDiv');
  if (blocklyDiv) {
    blocklyDiv.innerHTML = '';
  }

  // Dispose all workspaces to avoid conflicts
  try { if (window.workspace) window.workspace.dispose(); } catch(e){}
  try { if (loopWorkspace) loopWorkspace.dispose(); } catch(e){}
  try { if (typeof ifWorkspace !== 'undefined' && ifWorkspace) ifWorkspace.dispose(); } catch(e){}
  try { if (typeof animWorkspace !== 'undefined' && animWorkspace) animWorkspace.dispose(); } catch(e){}
  try { if (typeof fpWorkspace !== 'undefined' && fpWorkspace) fpWorkspace.dispose(); } catch(e){}

  // Hide all panels
  const allPanels = ['panel-stack-loop', 'panel-ifthen', 'panel-anim', 'panel-fp'];
  allPanels.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
    }
  });

  if (name === 'stack') {
    if (typeof loadLevel === 'function') loadLevel(0);
    document.querySelector('.mission').textContent = '🧱 Stack Builder — What Is Coding?';
    const panel = document.getElementById('panel-stack-loop');
    if (panel) {
      panel.style.display = 'block';
    }
  } else if (name === 'loop') {
    document.querySelector('.mission').textContent = '🔁 Loop Builder — Make repetition visible';
    loadLoopLevel(0);
    const panel = document.getElementById('panel-stack-loop');
    if (panel) {
      panel.style.display = 'block';
    }
  } else if (name === 'if') {
    document.querySelector('.mission').textContent = '🚦 If-Then Builder — Logic Rules';
    if (typeof loadIfLevel === 'function') loadIfLevel(0);
    const panel = document.getElementById('panel-ifthen');
    if (panel) {
      panel.style.display = 'block';
    }
  } else if (name === 'anim') {
    document.querySelector('.mission').textContent = '🎬 Story Animator — Interactive Events';
    if (typeof loadAnimLevel === 'function') loadAnimLevel(0);
    const panel = document.getElementById('panel-anim');
    if (panel) {
      panel.style.display = 'block';
    }
  } else if (name === 'fp') {
    document.querySelector('.mission').textContent = '🎨 Free Project — Build Anything!';
    currentLevel = 0;  // Free project has no levels but set for consistency
    if (typeof setupFPWorkspace === 'function') setupFPWorkspace();
    const panel = document.getElementById('panel-fp');
    if (panel) {
      panel.style.display = 'block';
    }
  }
  
  // Update level buttons after panel is shown
  setTimeout(updateLevelButtons, 50);
}

function runActivity() {
  if (currentActivity === 'stack') {
    if (typeof runCode === 'function') runCode();
  } else if (currentActivity === 'loop') {
    loopRun();
  } else if (currentActivity === 'if') {
    if (typeof runIfCode === 'function') runIfCode();
  } else if (currentActivity === 'anim') {
    if (typeof runAnimCode === 'function') runAnimCode();
  } else if (currentActivity === 'fp') {
    if (typeof runFP === 'function') runFP();
  }
}
function clearActivity() {
  if (currentActivity === 'stack') {
    if (typeof clearStack === 'function') clearStack();
  } else if (currentActivity === 'loop') {
    loopClear();
  } else if (currentActivity === 'if') {
    if (typeof clearIfCode === 'function') clearIfCode();
  } else if (currentActivity === 'anim') {
    if (typeof clearAnimCode === 'function') clearAnimCode();
  } else if (currentActivity === 'fp') {
    if (typeof clearFP === 'function') clearFP();
  }
}

/* ── Update level button styling to reflect currentLevel ── */
function updateLevelButtons() {
  const btns = document.querySelectorAll('.levels .level-btn');
  btns.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === currentLevel);
  });
}

// --- Blockly block definitions for loop builder ---
function registerLoopBlocks(colors) {
  if (Blockly.Blocks['place_brick'] && Blockly.Blocks['repeat_block']) return;

  const placeBlock = {
    "type": "place_brick",
    "message0": "place %1 brick",
    "args0": [
      { "type": "field_dropdown", "name": "COLOR", "options": colors.map(c => [c, c]) }
    ],
    "previousStatement": "Brick",
    "nextStatement": "Brick",
    "colour": 230,
    "tooltip": "Place a brick of the chosen colour",
    "helpUrl": ""
  };

  const repeatBlock = {
    "type": "repeat_block",
    "message0": "repeat %1 times %2 do %3",
    "args0": [
      { "type": "field_number", "name": "TIMES", "value": 2, "min": 1, "precision": 1 },
      { "type": "input_dummy" },
      { "type": "input_statement", "name": "DO", "check": "Brick" }
    ],
    "previousStatement": "Brick",
    "nextStatement": "Brick",
    "colour": 120,
    "tooltip": "Repeat the bricks inside",
    "helpUrl": ""
  };

  if (!Blockly.Blocks["place_brick"])  Blockly.defineBlocksWithJsonArray([placeBlock]);
  if (!Blockly.Blocks["repeat_block"]) Blockly.defineBlocksWithJsonArray([repeatBlock]);
}

function buildLoopToolbox(colors) {
  // simple xml toolbox
  const xmlParts = [
    '<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">',
    '  <category name="Loops" colour="#5BA58C">',
    '    <block type="repeat_block"><field name="TIMES">3</field></block>',
    '  </category>',
    '  <category name="Bricks" colour="#D46B6A">',
    '    <block type="place_brick"></block>',
    '  </category>',
    '</xml>'
  ];
  return xmlParts.join('\n');
}

// Rendering uses shared helpers from sandbox.js: renderTargetStack, renderMyStack

// Evaluate a sequence of blocks into a flat array of colours
function evaluateSequenceFromBlock(startBlock) {
  const out = [];
  let b = startBlock;
  while (b) {
    if (b.type === 'place_brick') {
      out.push(b.getFieldValue('COLOR'));
    } else if (b.type === 'repeat_block') {
      const times = Number(b.getFieldValue('TIMES')) || 1;
      const inner = b.getInputTargetBlock('DO');
      const innerSeq = inner ? evaluateSequenceFromBlock(inner) : [];
      for (let t = 0; t < times; t++) out.push(...innerSeq);
    }
    b = b.getNextBlock();
  }
  return out;
}

function evaluateWorkspaceSequence(ws) {
  const top = ws.getTopBlocks(true).filter(b => !b.getPreviousBlock());
  // order top blocks by y position to ensure sequence
  top.sort((a,b) => a.getRelativeToSurfaceXY().y - b.getRelativeToSurfaceXY().y);
  const result = [];
  top.forEach(tb => result.push(...evaluateSequenceFromBlock(tb)));
  // ┌─ CRITICAL: Reverse so index 0 = bottom brick (matching LOOP_LEVELS targets) ─┐
  // Blockly UI shows blocks top-to-bottom, but we need bottom-to-top array order
  return result.reverse();
}

// --- Level loading ---
function loadLoopLevel(idx) {
  currentLevel = idx;  // Use consistent global for all activities
  currentLoopLevel = idx;  // Also keep for backward compatibility
  const lvl = LOOP_LEVELS[idx];
  document.querySelectorAll('.levels .level-btn').forEach((b,i)=> b.classList.toggle('active', i===idx));
  document.getElementById('goal-text').textContent = lvl.goal + '\n\nFacilitator prompt: "Did your loop produce the same stack as placing each brick one by one? So why would a programmer choose the loop?"';

  // show target
  renderTargetStack(lvl.target);

  // setup blocks
  const colors = ['red','blue','yellow','green','orange','purple','pink','white'];
  registerLoopBlocks(colors);

  // ┌─ CRITICAL: Clear blocklyDiv before injecting new workspace ─┐
  const blocklyDiv = document.getElementById('blocklyDiv');
  if (blocklyDiv) blocklyDiv.innerHTML = '';

  try { if (loopWorkspace) loopWorkspace.dispose(); } catch(e){}
  // dispose global workspace if present (stack activity)
  try { if (window.workspace) window.workspace.dispose(); } catch(e){}

  loopWorkspace = Blockly.inject('blocklyDiv', {
    toolbox: buildLoopToolbox(colors),
    scrollbars: true,
    trashcan: true,
    grid: { spacing: 20, length: 3, colour: 'rgba(255,255,255,0.05)', snap: true }
  });

  let flyout = null;
  if (loopWorkspace.getFlyout) flyout = loopWorkspace.getFlyout();
  if (!flyout && loopWorkspace.getToolbox && loopWorkspace.getToolbox().getFlyout) {
    flyout = loopWorkspace.getToolbox().getFlyout();
  }
  if (flyout && typeof flyout.setAutoClose === 'function') {
    flyout.setAutoClose(false);
  }

  const updateLoopPreview = () => {
    const seq = evaluateWorkspaceSequence(loopWorkspace);
    renderMyStack(seq, LOOP_LEVELS[currentLoopLevel].target || []);
    const count = loopWorkspace.getAllBlocks(false).length;
    const el = document.getElementById('block-count');
    if (el) {
      el.textContent = String(count);
      el.classList.toggle('green', LOOP_LEVELS[currentLoopLevel].naiveBlocks && count < LOOP_LEVELS[currentLoopLevel].naiveBlocks);
    }
  };

  // update counter on change
  loopWorkspace.addChangeListener(updateLoopPreview);
  updateLoopPreview();

  // special handling for free design level: create UI controls
  if (idx === 3) {
    // create small controls inside goal-card if not present
    let ctrl = document.getElementById('free-controls');
    if (!ctrl) {
      ctrl = document.createElement('div');
      ctrl.id = 'free-controls';
      ctrl.style.marginTop = '8px';
      ctrl.style.display = 'flex';
      ctrl.style.flexDirection = 'column';
      ctrl.style.background = '#0f3460';
      ctrl.style.padding = '8px';
      ctrl.style.borderRadius = '8px';
      ctrl.style.border = '1px solid rgba(255,255,255,0.04)';
      ctrl.style.color = '#ffffff';
      const row = document.createElement('div');
      row.style.display = 'flex'; row.style.gap='8px'; row.style.marginTop='8px';
      row.style.flexWrap = 'wrap';
      row.style.alignItems = 'center';

      const c1 = document.createElement('select'); c1.id='free-col-1';
      const c2 = document.createElement('select'); c2.id='free-col-2';
      ['red','blue','yellow','green','orange','purple','pink','white'].forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; c1.appendChild(o); const o2=o.cloneNode(true); c2.appendChild(o2); });
      // improve contrast on selects and inputs and make them responsive
      [c1, c2].forEach(s => {
        s.style.background = '#16213e'; s.style.color = '#fff'; s.style.border = '1px solid rgba(255,255,255,0.06)';
        s.style.padding = '6px 8px'; s.style.borderRadius = '6px';
        s.style.minWidth = '96px'; s.style.maxWidth = '140px'; s.style.flex = '0 0 120px';
      });
      const times = document.createElement('input'); times.type='number'; times.min=1; times.value=4; times.id='free-times'; times.style.width='64px';
      times.style.background = '#16213e'; times.style.color = '#fff'; times.style.border = '1px solid rgba(255,255,255,0.06)'; times.style.padding = '6px'; times.style.borderRadius = '6px';
      times.style.flex = '0 0 64px'; times.style.minWidth = '64px';
      const apply = document.createElement('button'); apply.textContent='Set pattern'; apply.className='btn btn-run';
      apply.style.flex = '0 0 auto'; apply.style.marginLeft = '6px'; apply.style.marginTop = '6px';
      apply.onclick = ()=>{
        const a=c1.value, b=c2.value, t = Math.max(1, Number(times.value)||1);
        const pattern = Array(t).fill([a,b]).flat();
        LOOP_LEVELS[3].target = pattern;
        LOOP_LEVELS[3].naiveBlocks = pattern.length;
        renderTargetStack(pattern);
        try { if (typeof updateLoopPreview === 'function') updateLoopPreview(); } catch(e) { /* ignore */ }
      };
      row.appendChild(c1); row.appendChild(c2); row.appendChild(times); row.appendChild(apply);
      ctrl.appendChild(row);
      document.getElementById('goal-card').appendChild(ctrl);
    }
  } else {
    const existing = document.getElementById('free-controls'); if (existing) existing.remove();
  }
}

function loopRun() {
  const lvl = LOOP_LEVELS[currentLoopLevel];
  if (!loopWorkspace) { showFeedback('error', 'No workspace loaded.'); return; }
  const output = evaluateWorkspaceSequence(loopWorkspace);
  // `evaluateWorkspaceSequence` already returns bottom→top order for our stack logic.
  // Keep `stack` as bottom→top so it matches `LOOP_LEVELS[].target` convention.
  const stack = output.slice();
  renderMyStack(stack, lvl.target);

  // update block count color
  const count = loopWorkspace.getAllBlocks(false).length;
  const el = document.getElementById('block-count');
  el.textContent = String(count);
  if (lvl.naiveBlocks && count < lvl.naiveBlocks) el.classList.add('green'); else el.classList.remove('green');

  // check correctness
  if (!lvl.target) {
    showFeedback('info', `Your design produced ${stack.length} bricks.`);
    return;
  }
  const correct = stack.length === lvl.target.length && stack.every((c,i)=>c===lvl.target[i]);
  console.log('LOOP_DEBUG', {level: currentLoopLevel, output, stack, target: lvl.target, correct});
  if (correct) {
    showFeedback('success', '✅ Perfect match! Nice loop.');
    loopCompleted.add(currentLoopLevel);
    if (typeof updateProgress === 'function') updateProgress();
    setTimeout(() => showCelebration(currentLoopLevel, lvl), 700);
  } else if (stack.length !== lvl.target.length) {
    showFeedback('error', `Not matching the target. Your output has ${stack.length} bricks but the target needs ${lvl.target.length}.`);
    setTimeout(() => showCelebration(currentLoopLevel, lvl), 700);
  } else {
    const wrongs = stack.filter((c,i)=>c !== lvl.target[i]).length;
    showFeedback('error', `Not matching the target. ${wrongs} brick${wrongs !== 1 ? 's are' : ' is'} in the wrong position.`);
  }
}

function loopClear() {
  if (loopWorkspace) loopWorkspace.clear();
  renderMyStack([], LOOP_LEVELS[currentLoopLevel].target || []);
  document.getElementById('block-count').textContent = '0';
  const existing = document.getElementById('free-controls'); if (existing) existing.remove();
}

/* ── Dispatcher for level loading (handles all activities) ── */
function loadActivityLevel(idx) {
  currentLevel = idx; // Track which level we're on
  updateLevelButtons(); // Update button styling
  
  if (currentActivity === 'stack') {
    if (typeof loadLevel === 'function') loadLevel(idx);
  } else if (currentActivity === 'loop') {
    if (typeof loadLoopLevel === 'function') loadLoopLevel(idx);
  } else if (currentActivity === 'if') {
    if (typeof loadIfLevel === 'function') loadIfLevel(idx);
  } else if (currentActivity === 'anim') {
    if (typeof loadAnimLevel === 'function') loadAnimLevel(idx);
  } else if (currentActivity === 'fp') {
    // Free project has no traditional levels, but reset if needed
    if (typeof setupFPWorkspace === 'function') setupFPWorkspace();
  }
}

/* ── Advance to next level (used by all activities) ── */
function nextLevel() {
  document.getElementById('celebration').classList.remove('show');
  const levels = currentActivity === 'stack' ? LEVELS : currentActivity === 'loop' ? LOOP_LEVELS : currentActivity === 'if' ? IF_LEVELS : currentActivity === 'anim' ? ANIM_LEVELS : [];
  if (!levels || !levels.length) return;
  const nextIdx = currentLevel + 1;
  if (nextIdx >= levels.length) {
    showFeedback('success', '🎉 You completed all levels for this activity!');
    return;
  }
  loadActivityLevel(nextIdx);
}