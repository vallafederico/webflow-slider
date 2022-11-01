(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/.pnpm/prefix@1.0.0/node_modules/prefix/index.js
  var require_prefix = __commonJS({
    "node_modules/.pnpm/prefix@1.0.0/node_modules/prefix/index.js"(exports, module) {
      var style = typeof document != "undefined" ? document.createElement("p").style : {};
      var prefixes = ["O", "ms", "Moz", "Webkit"];
      var upper = /([A-Z])/g;
      var memo = {};
      function prefix(key) {
        key = key.replace(/-([a-z])/g, function(_, char) {
          return char.toUpperCase();
        });
        if (style[key] !== void 0)
          return key;
        var Key = key.charAt(0).toUpperCase() + key.slice(1);
        var i = prefixes.length;
        while (i--) {
          var name = prefixes[i] + Key;
          if (style[name] !== void 0)
            return name;
        }
        return key;
      }
      function prefixMemozied(key) {
        return key in memo ? memo[key] : memo[key] = prefix(key);
      }
      function prefixDashed(key) {
        key = prefix(key);
        if (upper.test(key)) {
          key = "-" + key.replace(upper, "-$1");
          upper.lastIndex = 0;
        }
        return key.toLowerCase();
      }
      module.exports = prefixMemozied;
      module.exports.dash = prefixDashed;
    }
  });

  // src/slider.js
  var import_prefix = __toESM(require_prefix(), 1);

  // src/utils.js
  function clamp(min, max, num) {
    return Math.min(Math.max(num, min), max);
  }

  // src/slider.js
  var SliderTrigger = class {
    constructor(name = "data-slider='wrap'") {
      this.name = `[${name}]`;
      this.items = document.querySelectorAll(this.name);
      this.init();
    }
    init() {
      for (const item of this.items)
        new Slider(item);
    }
  };
  var tPrefix = (0, import_prefix.default)("transform");
  var Slider = class {
    constructor(element) {
      this.element = element;
      this.container = this.element.querySelector('[data-slider="container"]');
      this.arrows = {
        left: this.element.querySelector('[data-slider="left"]'),
        right: this.element.querySelector('[data-slider="right"]')
      };
      this.dots = {
        wrapper: this.element.querySelector('[data-slider="dots"]'),
        dots: [...this.element.querySelector('[data-slider="dots"]').children]
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
        previous: 0
      };
      this._factor = 15e-4;
      this._damping = 0.95;
      this.init();
    }
    init() {
      this.initDom();
      this.onResize();
      this.initEvents();
      this.slide();
    }
    initDom() {
      const dotsToAdd = this.slidesElements.length - this.dots.dots.length;
      for (let i = 0; i < dotsToAdd; i++)
        this.dots.wrapper.appendChild(this.dots.dots[1].cloneNode(true));
      this.dots = {
        dots: [...this.element.querySelector('[data-slider="dots"]').children]
      };
    }
    calc() {
      this.movement += this.speed;
      this.speed *= this._damping;
      if (!this.isClicked) {
        this.rounded = Math.round(this.movement);
        let diff = this.rounded - this.movement;
        this.movement += Math.sign(diff) * Math.pow(Math.abs(diff), 0.75) * 0.025;
      }
      this.movement = clamp(-this.fullWidth / this.slideWidth, 0, this.movement);
      this.s.current = Math.abs(Math.round(this.movement));
      this.position = this.movement * this.slideWidth;
    }
    slide() {
      this.calc();
      this.container.style[tPrefix] = `translateX(${this.position}px)`;
      window.requestAnimationFrame(this.slide.bind(this));
    }
    onResize(element) {
      this.slideWidth = this.slidesElements[0].getBoundingClientRect().width;
      const { width } = this.container.getBoundingClientRect();
      this.fullWidth = width - this.slideWidth;
    }
    initEvents() {
      new ResizeObserver(this.onResize.bind(this)).observe(this.element);
      if ("ontouchmove" in window) {
        this.element.addEventListener("touchstart", this.mouseDown.bind(this));
        this.element.addEventListener("touchmove", this.mouseMove.bind(this));
        this.element.addEventListener("touchend", this.mouseUp.bind(this));
      } else {
        this.element.addEventListener("mousedown", this.mouseDown.bind(this));
        this.element.addEventListener("mousemove", this.mouseMove.bind(this));
        this.element.addEventListener("mouseup", this.mouseUp.bind(this));
      }
      document.addEventListener("mouseleave", () => {
        this.isClicked = false;
        this.countSlides();
      });
      this.arrows.left.addEventListener("click", () => this.prevSlide());
      this.arrows.right.addEventListener("click", () => this.nextSlide());
    }
    nextSlide() {
      this.speed = 0;
      this.speed -= 0.08;
    }
    prevSlide() {
      this.speed = 0;
      this.speed += 0.08;
    }
    mouseDown() {
      this.isClicked = true;
    }
    mouseMove(e) {
      if (!this.isClicked)
        return;
      this.speed = e.movementX * this._factor;
    }
    mouseUp() {
      this.isClicked = false;
      this.countSlides();
    }
    countSlides() {
      setTimeout(() => {
        this.handleDots();
        this.s.previous = this.s.current;
      }, 350);
    }
    handleDots() {
      this.dots.dots.forEach((dot) => dot.classList.remove("active"));
      this.dots.dots[this.s.current].classList.add("active");
    }
  };

  // src/app.js
  new SliderTrigger();
})();
