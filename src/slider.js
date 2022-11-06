import Prefix from "prefix";
import { clamp, lerp } from "./utils";

// trigger — !! put out
export default class SliderTrigger {
  constructor(name = "data-slider='wrap'") {
    this.name = `[${name}]`;
    this.items = document.querySelectorAll(this.name);
    // FAILSAFE — no slider detected
    this.init();
  }

  init() {
    for (const item of this.items) new Slider(item);
  }
}

/**
 * Slider Element
 */

const tPrefix = Prefix("transform");

class Slider {
  constructor(element) {
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

    this.setup();
  }

  setup() {
    this.movement = 0;
    this.speed = 0;
    this.position = 0;

    this.s = {
      current: 0,
      previous: 0,
    };

    // tweakable
    this._factor = 0.0015;
    this._damping = 0.95;
    this._arrowFactor = 0.065;

    this.init();
  }

  init() {
    this.initDom();
    this.onResize();
    this.initEvents();

    // console.log(
    //   this.element,
    //   this.container,
    //   this.arrows,
    //   this.dots,
    //   this.slidesElements
    // );

    this.slide();
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

    // snap to position
    if (!this.isClicked) {
      this.rounded = Math.round(this.movement);
      let diff = this.rounded - this.movement;
      this.movement += Math.sign(diff) * Math.pow(Math.abs(diff), 0.75) * 0.025; // .025
    }

    // limit movement
    this.movement = clamp(-this.fullWidth / this.slideWidth, 0, this.movement);

    // set current active slide
    this.s.current = Math.abs(Math.round(this.movement));

    // console.log(this.s.current);

    // reparam position
    this.position = this.movement * this.slideWidth;
  }

  slide() {
    // GUI TEMP
    this._factor = 0.0015;
    this._damping = 0.95;
    this._arrowFactor = 0.065;
    // -----

    this.calc();

    this.handleSlideNumber();

    // slide
    this.container.style[tPrefix] = `translateX(${this.position}px)`;

    window.requestAnimationFrame(this.slide.bind(this));
  }

  /**
   * Events
   */

  onResize(element) {
    // console.log(this.element.clientWidth);

    this.slideWidth = this.slidesElements[0].getBoundingClientRect().width;

    const { width } = this.container.getBoundingClientRect();
    this.fullWidth = width - this.slideWidth;
  }

  initEvents() {
    new ResizeObserver(this.onResize.bind(this)).observe(this.element);

    // on mouse drag
    if ("ontouchmove" in window) {
      this.element.addEventListener("touchstart", this.mouseDown.bind(this));
      this.element.addEventListener("touchmove", this.mouseMove.bind(this));
      this.element.addEventListener("touchend", this.mouseUp.bind(this));
    } else {
      this.element.addEventListener("mousedown", this.mouseDown.bind(this));
      this.element.addEventListener("mousemove", this.mouseMove.bind(this));
      this.element.addEventListener("mouseup", this.mouseUp.bind(this));
    }

    // leave flag
    document.addEventListener("mouseleave", () => {
      this.isClicked = false;
      // this.countSlides();
    });

    // arrows click
    this.arrows.left.addEventListener("click", () => this.prevSlide());
    this.arrows.right.addEventListener("click", () => this.nextSlide());
  }

  // UI
  nextSlide() {
    // this.speed = 0;
    this.speed -= this._arrowFactor;
  }

  prevSlide() {
    // this.speed = 0;
    this.speed += this._arrowFactor;
  }

  // MOUSE
  mouseDown() {
    this.isClicked = true;
  }

  mouseMove(e) {
    if (!this.isClicked) return;
    this.speed = e.movementX * this._factor;
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
    this.dots.dots[this.s.current].classList.add("active");
  }

  handleActiveSlide() {
    this.slidesElements.forEach((dot) => dot.classList.remove("active"));
    this.slidesElements[this.s.current].classList.add("active");
  }
}
