import GUI from "lil-gui";

const gui = new GUI();

const myObject = {
  myBoolean: true,
  myNumber: 1,
};

gui.add(myObject, "myBoolean"); // Checkbox
gui.add(myObject, "myNumber"); // Number Field

window.GUI = gui;
