const myFonts = () => (function (href) {
  const link = document.createElement("link");
  link.href = href;
  link.rel = "stylesheet";
  document.head.appendChild(link);
})('//hello.myfonts.net/count/306f31');

export default myFonts;
