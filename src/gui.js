import GUI from "lil-gui";

export function initGui() {
  const gui = new GUI();
  const folder = gui.addFolder("Params");

  const CTRLS = {
    _factor: 0.0013,
    _damping: 0.95,
    // _arrowFactor: 0.06,
    _snapping: 0.025,
    _bounds: 0.3,
  };

  const applyChanges = () => (window.GUI = CTRLS);

  folder.add(CTRLS, "_factor", 0, 0.01).onChange(() => applyChanges());
  folder.add(CTRLS, "_damping", 0, 1).onChange(() => applyChanges());
  // folder.add(CTRLS, "_arrowFactor", 0, 1).onChange(() => applyChanges());
  folder.add(CTRLS, "_snapping", 0, 1).onChange(() => applyChanges());
  folder.add(CTRLS, "_bounds", 0, 1).onChange(() => applyChanges());

  // return
  window.GUI = CTRLS;

  gui.close();
}
