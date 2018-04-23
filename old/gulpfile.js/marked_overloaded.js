var marked = require('marked');

var selfClosingTags = ['br', 'hr', 'img'];

var argumentNames = require('./argumentNames.json');

// If no tagName, it is the same as the key.
var tagDefaults = {
    'code': {
        'content': 'code',
        'before': '<pre>',
        'after': '</pre>\n',
        'afterContent': '\n',
        'defaultHandler': function(args, options) {
            var escape = function(html) {
                return html
                    .replace(/&(?!#?\w+;)/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            }
            var escaped;
            if (options.highlight) {
                var out = options.highlight(args.original.code, args.original.lang);

                if (out != null && out != code) {
                    escaped = true;
                    args.original.code = out;
                }
            }

            if (!escaped) {
                args.original.code = escape(args.original.code);
            }

            if (args.original.lang) {
                args.attributes.class += ' ' + options.langPrefix + escape(args.original.lang);
            }

            return args;
        }
    },
    'blockquote': {
        'content': 'quote',
        'beforeContent': '\n',
        'after': '\n'
    },
    'html': {
        'tagName': '',
        'content': 'html'
    },
    'heading': {
        'content': 'text',
        'after': '\n',
        'defaultHandler': function(args, options) {
            args.tagName = 'h' + args.original.level;
            args.attributes.id = options.headerPrefix + args.original.raw.toLowerCase().replace(/[^\w]+/g, '-');
            return args;
        }
    },
    'hr': {
        'after': '\n'
    },
    'list': {
        'content': 'body',
        'beforeContent': '\n',
        'after': '\n',
        'defaultHandler': function(args) {
            args.tagName = args.original.ordered ? 'ol' : 'ul';
            return args;
        }

    },
    'listitem': {
        'tagName': 'li',
        'content': 'text',
        'after': '\n'
    },
    'paragraph': {
        'tagName': 'p',
        'content': 'text',
        'after': '\n'
    },
    'table': {
        'tagName': 'table',
        'content': 'body',
        'after': '\n',
        'defaultHandler': function(args) {
            args.beforeContent = '';
            if (args.original.header) {
                args.beforeContent = '\n<thead>\n' + args.original.header + '</thead>';
            }
            args.beforeContent += '\n<tbody>\n';
            args.afterContent = '</tbody>\n';
            return args;
        }
    },
    'tablerow': {
        'tagName': 'tr',
        'content': 'content',
        'beforeContent': '\n',
        'after': '\n'
    },
    'tablecell': {
        'content': 'content',
        'after': '\n',
        'defaultHandler': function(args) {
            args.tagName = args.original.flags.header ? 'th' : 'td';
            if (args.original.flags.align) {
                args.attributes.style += 'text-align:' + args.original.flags.align + ';';
            }
            return args;
        }

    },
    'strong': {
        'content': 'text'
    },
    'em': {
        'content': 'text'
    },
    'codespan': {
        'tagName': 'code',
        'content': 'text'
    },
    'del': {
        'content': 'text'
    },
    'link': {
        'tagName': 'a',
        'content': 'text',
        'defaultHandler': function(args, options) {
            // TODO: add `options.sanitize` checks here?
            args.attributes.href = args.original.href;
            if (args.original.title) {
                args.attributes.title = args.original.title;
            }
            return args;
        }
    },
    'image': {
        'tagName': 'img',
        'defaultHandler': function(args, options) {
            args.attributes.src = args.original.href;
            if (args.original.title) {
                args.attributes.title = args.original.title;
            }
            return args;
        }
    }
}

var addTag = function(args, options) {
    var name = args.tagName;

    var beforeContent = args.beforeContent || '';
    var afterContent = args.afterContent || '';
    var attributes = '';

    for (attributeName in args.attributes) {
        var attributeValue = args.attributes[attributeName];
        if (attributeValue || (attributeValue == '' && attributeName != 'class')) {
            attributes += ' ' + attributeName + '="' + attributeValue.trim() + '"';
        }
    }

    if (!args.tagName) {
        return beforeContent + args.original[args.content] + afterContent;
    } else if (selfClosingTags.indexOf(name) == -1) {
        return '<' + name + attributes + '>' + beforeContent + args.original[args.content] + afterContent + '</' + name + '>';
    } else {
        return '<' + name + attributes + (options.xhtml ? '/' : '') + '>';
    }
}

var compileRenderer = function(renderer, handlers, options) {
    options = options || {}
    return function () {
        var args = {
            'original': {},
            'before': '',
            'after': '',
            'attributes': {
                'class': ''
            }
        };


        // Merging stuff
        for (name in tagDefaults[renderer]) {
          value = tagDefaults[renderer][name];
          args[name] = value;
        }

        // Setting tagName if absent to the name
        if (!args.tagName && args.tagName != '') {
            args.tagName = renderer;
        }

        // Adding original arguments
        for (var i = 0; i < arguments.length; i++) {
            args.original[argumentNames[renderer][i]] = arguments[i];
        }

        // Running handlers
        if (args.defaultHandler) {
            args = args.defaultHandler(args, options);
        }

        for (var i = 0; i < handlers.length; i++) {
            args = handlers[i](args, options);
        }

        return args.before + addTag(args, options) + args.after;
    }
}

module.exports = function(text, renderers, options) {
    var renderer = new marked.Renderer();

    var compiledRenderers = {};
    for (subrenderer in renderers) {
        var handlers = renderers[subrenderer];
        compiledRenderers[subrenderer] = compileRenderer(subrenderer, handlers, options);
    }

    var renderers_keys = Object.keys(compiledRenderers);
    for (var i = 0; i < renderers_keys.length; i++) {
        var key = renderers_keys[i];
        renderer[key] = compiledRenderers[key];
    }

    return marked(text, { 'renderer': renderer });
};
