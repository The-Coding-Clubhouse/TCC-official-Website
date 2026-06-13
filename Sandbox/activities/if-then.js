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

let currentLevel = 0;
let ifCompleted = new Set();
let ifWorkspace = null;

function loadIfLevel(idx) {
  currentLevel = idx;
  const lvl = IF_LEVELS[idx];

  document.querySelectorAll('.levels .level-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  document.getElementById('if-title').textContent = lvl.title;
  document.getElementById('if-goal').textContent = lvl.goal;

  if (typeof updateLevelButtons === 'function') updateLevelButtons();
}

function runIfCode() {
  // Stub - to be implemented
  console.log('If-Then: Running code for level', currentLevel);
  setTimeout(() => {
    if (!ifCompleted.has(currentLevel)) {
      ifCompleted.add(currentLevel);
      if (typeof updateProgress === 'function') updateProgress();
      const lvl = IF_LEVELS[currentLevel];
      setTimeout(() => showCelebration(currentLevel, lvl), 600);
    }
  }, 500);
}

function clearIfCode() {
  // Stub - to be implemented
  console.log('If-Then: Clearing code');
}

window.addEventListener('DOMContentLoaded', () => {
  loadIfLevel(0);
});
