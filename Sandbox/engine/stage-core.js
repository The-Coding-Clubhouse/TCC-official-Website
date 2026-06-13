// stage-core.js

export const StageCore = {
  state: {
    currentScene: null,
    characters: [],
    variables: {},
    isRunning: false
  },

  reset() {
    this.state.currentScene = null;
    this.state.characters = [];
    this.state.variables = {};
    this.state.isRunning = false;
  },

  setScene(scene) {
    this.state.currentScene = scene;
  },

  addCharacter(char) {
    this.state.characters.push(char);
  },

  setVariable(key, value) {
    this.state.variables[key] = value;
  },

  getVariable(key) {
    return this.state.variables[key];
  }
};
