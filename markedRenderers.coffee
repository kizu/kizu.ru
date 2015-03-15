marked = require('./node_modules/docpad-plugin-marked/node_modules/marked')

module.exports = {
    heading: [
        # Adding attributes
        (args) ->
            customAttributes = args.original.text.match(/\s*\{:?([#.][^}]+|[a-z-]+=(?:['"]|&quot;|&#39;)[^}]*)\}\s*$/)
            if customAttributes
                args.original.text = args.original.text.substr(0, args.original.text.length - customAttributes[0].length)
                customAttributes = customAttributes[1]
                customClasses = customAttributes.match(/\.([^\s#.]+)/g)
                customID = customAttributes.match(/#(?!39;)([^\s.]+)/g)
                customAttributes = customAttributes.match(/[a-z-]+=(['"]|&quot;|&#39;).*\1/g)

                if customID
                    args.attributes.id = customID[0].substr(1)
                    args.hasCustomID = true

                if customClasses
                    for customClass in customClasses
                        args.attributes.class+= ' ' + customClass.substr(1)
                if customAttributes
                    for customAttribute in customAttributes
                        customAttributeName = customAttribute.match(/[a-z-]+/)[0]
                        customAttributeValue = customAttribute.match(/\=(['"]|&quot;|&#39;)(.*)\1/)[2]

                        if customAttributeName != 'class'
                            args.attributes[customAttributeName] = customAttributeValue
                        else
                            args.attributes.class+= ' ' + customAttributeValue
            return args

        # Proper headers with cyrillic symbols
        (args) ->
            unless args.hasCustomID
                args.attributes.id = args.original.text.toLowerCase().replace(/[^a-zа-я0-9_]+/g, '-')
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
