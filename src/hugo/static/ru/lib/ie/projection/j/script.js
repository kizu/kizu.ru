/*_*/

/*
	Mootools-1.2.4-core is up to DomReady
*/

document.documentElement.id = "js";

/* Init Highlight.js */
hljs.tabReplace = '    ';
hljs.initHighlightingOnLoad();

/* on Domload */
window.addEvent('domready', function() {

	/* bad bad code that need to go classy */
	var slides = $$('.slide');
	var slidesWrap = $('Presentation');
	var isProjection = function() {
		if (slides.length > 1) {
			return slides[1].getStyle('page-break-before') == 'always';
		} else {
			return false;
		}
	};
	window.addEvent('keydown', function(event){
		if (isProjection()) {
		    if (event.key == 'down' || event.key == 'right') {
				var scrollOffset = slidesWrap.getScroll().y;
				var slideHeight = slides[0].getSize().y;
				var current = scrollOffset/slideHeight;
				if (current+1 < slides.length) {
					slidesWrap.scrollTo(0, (current+1)*slideHeight);
				}
			}
		    if (event.key == 'up' || event.key == 'left') {
				var scrollOffset = slidesWrap.getScroll().y;
				var slideHeight = slides[0].getSize().y;
				var current = Math.floor(scrollOffset/slideHeight);
				if (current+1 > 0) {
					slidesWrap.scrollTo(0, (current-1)*slideHeight);
				}
			}
			
		}
	});

});
