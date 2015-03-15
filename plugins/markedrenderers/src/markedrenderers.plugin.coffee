customAttributesCache = null

module.exports = (BasePlugin) ->
    class MarkedrenderersPlugin extends BasePlugin
        name: 'markedrenderers'

        config: {}

        renderBefore: (opts) ->
            config = @config

            selfClosingTags = ['br', 'hr', 'img']

            argumentNames = require('./argumentNames.json')

            # If no tagName, it is the same as the key.
            tagDefaults = {
                'code': {
                    'content': 'code',
                    'before': '<pre>',
                    'after': '</pre>\n'
                    'afterContent': '\n',
                    'defaultHandler': (args, options) ->
                        escape = (html) ->
                            return html
                                .replace(/&(?!#?\w+;)/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#39;')

                        if options.highlight
                            out = options.highlight(args.original.code, args.original.lang)
                            if out != null && out != code
                              escaped = true
                              args.original.code = out

                        if !escaped
                            args.original.code = escape(args.original.code)

                        if args.original.lang
                            args.attributes.class += ' ' + options.langPrefix + escape(args.original.lang)

                        return args
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
                    'defaultHandler': (args, options) ->
                        args.tagName = 'h' + args.original.level
                        args.attributes.id = options.headerPrefix + args.original.raw.toLowerCase().replace(/[^\w]+/g, '-')
                        return args
                },
                'hr': {
                    'after': '\n'
                }
                'list': {
                    'content': 'body',
                    'beforeContent': '\n',
                    'after': '\n',
                    'defaultHandler': (args) ->
                        args.tagName = args.original.ordered ? 'ol' : 'ul'
                        return args

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
                    'defaultHandler': (args) ->
                        args.beforeContent = ''
                        if args.original.header
                            args.beforeContent = '\n<thead>\n' + args.original.header + '</thead>'
                        args.beforeContent += '\n<tbody>\n'
                        args.afterContent = '</tbody>\n'
                        return args
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
                    'defaultHandler': (args) ->
                        args.tagName = args.original.flags.header ? 'th' : 'td'
                        if args.original.flags.align
                            args.attributes.style += 'text-align:' + args.original.flags.align + ';'
                        return args

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
                    'defaultHandler': (args, options) ->
                        # TODO: add `options.sanitize` checks here?
                        args.attributes.href = args.original.href
                        if args.original.title
                            args.attributes.title = args.original.title
                        return args
                },
                'image': {
                    'tagName': 'img',
                    'defaultHandler': (args, options) ->
                        args.attributes.src = args.original.href
                        if args.original.title
                            args.attributes.title = args.original.title
                        return args
                }
            }

            addTag = (args, options) ->
                name = args.tagName

                beforeContent = args.beforeContent || ''
                afterContent = args.afterContent || ''
                attributes = ''
                for attributeName, attributeValue of args.attributes
                    if attributeValue or attributeValue == ''
                        attributes += ' ' + attributeName + '="' + attributeValue.trim() + '"'

                if !args.tagName
                    return beforeContent + args.original[args.content] + afterContent
                else if selfClosingTags.indexOf(name) == -1
                    return '<' + name + attributes + '>' + beforeContent + args.original[args.content] + afterContent + '</' + name + '>'
                else
                    return '<' + name + attributes + (options.xhtml ? '/' : '') + '>'

            if !@docpad.config.plugins.marked
                @docpad.config.plugins.marked = {}

            if @docpad.config.plugins.marked && !@docpad.config.plugins.marked.markedRenderer
                @docpad.config.plugins.marked.markedRenderer = {}

            for renderer, handlers of config
                do (@docpad, renderer, handlers) ->
                    @docpad.config.plugins.marked.markedRenderer[renderer] = () ->
                        args = {
                            'original': {},
                            'before': '',
                            'after': '',
                            'attributes': {
                                'class': ''
                            }
                        };

                        # Merging stuff
                        for name, value of tagDefaults[renderer]
                            args[name] = value

                        # Setting tagName if absent to the name
                        if !args.tagName && args.tagName != ''
                            args.tagName = renderer


                        # Adding original arguments
                        for argument, index in arguments
                            args.original[argumentNames[renderer][index]] = argument;

                        # Running handlers
                        if args.defaultHandler
                            args = args.defaultHandler(args, this.options)
                        for handler in handlers
                            args = handler(args, this.options)

                        return args.before + addTag(args, this.options) + args.after
