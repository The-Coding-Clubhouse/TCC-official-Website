// stage-render.js

export const StageRender = {
  renderScene(scene) {
    const el = document.getElementById("stage");
    if (!el) return;

    el.innerHTML = "";

    scene.elements.forEach(item => {
      const div = document.createElement("div");
      div.className = "sprite";
      div.style.left = item.x + "px";
      div.style.top = item.y + "px";
      div.innerText = item.emoji || "🎮";
      el.appendChild(div);
    });
  },

  updateCharacter(id, x, y) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (!el) return;

    el.style.left = x + "px";
    el.style.top = y + "px";
  }
};
