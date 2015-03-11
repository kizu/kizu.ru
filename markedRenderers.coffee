marked = require('./node_modules/docpad-plugin-marked/node_modules/marked')

module.exports = {
    heading: [
        # Proper headers with cyrillic symbols
        (args) ->
            args.attributes.id = args.original.raw.toLowerCase().replace(/[^a-zа-я0-9_]+/g, '-')
            return args

        # Adding anchors
        (args) ->
            args.beforeContent = '<a class="header-anchor" href="#' + args.attributes.id + '"></a>'
            return args
    ]
    link: [
        # Adding `link` class
        (args) ->
            args.attributes.class += ' link'
            return args

        # Handling `@username` twitter links
        (args) ->
            args.attributes.href = args.attributes.href.replace(/^@/, 'https://twitter.com/')
            return args

        # Handling `gh:username` GitHub links
        (args) ->
            args.attributes.href = args.attributes.href.replace(/^gh:/, 'https://github.com/')
            return args

        # Wrapping quoted link content for better underlines
        (args) ->
            initialText = args.original.text
            args.original.text = args.original.text.replace(/^“([^”]+)”$/, '“<span class="link__inner">$1</span>”')
            args.original.text = args.original.text.replace(/^«([^»]+)»$/, '«<span class="link__inner">$1</span>»')
            if initialText != args.original.text
                args.attributes.class += ' link_wrapper'
            return args

        # Creating sidenotes for `href`s starting with `*`
        (args, options) ->
            if args.original.href[0] == '*'
                id = args.original.href.substr(1)

                args.before += '<span class="sidenote-wrapper">'

                args.attributes.class = 'sidenote-context'
                args.attributes.id = id
                args.attributes.href = '#' + id

                args.after  +=     '<span class="sidenote">'
                args.after  +=         '<span class="sidenote-misc"> (</span>'
                args.after  +=         marked(args.original.title, options).replace(/^\s*<p>\s*([\s\S]*\S)\s*<\/p>\s*$/, '$1')
                args.after  +=         '<span class="sidenote-misc">)</span>'
                args.after  +=     '</span>'

                args.after  +=     '<a class="sidenote-close" href="#x"></a>'
                args.after  += '</span>'

                args.attributes.title = null

            return args

    ]
}
