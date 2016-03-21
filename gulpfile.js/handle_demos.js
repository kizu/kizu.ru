module.exports = function(document) {
    document.content = document.content.replace(/<p>\[demo:(.+)\]<\/p>/g, function(string, name){
        var result = '';
        name = name.replace(/<[^>]+>/g, '');
        var demo = document.resources[name];
        if (!demo) {
            console.warn('No demo found for ', name);
        }

        if (demo.injected) {
            if (demo.screenshot) {
                result += '<input type="checkbox" class="Demo-Toggle" id="Demo_' + name + '_toggle" checked="checked" />';
                result += '<div class="Demo Demo_injected with-screenshot ' + (demo.seamless ? 'Demo_seamless' : 'Figure') + '" id="Demo_' + name +'">';
                result += '<label class="Demo-Toggler" for="Demo_' + name + '_toggle"><a class="Demo-Toggler-Item Demo-Toggler-Checked">Screenshot</a><span class="Demo-Misc"> and </span><a class="Demo-Toggler-Item Demo-Toggler-Unchecked">Live demo</a></label>';
                result += '<img class="Demo-Screenshot" src="' + demo.relName + '.png" alt="Screenshot" title="Screenshot" />';
                result += '<div class="Demo-Content" title="Live demo">';
                result += demo.content;
                result += '</div>';
                result += '</div>';
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
