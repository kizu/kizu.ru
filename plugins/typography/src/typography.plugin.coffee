posthtml = require('posthtml')

Hypher = require('hypher')
english = require('hyphenation.en-us')
russian = require('hyphenation.ru')
h_en = new Hypher(english)
h_ru = new Hypher(russian)

richtypo = require('richtypo')

module.exports = (BasePlugin) ->
    class TypographyPlugin extends BasePlugin
        name: 'typography'

        config: {}

        # Render the document
        renderDocument: (opts) ->
            # Prepare
            { extension, file } = opts

            # Handle
            if file.type is 'document'  and  extension is 'html'
                content = opts.content
                if content.substr(0, 15) != '<!DOCTYPE html>'
                    lang = file.getMeta('lang')
                    content = posthtml()
                        .use( (tree) ->
                            tree.walk((node) ->
                                textNode = node
                                if (typeof(textNode) == 'string' && !/^\n\s*$/.test(textNode))
                                    if lang == 'ru'
                                        textNode = h_ru.hyphenateText(textNode)
                                    else
                                        textNode = h_ru.hyphenateText(textNode)

                                    textNode = richtypo.rich(textNode, lang)

                                return textNode
                                )
                            return tree
                            )
                        .process(content, { sync: true }).html

                    # Handling the last characters of paragraphs
                    # content = content.replace(
                    #     new RegExp('(\u00AD| ?)([а-яa-z_-]{1,6}[\.\?\!]?<\/p>)', 'gi'),
                    #     (m, p1, p2) ->
                    #         return (p1 == ' ' ? '&nbsp;' : '') + p2.replace(new RegExp('\u00AD', 'g'), '')
                    #     )

                    # Replace soft hyphens with special spans
                    opts.content = content.replace(new RegExp('\u00AD', 'g'), '<span class="shy"></span>')

        (args) ->
            return args
