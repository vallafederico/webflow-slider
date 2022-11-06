// wrapper class for all element
export default class Element {
  constructor(element) {
    this.element = element;
    this.watch();
  }

  watch() {
    // intersection observer to watch the element
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // do something
          this.isInView = true;
          this.render();
          console.log("inview - ", this.isInView);
        } else {
          // do something else
          this.isInView = false;
          console.log("inview - ", this.isInView);
        }
      });
    });

    this.observer.observe(this.element);

    // resize observer to watch the element
    new ResizeObserver(this.onResize.bind(this)).observe(this.element);
  }
}
