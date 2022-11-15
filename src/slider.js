import Prefix from "prefix";
import { clamp, lerp } from "./utils";
import Element from "./element";
import { initGui } from "./gui";
import Mouse from "./input-events";

initGui();

// trigger — !! put out
export default class SliderTrigger {
  constructor(name = "data-slider='wrap'") {
    this.name = `[${name}]`;
    this.items = document.querySelectorAll(this.name);
    // FAILSAFE — no slider detected
    this.init();
  }

  init() {
    console.log("v2");
    for (const item of this.items) new Slider(item);
  }
}

/**
 * Slider Element
 */

const tPrefix = Prefix("transform");

class Slider extends Element {
  constructor(element) {
    super(element);
    this.element = element;
    this.container = this.element.querySelector('[data-slider="container"]');
    this.arrows = {
      left: this.element.querySelector('[data-slider="left"]'),
      right: this.element.querySelector('[data-slider="right"]'),
    };
    this.dots = {
      wrapper: this.element.querySelector('[data-slider="dots"]'),
      dots: [...this.element.querySelector('[data-slider="dots"]').children],
    };

    this.slidesElements = [...this.container.children];
    this.slidesNumber = this.slidesElements.length - 1;

    this.setup();
  }

  setup() {
    this.movement = 0;
    this.speed = 0;
    this.position = 0;
    this.adds = { current: 0, target: 0 };

    this.s = {
      current: 0,
      previous: 0,
    };

    // tweakable
    this._factor = 0.0013;
    this._damping = 0.95;
    this._arrowFactor = 0.06;
    this._snapping = 0.025;
    this._bounds = 0.3;

    this.init();
  }

  init() {
    this.initDom();
    this.onResize();
    this.initEvents();

    // this.render();
  }

  initDom() {
    // add right number of dots
    const dotsToAdd = this.slidesElements.length - this.dots.dots.length;
    for (let i = 0; i < dotsToAdd; i++)
      this.dots.wrapper.appendChild(this.dots.dots[1].cloneNode(true));

    this.dots = {
      dots: [...this.element.querySelector('[data-slider="dots"]').children],
    };

    // console.log("length", this.slidesElements.length, dotsToAdd);
  }

  /**
   * Loop
   */

  calc() {
    // Easing Calculation
    this.movement += this.speed;
    this.speed *= this._damping;

    // bounds
    if (this.movement > 0) {
      this.movement = lerp(this.movement, 0, this._bounds);
    }

    if (this.movement < -this.fullWidth / this.slideWidth) {
      this.movement = lerp(
        this.movement,
        -this.fullWidth / this.slideWidth,
        this._bounds
      );
    }

    // snap to position
    if (!this.isClicked) {
      this.rounded = Math.round(this.movement);

      // rounding test 1
      // let diff = this.rounded - this.movement;
      // const calc = Math.sign(diff) * Math.pow(Math.abs(diff), 0.75) * this._snapping;
      // this.movement += calc;

      //rounding test 2
      this.movement = lerp(this.movement, this.rounded, this._snapping);
    }

    // set current active slide
    this.s.current = Math.abs(Math.round(this.movement));

    // reparam position
    this.position = this.movement * this.slideWidth;
  }

  render() {
    if (!this.isInView) return; // check if is in view

    this.handleGUI();

    this.calc();
    this.handleSlideNumber();

    // slide
    this.container.style[tPrefix] = `translateX(${this.position}px)`;

    window.requestAnimationFrame(this.render.bind(this));
  }

  handleGUI() {
    const { GUI } = window;
    this._factor = GUI._factor;
    this._damping = GUI._damping;
    // this._arrowFactor = GUI._arrowFactor;
    this._snapping = GUI._snapping;
    this._bounds = GUI._bounds;
  }

  /**
   * Events
   */

  onResize(element) {
    this.slideWidth = this.slidesElements[0].getBoundingClientRect().width;
    const { width } = this.container.getBoundingClientRect();
    this.fullWidth = width - this.slideWidth;
  }

  initEvents() {
    // on mouse drag
    // if ("ontouchmove" in window) {
    //   this.element.addEventListener("touchstart", this.mouseDown.bind(this));
    //   this.element.addEventListener("touchmove", this.mouseMove.bind(this));
    //   this.element.addEventListener("touchend", this.mouseUp.bind(this));
    // } else {
    //   this.element.addEventListener("mousedown", this.mouseDown.bind(this));
    //   this.element.addEventListener("mousemove", this.mouseMove.bind(this));
    //   this.element.addEventListener("mouseup", this.mouseUp.bind(this));
    // }

    this.mouse = new Mouse(this.element);
    // this.mouse.on("down", this.mouseDown.bind(this));
    this.mouse.on("drag", this.mouseDrag.bind(this));
    // this.mouse.on("up", this.mouseUp.bind(this));

    // leave flag
    document.addEventListener("mouseleave", () => {
      this.isClicked = false;
    });

    // arrows click
    this.arrows.left.addEventListener("click", () => this.prevSlide());
    this.arrows.right.addEventListener("click", () => this.nextSlide());
  }

  // UI
  nextSlide() {
    // this.speed = 0;
    // this.speed -= this._arrowFactor;
    this.speed -= 0.07;
    // this.adds.target -= 0.02;
  }

  prevSlide() {
    // this.speed = 0;
    // this.speed += this._arrowFactor;
    this.speed += 0.07;
    // this.adds.target += 0.02;
  }

  // MOUSE
  mouseDown() {
    this.isClicked = true;
  }

  mouseMove(e) {
    // if (!this.isClicked) return;
    // this.speed = e.movementX * this._factor;
  }

  mouseDrag({ mx }) {
    // console.log("mx", mx);
    this.speed = mx * this._factor;
  }

  mouseUp() {
    this.isClicked = false;
  }

  /**
   * Manage Dom
   */

  handleSlideNumber() {
    if (this.s.current === this.s.previous) return;

    this.handleActiveDot();
    this.handleActiveSlide();
    this.s.previous = this.s.current;
  }

  handleActiveDot() {
    this.dots.dots.forEach((dot) => dot.classList.remove("active"));
    if (this.dots.dots[this.s.current]) {
      this.dots.dots[this.s.current].classList.add("active");
    }
  }

  handleActiveSlide() {
    this.slidesElements.forEach((dot) => dot.classList.remove("active"));
    if (this.slidesElements[this.s.current]) {
      this.slidesElements[this.s.current].classList.add("active");
    }
  }
}
