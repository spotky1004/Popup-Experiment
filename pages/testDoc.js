import PopupGenerator from "../popup/PopupGenerator.js";

const vars = {
  foo: 0,
  info: ":D"
};

export default new PopupGenerator(
vars => String.raw`
<!DOCTYPE html>
<html lang="en">
<head>
  <title>testDoc.js - ${vars.foo}</title>
</head>
<body>
  <h1>This is testDoc.js</h1>
  <h2 id="foo">${vars.foo}</h2>
  <h2>${vars.info}</h2>
  <script>
    setInterval(() => {
      document.title = "testDoc.js - " + vars.foo;
      foo.innerText = vars.foo;
    }, 30);
  </script>
</body>
</html>
`,
{
  height: 300,
  focusLevel: 1,
  resizableWidth: false,
  resizableHeight: false,
},
vars
);
