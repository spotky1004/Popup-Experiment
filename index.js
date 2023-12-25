import testDoc from "./pages/testDoc.js";

const pop1 = testDoc.create(
  { reopenOnClose: true },
  { foo: 3, info: "You can't close this popup :D" }
);
const pop2 = testDoc.create(
  { x: 100, y: 500, dragableX: false },
  { foo: -100, info: "You can't drag this popup <- or ->" }
);

let t = -1;
setInterval(() => {
  t++;

  pop1.setVar("foo", pop1.getVar("foo") + 1);
  pop1.x = (7 * t) % (window.outerWidth - pop1.width);
  pop1.y = 300 + 100 * Math.sin(t / 5);

  pop2.setVar("foo", pop2.getVar("foo") + Math.floor(Math.random() * 101 - 50));
}, 30);
