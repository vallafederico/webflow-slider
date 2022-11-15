import Emitter from "tiny-emitter";

export default class extends Emitter {
  constructor(target = window, config = { unit: false }) {
    super();
    this.target = this.setTargetElement(target);
    this.config = config;

    this.init();
  }

  init() {
    this.dragging = false;
    this.pointer = {
      x: null,
      y: null,
      // dragXY
      dx: null,
      dy: null,
      // originXY
      ox: null,
      oy: null,
      // movementXY
      mx: null,
      my: null,
    };

    // value stores
    this.store = {
      x: null,
      y: null,
    };

    this.addEvents();
  }

  /** Setup
   */

  setTargetElement(target) {
    if (typeof target === "string") {
      return document.querySelector(target);
    }

    return target;
  }

  addEvents() {
    if ("ontouchmove" in window) {
      this.target.addEventListener("touchstart", this.onDown.bind(this));
      this.target.addEventListener("touchmove", this.onMove.bind(this));
      this.target.addEventListener("touchend", this.onUp.bind(this));
    } else {
      this.target.addEventListener("mousedown", this.onDown.bind(this));
      this.target.addEventListener("mousemove", this.onMove.bind(this));
      this.target.addEventListener("mouseup", this.onUp.bind(this));
    }

    document.addEventListener("mouseleave", () => {
      //   console.log("mouse out of vp");
      this.onUp.bind(this);
    });

    if (this.config.unit) {
      let tg = this.target !== window ? this.target : document.body;
      new ResizeObserver((entry) => this.onResize(entry[0])).observe(tg);
    }
  }

  /** Utils
   */

  onResize({ contentRect }) {
    this.vp = {
      w: contentRect.width,
      h: contentRect.height,
    };
  }

  getXY(e) {
    let x = e.touches ? e.touches[0]?.clientX : e.clientX;
    let y = e.touches ? e.touches[0]?.clientY : e.clientY;

    const sx = e.touches ? e.touches[0]?.screenX : e.screenX;
    const sy = e.touches ? e.touches[0]?.screenY : e.screenY;

    if (x === undefined || y === undefined) {
      x = this.pointer.x;
      y = this.pointer.y;
    }

    return { x, y, sx, sy };
  }

  /** Events
   */

  onUp(e) {
    const { x, y } = this.getXY(e);

    this.pointer.x = x;
    this.pointer.y = y;

    this.dragging = false;

    this.emit("up", this.pointer);

    // reset store
    this.store.x = this.store.y = null;
  }

  onDown(e) {
    const { x, y } = this.getXY(e);

    this.pointer.x = this.pointer.ox = x;
    this.pointer.y = this.pointer.oy = y;

    this.dragging = true;

    this.emit("down", this.pointer);
  }

  onMove(e) {
    const { x, y } = this.getXY(e);

    this.pointer.x = x;
    this.pointer.y = y;

    if (this.dragging) this.onDrag(e);

    this.emit("move", this.pointer);
  }

  onDrag(e) {
    const { x, y, sx, sy, mvmtX, mvmtY } = this.getXY(e);

    this.pointer.dx = x - this.pointer.ox;
    this.pointer.dy = -y + this.pointer.oy;

    // movementXY
    if (this.store.x === null) {
      this.store.x = sx;
      this.store.y = sy;
    } else {
      this.pointer.mx = sx - this.store.x;
      this.pointer.my = sy - this.store.y;
      this.store.x = sx;
      this.store.y = sy;
    }

    this.emit("drag", this.pointer);
  }
}
