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
                                        textNode = h_en.hyphenateText(textNode)
                                return textNode
                                )
                            return tree
                            )
                        .process(content, { sync: true }).html

                    # Removing the last soft hyphen when the result is short
                    content = content.replace(new RegExp('\u00AD([a-zа-я]{1,4}[\.\,\:\?\!\…]?\s*</(?:p|h2|h3|h4)>)', 'gi'),'$1')

                    # Typography
                    content = richtypo.rich(content, lang)

                    # TODO: Make other abbreviations too, like JS, W3C etc.

                    # Mark the starting abbrs
                    content = content.replace(new RegExp('(<(?:p|li)>|[\.\?\!\…](?:[  ]|&nbsp;))<abbr>([A-ZА-Я]+</abbr>)', 'g'),'$1<abbr class="starting">$2')

                    # Replace soft hyphens with special spans
                    content = content.replace(new RegExp('\u00AD', 'g'), '<span class="shy"></span>')

                    # Replacing the actual content
                    opts.content = content

        (args) ->
            return args
