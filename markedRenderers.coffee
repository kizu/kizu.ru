marked = require('./node_modules/marked')

posthtml = require('posthtml')

Hypher = require('./node_modules/hypher')
english = require('./node_modules/hyphenation.en-us')
russian = require('./node_modules/hyphenation.ru')
h_en = new Hypher(english)
h_ru = new Hypher(russian)

# Adding attributes
handleAttributes = (args) ->
    content = args.original.text && 'text' || 'code'
    customAttributes = args.original[content].match(/\s*\{:?([#.][^}]+|[a-z-]+=(?:['"]|&quot;|&#39;)[^}]*)\}\s*$/)
    if customAttributes
        args.original[content] = args.original[content].substr(0, args.original[content].length - customAttributes[0].length)
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


module.exports = {
    paragraph: [
        (args) -> handleAttributes(args)

        (args) ->
            ph = posthtml()
                .use( (tree) ->
                    tree.walk((node) ->
                        if (typeof(node) == 'string' && !/^\n\s*$/.test(node))
                            return h_ru.hyphenateText(h_en.hyphenateText(node))
                        else
                            return node
                        )
                    return tree
                    )
                .process(args.original.text, { sync: true })
            args.original.text = ph.html.replace(new RegExp('\u00AD', 'g'), '<span class="shy"></span>')
            return args

        # TODO: Add typography here
        # (args) ->
        #     return args
    ]

    code: [
        (args) -> handleAttributes(args)
    ]

    heading: [
        (args) -> handleAttributes(args)

        # Apply linkless links as spans with classes
        (args) ->
            args.original.text = args.original.text.replace(/\[([^\]]+)\]\[([^\s\]]+(?:\s+[^\s\]]+)*)\]/g, '<span class="$2">$1</span>')
            return args

        # Apply typographic classes to first letters
        (args) ->
            if args.original.text[0].match(/[A-ZА-Я“«]/)
                firstLetter = args.original.text[0]
                hang = 'm'
                alt = 'ss01 '

                if 'СC'.indexOf(firstLetter) > -1
                    alt = 'ss02 '
                if 'КТ'.indexOf(firstLetter) > -1
                    alt = 'ss04 '
                if '“'.indexOf(firstLetter) > -1
                    alt = ''

                if 'АAФДЗОOЖЭЯQSGZCС'.indexOf(firstLetter) > -1
                    hang = 'xs'
                if 'Ч'.indexOf(firstLetter) > -1
                    hang = 'l'
                if '“«'.indexOf(firstLetter) > -1
                    hang = 'quote'

                firstLetter = '<span class="' + alt + 'hang-' + hang + '">' + firstLetter + '</span>'
                args.original.text = firstLetter + args.original.text.slice(1)

            return args

        # Proper headers with cyrillic symbols
        (args) ->
            unless args.hasCustomID
                args.attributes.id = args.original.text.replace(/<(?:.|\n)*?>/gm, '').toLowerCase().replace(/[^a-zа-я0-9_]+/g, '-')
            return args

        # Adding anchors
        (args) ->
            args.beforeContent = '<a class="Header-Anchor" href="#' + args.attributes.id + '"></a>'
            return args
    ]

    link: [
        # Adding `link` class
        (args) ->
            args.attributes.class += ' Link'
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
            args.original.text = args.original.text.replace(/^“([^”]+)”$/, '“<span class="Link-Inner">$1</span>”')
            args.original.text = args.original.text.replace(/^«([^»]+)»$/, '«<span class="Link-Inner">$1</span>»')
            if initialText != args.original.text
                args.attributes.class += ' Link_wrapper'
            return args

        # Creating sidenotes for `href`s starting with `*`
        (args, options) ->
            if args.original.href[0] == '*'
                id = args.original.href.substr(1)

                args.before += '<span class="Sidenote-Wrapper">'

                args.attributes.class = 'Sidenote-Context'
                args.attributes.id = id
                args.attributes.href = '#' + id

                args.after  +=     '<span class="Sidenote">'
                args.after  +=         '<span class="Sidenote-Misc"> (</span>'
                args.after  +=         marked(args.original.title, options).replace(/^\s*<p(?: class="")?>\s*([\s\S]*\S)\s*<\/p>\s*$/, '$1')
                args.after  +=         '<span class="Sidenote-Misc">)</span>'
                args.after  +=     '</span>'

                args.after  +=     '<a class="Sidenote-Close" href="#x"></a>'
                args.after  += '</span>'

                args.attributes.title = null

            return args

    ]
}
