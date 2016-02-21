module.exports = function(document) {
    return document.content.replace(/<p>\[demo:(.+)\]<\/p>/g, function(string, name){
        var result = '';
        name = name.replace(/<[^>]+>/g, '');
        var demo = document.resources[name];
        if (!demo) {
            console.warn('No demo found for ', name);
        }

        if (demo.injected) {
            if (demo.screenshot) {
                result = 'Oh hey screenshot'
            } else {
                result += '<div class="Demo Demo_injected ' + (demo.seamless ? 'Demo_seamless' : 'Figure') + '" id="Demo_' + name + '">';
                result += demo.content;
                result += '</div>';
            }
        } else {
            result += '<div class="Demo Figure" id="Demo_' + name + '">';
            result += '<iframe class="Demo-Frame" ' + (demo.height ? ('style="height: ' + demo.height + '"') : 'height="240"') + ' width="100%" src="' + (demo.iframe_url ? demo.iframe_url : (demo.relName + '.html')) + '"></iframe>';
            result += '</div>';
        }

        return result;
    });
};
