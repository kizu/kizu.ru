module.exports = function(content, options) {
    return content.replace(/<p>\[par(?:<span class="shy"><\/span>|\u00AD)?tial:(.+)\]<\/p>/g, function(string, name){
        var result = '';
        name = name.replace(/<[^>]+>|\u00AD/g, '');
        var partial = options.document.resources[name];
        if (!partial) {
            console.warn('No partial found for', name);
        }
        if (!options.simpleContent) {
            if (partial.outdented) {
                result += '</div></div>';
            }
            if (!partial.layout) {
                if (partial.screenshot) {
                    result += '<input type="checkbox" class="Demo-Toggle" id="Demo_' + name + '_toggle" checked="checked" />';
                    result += '<div class="Demo Demo_injected' + (partial.framed ? ' Figure' : ' Demo_seamless') + ' with-screenshot" id="Demo_' + name +'">';
                    result += '<label class="Demo-Toggler" for="Demo_' + name + '_toggle"><a class="Demo-Toggler-Item Demo-Toggler-Checked">Screenshot</a><span class="Demo-Misc"> and </span><a class="Demo-Toggler-Item Demo-Toggler-Unchecked">Live demo</a></label>';
                    result += '<img class="Demo-Screenshot" src="' + partial.relName + '.png" alt="Screenshot" title="Screenshot" />';
                    result += '<div class="Demo-Content" title="Live demo">';
                    result += partial.content;
                    result += '</div>';
                    result += '</div>';
                } else if (!partial.raw) {
                    result += '<div class="Demo Demo_injected ' + (partial.framed ? 'Figure' : 'Demo_seamless') + '" id="Demo_' + name + '">';
                    result += partial.content;
                    result += '</div>';
                } else {
                    result += partial.content;
                }
            } else {
                result += '<div class="Demo Figure" id="Demo_' + name + '">';
                result += '<iframe class="Demo-Frame" ' + (partial.height ? ('style="height: ' + partial.height + '"') : 'height="240"') + ' width="100%" src="' + (partial.iframe_url ? partial.iframe_url : (partial.relName + '.html')) + '"></iframe>';
                result += '</div>';
            }
            if (partial.outdented) {
                result += '<div class="LiquidLayout"><div class="Main LiquidLayout-Content">';
            }
        } else {
            if (partial.screenshot) {
                result += '<p><img src="' + options.document.production_url + partial.relName + '.png" alt="Screenshot" title="Screenshot" /></p>';
            }
            result += '<p>' + (partial.screenshot ? '<small>' : '') + { "ru": "Посмотрите на демо", "en": "Look at the demo" }[options.document.lang] + ' <a href="' + options.document.production_url + '#Demo_' + name + '">' + { "ru": "встроенное в пост", "en": "embedded in the post" }[options.document.lang] + '</a>.' + (partial.screenshot ? '</small>' : '') + '</p>'
        }

        return result;
    });
};
