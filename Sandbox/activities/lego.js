const LEVELS = [
  {
    title: "Stack 3 bricks in order: red on bottom, blue in middle, yellow on top.",
    goal: "Build a tower: red on bottom → blue in middle → yellow on top. Order matters — just like instructions to a computer!",
    target: ['red','blue','yellow'],   // index 0 = bottom brick
    maxBlocks: 6,
    emoji: '🟥',
    successMsg: "Your stack matched perfectly! You just gave a computer its first instructions.",
    colors: ['red','blue','yellow']
  },
  {
    title: "Stack 4 bricks: green on bottom, then red, yellow, blue on top.",
    goal: "4 bricks now! green → red → yellow → blue (bottom to top). One wrong order and the tower won't match — computers are exactly the same.",
    target: ['green','red','yellow','blue'],
    maxBlocks: 8,
    emoji: '🟩',
    successMsg: "4 bricks, perfect order! You wrote a 4-step algorithm.",
    colors: ['red','blue','yellow','green']
  },
  {
    title: "A pattern repeats! Build: red, blue, red, blue (bottom to top).",
    goal: "Can you spot the pattern? red → blue → red → blue (bottom to top). In coding this is called a sequence with repetition!",
    target: ['red','blue','red','blue'],
    maxBlocks: 8,
    emoji: '🔴',
    successMsg: "You spotted the repeating pattern! Tomorrow you'll learn a shortcut for this — called a loop.",
    colors: ['red','blue','yellow','green']
  },
  {
    title: "Free builder! Create any stack of 5 bricks, then describe it to a friend.",
    goal: "Your mission: build ANY stack of 5 bricks. Then describe it step-by-step to your partner. If they can rebuild it exactly — you both win!",
    target: null,
    maxBlocks: 10,
    emoji: '🌟',
    successMsg: "Amazing! You just created your own algorithm and shared it with someone. That's what programmers do every day.",
    colors: ['red','blue','yellow','green','orange','purple','pink','white']
  }
];

let stackCompleted = new Set();
let workspace = null;

function loadLevel(idx) {
  currentLevel = idx;
  const lvl = LEVELS[idx];

  document.querySelectorAll('.levels .level-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  document.getElementById('goal-text').textContent = lvl.goal;
  
  // Update main mission label with level-specific info
  const missionEl = document.querySelector('.mission');
  if (missionEl) missionEl.textContent = `🧱 Stack Builder — ${lvl.title}`;
  
  hideFeedback();

  registerBlocks(lvl.colors);

  // ┌─ CRITICAL: Clear blocklyDiv before injecting new workspace ─┐
  const blocklyDiv = document.getElementById('blocklyDiv');
  if (blocklyDiv) blocklyDiv.innerHTML = '';

  if (workspace) {
    workspace.dispose();
    workspace = null;
  }
  // Dispose other activity workspaces if switching from Day 2-5
  try { if (typeof loopWorkspace !== 'undefined' && loopWorkspace) { loopWorkspace.dispose(); loopWorkspace = null; } } catch(e){}
  try { if (typeof ifWorkspace !== 'undefined' && ifWorkspace) { ifWorkspace.dispose(); ifWorkspace = null; } } catch(e){}
  try { if (typeof animWorkspace !== 'undefined' && animWorkspace) { animWorkspace.dispose(); animWorkspace = null; } } catch(e){}
  try { if (typeof fpWorkspace !== 'undefined' && fpWorkspace) { fpWorkspace.dispose(); fpWorkspace = null; } } catch(e){}

  workspace = Blockly.inject('blocklyDiv', {
    toolbox: buildToolbox(lvl.colors),
    maxBlocks: lvl.maxBlocks,
    scrollbars: true,
    trashcan: true,
    theme: getSandboxTheme(),
    grid: {
      spacing: 20,
      length: 3,
      colour: 'rgba(255,255,255,0.05)',
      snap: true
    }
  });

  disableFlyoutAutoClose(workspace);

  workspace.addChangeListener(() => {
    const current = extractStack();
    if (!lvl.target) {
      renderTargetStack(current);
      renderMyStack(current, null);
    } else {
      renderMyStack(current, lvl.target);
    }
    const counter = document.getElementById('block-count');
    if (counter) counter.textContent = String(workspace.getAllBlocks(false).length);
  });

  const areaLabel = document.querySelector('.area-label');
  const targetLabel = document.querySelector('.stack-col:first-child .col-label');
  const outputLabel = document.querySelector('.stack-col:last-child .col-label');

  if (!lvl.target) {
    if (areaLabel)   areaLabel.textContent  = '🧱 Your design — build any stack of 5 bricks';
    if (targetLabel) targetLabel.innerHTML  = 'Your<br>design';
    if (outputLabel) outputLabel.innerHTML  = 'Your<br>output';
  } else {
    if (areaLabel)   areaLabel.textContent  = '🧱 Target stack → Your stack';
    if (targetLabel) targetLabel.innerHTML  = 'Target<br>(match this!)';
    if (outputLabel) outputLabel.innerHTML  = 'Your<br>output';
  }

  renderTargetStack(lvl.target);
  renderMyStack([], lvl.target);
}

function runCode() {
  const lvl = LEVELS[currentLevel];
  const stack = extractStack();

  if (stack.length === 0) {
    showFeedback('info', 'Nothing to run yet! Drag some brick blocks into the workspace and connect them.');
    renderMyStack([], lvl.target);
    return;
  }

  if (!lvl.target) {
    renderTargetStack(stack);
    renderMyStack(stack, null);

    if (stack.length < 5) {
      showFeedback('info', `You have ${stack.length} brick${stack.length !== 1 ? 's' : ''} — need 5 to complete this level. Keep adding!`);
    } else {
      setTimeout(() => showCelebration(currentLevel, lvl), 600);
    }
    return;
  }

  renderMyStack(stack, lvl.target);

  const correct = stack.length === lvl.target.length &&
    stack.every((c, i) => c === lvl.target[i]);

  if (correct) {
    showFeedback('success', '✅ Perfect match! Great job.');
    stackCompleted.add(currentLevel);
    updateProgress();
    setTimeout(() => showCelebration(currentLevel, lvl), 700);
  } else if (stack.length < lvl.target.length) {
    showFeedback('error', `Not quite! Your stack has ${stack.length} brick${stack.length !== 1 ? 's' : ''} but needs ${lvl.target.length}. Check for red-outlined bricks — those are wrong. Keep trying!`);
  } else if (stack.length > lvl.target.length) {
    showFeedback('error', `Too many bricks! Your stack has ${stack.length}, the target has ${lvl.target.length}. Remove some and try again.`);
  } else {
    const wrongs = stack.filter((c, i) => c !== lvl.target[i]).length;
    showFeedback('error', `Almost! ${wrongs} brick${wrongs !== 1 ? 's are' : ' is'} in the wrong position (shown in red). Check the target and try again!`);
  }
}

function clearStack() {
  if (workspace) workspace.clear();
  const lvl = LEVELS[currentLevel];
  renderTargetStack(lvl.target || []);
  renderMyStack([], lvl.target);
  hideFeedback();
}

/* Advance to next level in Day 1 (Stack Builder) */
function nextLevel() {
  document.getElementById('celebration').classList.remove('show');
  if (currentLevel < LEVELS.length - 1) {
    loadLevel(currentLevel + 1);
  } else {
    showFeedback('success', '🎉 You completed all Stack Builder levels!');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Pre-register all block definitions so they're available when needed
  LEVELS.forEach(lvl => registerBlocks(lvl.colors));
  // Do NOT call loadLevel() here — let the activity router (loop-builder.js) handle initialization
});

