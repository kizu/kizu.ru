const myFonts = id => (function (href) {
  const link = document.createElement("link");
  link.href = href;
  link.rel = "stylesheet";
  document.head.appendChild(link);
})('//hello.myfonts.net/count/' + id);

export default myFonts;
