/* stage-core.js */

export const StageCore = {
  state: {
    charX: 50,
    costume: 0,
    bgIndex: 0
  },

  isRunning: false,
  eventMap: {},

  reset() {
    this.state = {
      charX: 50,
      costume: 0,
      bgIndex: 0
    };

    this.isRunning = false;
    this.eventMap = {};
  }
};
