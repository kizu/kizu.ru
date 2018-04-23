// Loading the fonts

//- Detect Woff2, via filamentgroup/woff2-feature-test and PRs to it
var supportsWoff2=function(A){if(!("FontFace"in A)||"function"!=typeof A.FontFace)return!1;var t=new FontFace("t",'url( "data:application/font-woff2;base64,d09GMgABAAAAAADcAAoAAAAAAggAAACWAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABk4ALAoUNAE2AiQDCAsGAAQgBSAHIBtvAcieB3aD8wURQ+TZazbRE9HvF5vde4KCYGhiCgq/NKPF0i6UIsZynbP+Xi9Ng+XLbNlmNz/xIBBqq61FIQRJhC/+QA/08PJQJ3sK5TZFMlWzC/iK5GUN40psgqvxwBjBOg6JUSJ7ewyKE2AAaXZrfUB4v+hze37ugJ9d+DeYqiDwVgCawviwVFGnuttkLqIMGivmDg" ) format( "woff2" )',{});return t.load()["catch"](function(){}),"loading"==t.status||"loaded"==t.status}(this);

/* Lazy loading the fonts */
var h = document.getElementsByTagName('head')[0];
var link = document.createElement('link');
link.href = '/s/extras' + (supportsWoff2 ? '2' : '') + '.css';
link.type = 'text/css';
link.rel = 'stylesheet';
h.appendChild(link);
