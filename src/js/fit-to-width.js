// TODO: Use optional data-attributes or hash for the header type?
var maxSize = 200;
var shrinkOnly = true;
var minSize = 20;
var transformTreshold = 1;
var wrapOnMinSize = true;

function get_fs(el) {
    return parseFloat(document.defaultView.getComputedStyle(el,null)
                               .getPropertyValue('font-size'));
}

function fix_contents(el) {
    var inner = el.children[0]; // Should I move it?
  
    // Reset the styles
    inner.style.display = "inline-block";
    inner.style.fontSize = "1em";
    inner.style.transform = 'scale(1)';
    inner.style.whiteSpace = 'nowrap';

    var initial_fs = get_fs(el);
    var localMaxSize = maxSize;
    if (shrinkOnly) {
        localMaxSize = initial_fs;
    }

    var elWidth = el.offsetWidth;
    var innerWidth = inner.offsetWidth;
    // The `% 2` thing is because the offsetWidth can be different
    // on the subpixel level in webkits
    var modifier = elWidth / (innerWidth - innerWidth % 2);
    var new_fs = initial_fs * modifier;

    var isAtMax = false;
    var isAtMin = false;
    if (new_fs > localMaxSize) {
        isAtMax = true;
        new_fs = localMaxSize;
    }
    if (new_fs < minSize) {
        isAtMin = true;
        new_fs = minSize;
        
        if (wrapOnMinSize) {
            inner.style.whiteSpace = 'normal';
        }
    }

    inner.style.fontSize = new_fs + "px";
  
    if (!isAtMax && !isAtMin) {
        if (Math.abs(elWidth - inner.offsetWidth) >= transformTreshold) {
            inner.style.fontSize = Math.floor(new_fs) + "px";
            modifier = elWidth / inner.offsetWidth;
            inner.style.transform = 'scale(' + modifier + ')';
        }
    } 
    inner.style.display = "block";
}

var els = document.getElementsByClassName('Heading');

function check_size() {
    Array.prototype.forEach.call(els, fix_contents);
}

check_size();

window.onresize = function(event) {
    check_size();
}
