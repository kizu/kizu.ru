var posthtml = require('posthtml');
var richtypo = require('richtypo');

var Hypher = require('hypher');
var hyphers = {
    'en': new Hypher(require('hyphenation.en-us')),
    'ru': new Hypher(require('hyphenation.ru'))
};

module.exports = function(text, lang, options) {
    var result = text;
    options = options || {};
    
    if (!options.simpleContent) {
        // Hyphenate HTML
        result = posthtml()
            .use( function(tree) {
                tree.walk(function(node) {
                    textNode = node;
                    if (typeof(textNode) == 'string') {
                        textNode = hyphers[lang].hyphenateText(textNode);
                        if (lang !== 'en') {
                            textNode = hyphers['en'].hyphenateText(textNode);
                        }
                    }
                    return textNode
                    });
                return tree
            })
            .process(result, { sync: true }).html
        // Removing the last soft hyphen when the result is short
        result = result.replace(new RegExp('\u00AD([a-zа-я]{1,4}[\.\,\:\?\!\…]?\s*</(?:p|h2|h3|h4)>)', 'gi'),'$1')
    }


    // Typography
    result = richtypo.rich(result, lang)

    // TODO: Make other abbreviations too, like JS, W3C etc.

    // Replace improper spaces from richtypo with proper
    result = result.replace(/<nobr>([^<]+)<\/nobr>/g, '<span class="nobr">$1</span>')
    result = result.replace(/&#8202;—<\/span>&#8202;/g, ' —</span><span class="thinsp"> </span>')
    result = result.replace(/( |&#8202;| | )—( |&#8202;| | )/g, '<span class="nobr"> —</span><span class="thinsp"> </span>')

    // TODO: find out is there a way to enable it without causing problems to screenreaders
    // if (!options.simpleContent) {
    //     // Replace soft hyphens with special spans
    //     result = result.replace(new RegExp('\u00AD', 'g'), '<span class="shy"></span>')
    // }
    return result;
};