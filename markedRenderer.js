var marked = require('./node_modules/docpad-plugin-marked/node_modules/marked');
module.exports = {
    'markedRenderer': {
        link: function(href, title, text) {
            // Copypasta from marked.js
            if (this.options.sanitize) {
              try {
                var prot = decodeURIComponent(unescape(href))
                  .replace(/[^\w:]/g, '')
                  .toLowerCase();
              } catch (e) {
                return '';
              }
              if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
                return '';
              }
            }

            // Preprocessing all the arguments
            var preprocessors_args = {
                'text': text,
                'attributes': {
                    'class': '',
                    'href': href,
                    'title': title
                }
            };

            var preprocessors = [
                function(args){
                    args.attributes.class += ' link';
                    return args;
                },
                function(args){
                    if (args.attributes.href.match(/^@/)) {
                        args.attributes.href = 'https://twitter.com/' + args.attributes.href.substr(1);
                    }
                    return args;
                },
                function(args){
                    if (args.attributes.href.match(/^gh:/)) {
                        args.attributes.href = 'https://github.com/' + args.attributes.href.substr(3);
                    }
                    return args;
                },
                function(args){
                    var initialText = args.text;
                    args.text = args.text.replace(/^“([^”]+)”$/, '“<span class="link__inner">$1</span>”');
                    args.text = args.text.replace(/^«([^»]+)»$/, '«<span class="link__inner">$1</span>»');
                    if (initialText != args.text) {
                        args.attributes.class += ' link_wrapper';
                    }
                    return args;
                }
            ];

            for (var i = 0; i < preprocessors.length; i++) {
                preprocessors_args = preprocessors[i](preprocessors_args);
            };

            var attributes = ''
            for (attribute in preprocessors_args.attributes) {
                if (preprocessors_args.attributes.hasOwnProperty(attribute) && preprocessors_args.attributes[attribute]) {
                    attributes += ' ' + attribute + '="' + preprocessors_args.attributes[attribute] + '"';
                }
            }

            var out = '<a' + attributes + '>' + preprocessors_args.text + '</a>'

            return out;
        }
    }
}
