import { StageCore } from "./stage-core.js";
import { StageRender } from "./stage-render.js";
import { StageEvents } from "./stage-events.js";
import { StageBlockly } from "./stage-blockly.js";

export const StageEngine = {
  init(workspace) {
    this.workspace = workspace;

    StageEvents.init();

    console.log("Stage Engine initialized");
  },

  run() {
    StageCore.state.isRunning = true;

    StageBlockly.run(this.workspace);

    StageRender.renderScene(StageCore.state.currentScene);
  },

  reset() {
    StageCore.reset();
  }
};
