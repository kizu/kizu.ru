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
                'before': '',
                'after': '',
                'attributes': {
                    'class': '',
                    'href': href,
                    'title': title
                }
            };

            var markedOptions = this.options;

            var preprocessors = [
                // Adding `link` class
                function(args){
                    args.attributes.class += ' link';
                    return args;
                },

                // Handling `@username` twitter links
                function(args){
                    if (args.attributes.href.match(/^@/)) {
                        args.attributes.href = 'https://twitter.com/' + args.attributes.href.substr(1);
                    }
                    return args;
                },

                // Handling `gh:username` GitHub links
                function(args){
                    if (args.attributes.href.match(/^gh:/)) {
                        args.attributes.href = 'https://github.com/' + args.attributes.href.substr(3);
                    }
                    return args;
                },

                // Wrapping quoted link content for better underlines
                function(args){
                    var initialText = args.text;
                    args.text = args.text.replace(/^“([^”]+)”$/, '“<span class="link__inner">$1</span>”');
                    args.text = args.text.replace(/^«([^»]+)»$/, '«<span class="link__inner">$1</span>»');
                    if (initialText != args.text) {
                        args.attributes.class += ' link_wrapper';
                    }
                    return args;
                },

                // Creating sidenotes for “hrefs” starting with `*`
                function(args){
                    if (args.attributes.href[0] === '*') {
                        var id = args.attributes.href.substr(1);

                        args.before += '<span class="sidenote-wrapper">';

                        args.attributes.class = 'sidenote-context';
                        args.attributes.id = id;
                        args.attributes.href = '#' + id;

                        args.after  +=     '<span class="sidenote">';
                        args.after  +=         '<span class="sidenote-misc"> (</span>';
                        args.after  +=         marked(args.attributes.title, markedOptions).replace(/^\s*<p>\s*([\s\S]*\S)\s*<\/p>\s*$/, '$1');
                        args.after  +=         '<span class="sidenote-misc">)</span>';
                        args.after  +=     '</span>';

                        args.after  +=     '<a class="sidenote-close" href="#x"></a>';
                        args.after  += '</span>';

                        args.attributes.title = null;
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
                    attributes += ' ' + attribute + '="' + preprocessors_args.attributes[attribute].trim() + '"';
                }
            }

            return preprocessors_args.before + '<a' + attributes + '>' + preprocessors_args.text + '</a>' + preprocessors_args.after;
        }
    }
}
