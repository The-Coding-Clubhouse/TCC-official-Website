/* ============================================================
   sandbox.js  –  shared utilities for ALL activities
   ============================================================ */

/* ---------- block registration ---------- */
function registerBlocks(colors) {
  colors.forEach(color => {
    const blockName = `brick_${color}`;
    if (Blockly.Blocks[blockName]) return;

    const hex = {
      red: '#e74c3c', blue: '#3498db', yellow: '#f1c40f',
      green: '#2ecc71', orange: '#e67e22', purple: '#9b59b6',
      pink: '#ff69b4', white: '#ecf0f1'
    }[color] || '#aaa';

    Blockly.Blocks[blockName] = {
      init() {
        this.appendDummyInput().appendField(`🧱 ${color.toUpperCase()} brick`);
        this.setPreviousStatement(true, 'Brick');
        this.setNextStatement(true, 'Brick');
        this.setColour(hex);
        this.setTooltip(`A ${color} brick`);
      }
    };
  });
}

/* ---------- toolbox ---------- */
function buildToolbox(colors) {
  const blocks = colors.map(c =>
    `<block type="brick_${c}"></block>`
  ).join('');
  return `<xml xmlns="https://developers.google.com/blockly/xml">
    <category name="🧱 Bricks" colour="#e94560">
      ${blocks}
    </category>
  </xml>`;
}

/* ---------- stack extraction ----------
   Returns colors top→bottom as they appear stacked visually.
   Blockly chain goes topBlock→next→next (top of stack first).
   Target arrays in LEVELS are defined bottom→top ['red','blue','yellow']
   meaning red is at the bottom, yellow at the top.
   extractStack() returns top→bottom order to match visual rendering.
----------------------------------------------------------------------- */
function extractStack() {
  const topBlocks = workspace.getTopBlocks(true);
  if (!topBlocks.length) return [];
  const stack = [];
  let block = topBlocks[0];
  while (block) {
    stack.push(block.type.replace('brick_', ''));
    block = block.getNextBlock();
  }
  // stack is now top-of-tower → bottom-of-tower (Blockly order)
  // reverse so index 0 = bottom brick, matching LEVELS target arrays
  return stack.reverse();
}

/* ---------- rendering helpers ---------- */
const COLOR_MAP = {
  red:'#e74c3c', blue:'#3498db', yellow:'#f1c40f',
  green:'#2ecc71', orange:'#e67e22', purple:'#9b59b6',
  pink:'#ff69b4', white:'#ecf0f1'
};

function makeBrick(color, highlight) {
  const hex = COLOR_MAP[color] || '#aaa';
  const div = document.createElement('div');
  div.className = 'brick';
  if (highlight === 'wrong') div.classList.add('wrong');
  if (highlight === 'ok')    div.classList.add('ok');
  div.style.background = hex;
  div.style.color = (color === 'yellow' || color === 'white') ? '#333' : '#fff';
  div.textContent = color.toUpperCase();
  return div;
}

/* Render a stack where index 0 = bottom brick.
   We reverse before appending so bottom brick appears at bottom of div. */
function renderTargetStack(target) {
  const el = document.getElementById('target-stack');
  if (!el) return;
  el.innerHTML = '';
  if (!target || !target.length) {
    el.innerHTML = '<div class="empty-hint">Nothing yet — build your stack!</div>';
    return;
  }
  // target[0] = bottom brick → render reversed so bottom appears at bottom
  [...target].reverse().forEach(c => el.appendChild(makeBrick(c)));
}

/* stack param: index 0 = bottom brick (matches target convention) */
function renderMyStack(stack, target) {
  const el = document.getElementById('my-stack');
  if (!el) return;
  el.innerHTML = '';
  if (!stack.length) {
    el.innerHTML = '<div class="empty-hint">Drag bricks from the toolbox →</div>';
    return;
  }
  // render reversed so index-0 (bottom) appears at bottom of div
  [...stack].reverse().forEach((c, reversedIdx) => {
    const originalIdx = stack.length - 1 - reversedIdx; // index in original array
    let hl = null;
    if (target) {
      hl = (target[originalIdx] === c) ? 'ok' : 'wrong';
    }
    el.appendChild(makeBrick(c, hl));
  });
}

/* ---------- flyout auto-close fix ---------- */
function disableFlyoutAutoClose(ws) {
  // Try both the direct flyout and the toolbox flyout
  const tryFlyout = (flyout) => {
    if (!flyout) return;
    if (typeof flyout.setAutoClose === 'function') flyout.setAutoClose(false);
    // Blockly internals fallback
    if (flyout.autoClose !== undefined) flyout.autoClose = false;
  };
  try { tryFlyout(ws.getFlyout && ws.getFlyout()); } catch(e) {}
  try { tryFlyout(ws.getToolbox && ws.getToolbox() && ws.getToolbox().getFlyout && ws.getToolbox().getFlyout()); } catch(e) {}
}

/* ---------- feedback ---------- */
function showFeedback(type, msg) {
  const el = document.getElementById('feedback');
  if (!el) return;
  el.className = `feedback ${type}`;
  el.textContent = msg;
  el.style.display = 'block';
}
function hideFeedback() {
  const el = document.getElementById('feedback');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

/* ---------- progress ---------- */
function updateProgress() {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  if (!fill || !text) return;
  const pct = Math.round((completedLevels.size / LEVELS.length) * 100);
  fill.style.width = pct + '%';
  text.textContent = `${completedLevels.size} / ${LEVELS.length} levels complete`;
}

/* ---------- celebration ---------- */
function showCelebration(levelIdx, lvl) {
  const overlay = document.getElementById('celebration-overlay');
  const msg     = document.getElementById('celebration-msg');
  const sub     = document.getElementById('celebration-sub');
  if (!overlay) return;
  msg.textContent = lvl.successMsg;
  sub.textContent = levelIdx < LEVELS.length - 1
    ? `Level ${levelIdx + 1} complete! Ready for level ${levelIdx + 2}?`
    : '🎉 You completed all levels!';
  overlay.style.display = 'flex';
}

function closeCelebration() {
  const overlay = document.getElementById('celebration-overlay');
  if (overlay) overlay.style.display = 'none';
  if (currentLevel < LEVELS.length - 1) loadLevel(currentLevel + 1);
}
