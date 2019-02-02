require("./prism.js");

window.mySearch = require("./search.js");

require("./pjax.js");

/*
  I really don't want any tracking stuff happening before the onload.
  I don't care about not very precise analytics, and want to have only my site's code to influence the DOMContentLoaded and Load events so it would be easier to understand them.
*/
window.onload = function() {
  require("./myfonts.js");
  require("./metrika.js");
}
