/* ============================================================
   debug-panel.js — Real-time activity/level switching debugger
   Shows current state of activities, levels, panels, and blocks
   ============================================================ */

let debugState = {
  currentActivity: 'stack',
  currentLevel: 0,
  visiblePanels: [],
  panelStates: {},
  activeLevelBtn: null,
  blockCounts: {}
};

let debugLog_entries = [];

function initDebugPanel() {
  const debugPanel = document.createElement('div');
  debugPanel.id = 'debug-panel';
  debugPanel.style.cssText = `
    position: fixed;
    bottom: 12px;
    right: 12px;
    width: 320px;
    max-height: 500px;
    background: rgba(0,0,0,0.92);
    border: 2px solid #00ff00;
    border-radius: 8px;
    padding: 12px;
    font-family: monospace;
    font-size: 10px;
    color: #00ff00;
    overflow-y: auto;
    z-index: 10000;
    box-shadow: 0 0 10px rgba(0,255,0,0.3);
  `;
  
  debugPanel.innerHTML = `
    <div style="font-weight:bold; margin-bottom:8px; border-bottom:1px solid #00ff00; padding-bottom:4px;">
      🔍 ACTIVITY STATE
    </div>
    <div style="margin-bottom:8px;">
      <div><span style="color:#ffff00;">Activity:</span> <span id="debug-activity">-</span></div>
      <div><span style="color:#ffff00;">Level:</span> <span id="debug-level">-</span></div>
      <div><span style="color:#ffff00;">Active Btn:</span> <span id="debug-btn" style="font-size:9px;">-</span></div>
      <div><span style="color:#ffff00;">Blocks:</span> <span id="debug-blocks">-</span></div>
    </div>
    <div style="margin-bottom:8px; padding:6px; background:rgba(0,255,0,0.08); border-radius:4px; border:1px solid rgba(0,255,0,0.2);">
      <div style="color:#ffff00; font-weight:bold; margin-bottom:4px;">Left Panel State:</div>
      <div id="debug-panels" style="font-size:9px; line-height:1.4;"></div>
    </div>
    <div style="margin-bottom:8px; padding:6px; background:rgba(0,255,0,0.08); border-radius:4px; border:1px solid rgba(0,255,0,0.2);">
      <div style="color:#ffff00; font-weight:bold; margin-bottom:4px;">Events Log:</div>
      <div id="debug-log" style="font-size:9px; max-height:120px; overflow-y:auto; line-height:1.3;"></div>
    </div>
    <div style="display:flex; gap:4px;">
      <button id="debug-test-d1-d2" style="flex:1; padding:4px; background:#0a0; color:#000; border:none; border-radius:4px; cursor:pointer; font-size:9px; font-weight:bold;">
        D1→D2
      </button>
      <button id="debug-test-d1-d3" style="flex:1; padding:4px; background:#0a0; color:#000; border:none; border-radius:4px; cursor:pointer; font-size:9px; font-weight:bold;">
        D1→D3
      </button>
      <button id="debug-test-d4-d3" style="flex:1; padding:4px; background:#0a0; color:#000; border:none; border-radius:4px; cursor:pointer; font-size:9px; font-weight:bold;">
        D4→D3
      </button>
      <button id="debug-clear" style="flex:1; padding:4px; background:#0f0; color:#000; border:none; border-radius:4px; cursor:pointer; font-size:9px; font-weight:bold;">
        Clear
      </button>
    </div>
  `;
  
  document.body.appendChild(debugPanel);
  document.getElementById('debug-clear').addEventListener('click', () => {
    debugLog_entries = [];
    document.getElementById('debug-log').innerHTML = '';
  });
  
  document.getElementById('debug-test-d1-d2').addEventListener('click', () => {
    debugLog('TEST: D1→D2');
    switchActivity('stack');
    setTimeout(() => switchActivity('loop'), 100);
  });
  
  document.getElementById('debug-test-d1-d3').addEventListener('click', () => {
    debugLog('TEST: D1→D3');
    switchActivity('stack');
    setTimeout(() => switchActivity('if'), 100);
  });
  
  document.getElementById('debug-test-d4-d3').addEventListener('click', () => {
    debugLog('TEST: D4→D3');
    switchActivity('anim');
    setTimeout(() => switchActivity('if'), 100);
  });
}

function debugLog(msg) {
  const log = document.getElementById('debug-log');
  if (!log) return;
  debugLog_entries.push(msg);
  if (debugLog_entries.length > 20) debugLog_entries.shift();
  
  const html = debugLog_entries.map(entry => {
    const time = entry.includes(':') ? '' : new Date().toLocaleTimeString();
    return `<div style="padding:2px 0; border-bottom:1px solid rgba(0,255,0,0.1);">${time ? '[' + time + '] ' : ''}${entry}</div>`;
  }).join('');
  log.innerHTML = html;
}

function updateDebugState() {
  const activity = typeof currentActivity !== 'undefined' ? currentActivity : 'unknown';
  const level = typeof currentLevel !== 'undefined' ? currentLevel : -1;
  
  debugState.currentActivity = activity;
  debugState.currentLevel = level;
  
  // Get all panels and their visibility
  const panels = [
    { id: 'panel-stack-loop', label: 'Stack/Loop' },
    { id: 'panel-if', label: 'If-Then' },
    { id: 'panel-anim', label: 'Animator' },
    { id: 'panel-fp', label: 'FreeProject' }
  ];
  
  debugState.visiblePanels = [];
  debugState.panelStates = {};
  
  panels.forEach(p => {
    const el = document.getElementById(p.id);
    if (!el) {
      debugState.panelStates[p.label] = 'MISSING';
      return;
    }
    const display = window.getComputedStyle(el).display;
    const visible = display !== 'none';
    if (visible) debugState.visiblePanels.push(p.label);
    debugState.panelStates[p.label] = visible ? '✓ VISIBLE' : '✗ hidden';
  });
  
  // Get active level button
  const activeLvlBtn = document.querySelector('.levels .level-btn.active');
  debugState.activeLevelBtn = activeLvlBtn ? activeLvlBtn.textContent : 'none';
  
  // Get block counts
  const blockEl = document.getElementById('block-count');
  debugState.blockCounts.total = blockEl ? blockEl.textContent : '0';
  
  // Update display
  document.getElementById('debug-activity').textContent = activity;
  document.getElementById('debug-level').textContent = level >= 0 ? level : '-';
  document.getElementById('debug-btn').textContent = debugState.activeLevelBtn;
  document.getElementById('debug-blocks').textContent = debugState.blockCounts.total;
  
  const panelHTML = Object.entries(debugState.panelStates)
    .map(([name, state]) => {
      const color = state.includes('✓') ? '#0f0' : state.includes('✗') ? '#f00' : '#888';
      return `<div style="color:${color};">${name}: ${state}</div>`;
    }).join('');
  document.getElementById('debug-panels').innerHTML = panelHTML;
}

// Hook into switchActivity to log transitions
const originalSwitchActivity = window.switchActivity;
window.switchActivity = function(name) {
  debugLog(`→ switchActivity('${name}')`);
  const result = originalSwitchActivity.call(this, name);
  setTimeout(updateDebugState, 100);
  return result;
};

// Hook into loadActivityLevel
if (typeof window.loadActivityLevel === 'function') {
  const originalLoadActivityLevel = window.loadActivityLevel;
  window.loadActivityLevel = function(idx) {
    debugLog(`📍 loadActivityLevel(${idx})`);
    const result = originalLoadActivityLevel.call(this, idx);
    setTimeout(updateDebugState, 100);
    return result;
  };
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initDebugPanel, 100);
  setTimeout(updateDebugState, 200);
  debugLog('✅ Debug panel ready');
});

// Update state periodically
setInterval(updateDebugState, 300);

