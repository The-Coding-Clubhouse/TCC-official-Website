import { StageCore } from "./stage-core.js";
import { StageEngine } from "./stage-engine.js";

/**
 * Registry of all activities (Days 1–5)
 */
const activities = {
  stack: null,
  loop: null,
  ifthen: null,
  anim: null,
  fp: null
};

let currentActivity = "stack";

export const ActivityManager = {

  register(name, module) {
    activities[name] = module;
  },

  init() {
    this.bindUI();
    this.switch("stack");
  },

  switch(name) {
    if (!activities[name]) {
      console.warn("Unknown activity:", name);
      return;
    }

    currentActivity = name;

    // reset shared engine state
    StageCore.reset();

    // load activity
    activities[name].load?.();

    // update UI
    this.updateActiveButton(name);
  },

  run() {
    const activity = activities[currentActivity];
    if (!activity) return;

    activity.run?.();
  },

  clear() {
    const activity = activities[currentActivity];
    if (!activity) return;

    activity.clear?.();
  },

  updateActiveButton(name) {
    document.querySelectorAll(".activity-switch button")
      .forEach(btn => btn.classList.remove("active"));

    const map = {
      stack: "activity-stack",
      loop: "activity-loop",
      ifthen: "activity-if",
      anim: "activity-anim",
      fp: "activity-fp"
    };

    const el = document.getElementById(map[name]);
    if (el) el.classList.add("active");
  },

  bindUI() {
    document.getElementById("activity-stack")
      ?.addEventListener("click", () => this.switch("stack"));

    document.getElementById("activity-loop")
      ?.addEventListener("click", () => this.switch("loop"));

    document.getElementById("activity-if")
      ?.addEventListener("click", () => this.switch("ifthen"));

    document.getElementById("activity-anim")
      ?.addEventListener("click", () => this.switch("anim"));

    document.getElementById("activity-fp")
      ?.addEventListener("click", () => this.switch("fp"));

    document.querySelector(".btn-run")
      ?.addEventListener("click", () => this.run());

    document.querySelector(".btn-clear")
      ?.addEventListener("click", () => this.clear());
  }
};
