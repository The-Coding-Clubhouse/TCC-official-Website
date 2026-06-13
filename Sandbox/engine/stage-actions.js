/* stage-actions.js */

import { StageCore } from "./stage-core.js";

export function executeAction(action, key, SE_COSTUMES, SE_REACTIONS) {
  const state = StageCore.state;

  const char = document.getElementById('stage-character');
  const speech = document.getElementById('stage-speech');

  switch (action.type) {

    case 'move': {
      const step = 12;

      if (action.value === 'move_left') {
        state.charX = Math.max(10, state.charX - step);
      }

      if (action.value === 'move_right') {
        state.charX = Math.min(90, state.charX + step);
      }

      if (action.value === 'jump' && char) {
        char.style.transform = 'translateY(-30px)';
        setTimeout(() => char.style.transform = '', 400);
      }

      if (action.value === 'spin' && char) {
        char.style.transform = 'rotate(360deg)';
        setTimeout(() => char.style.transform = '', 500);
      }

      if (char) char.style.left = state.charX + '%';
      break;
    }

    case 'say': {
      if (speech) {
        speech.textContent = action.value;
        speech.classList.remove('hidden');
        setTimeout(() => speech.classList.add('hidden'), 2500);
      }
      break;
    }

    case 'costume': {
      state.costume = parseInt(action.value, 10);
      if (char) char.textContent = SE_COSTUMES[state.costume];
      break;
    }

    case 'background': {
      state.bgIndex = parseInt(action.value, 10);
      break;
    }

    case 'sound': {
      break;
    }

    case 'reaction': {
      const r = SE_REACTIONS[action.value];
      break;
    }
  }
}
