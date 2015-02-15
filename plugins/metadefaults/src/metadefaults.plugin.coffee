# Export Plugin
module.exports = (BasePlugin) ->
    # Define Plugin
    class MetadefaultsPlugin extends BasePlugin
        # Plugin name
        name: 'metadefaults'

        config:
            # TODO: options for disabling date and not rewriting url because of it
            date: true

        # Render some content synchronously
        renderBefore: (opts) ->
            config = @config
            docpad = @docpad
            medaDateRegex = ///([0-9]{4}-[0-9]{2}-[0-9]{2})-///

            this.docpad.getCollection('documents').forEach (document) ->
                newOutPath = document.get('outPath')
                newUrl = document.get('url')
                dateString = document.attributes.relativeBase.match(medaDateRegex)
                dateString = dateString && dateString[1]

                if dateString
                    document.setMeta { date: new Date(dateString) }

                    newOutPath = newOutPath.replace(dateString + '-', '')
                    newUrl = newUrl.replace(dateString + '-', '')

                    document.set('outPath', newOutPath)
                    document.setUrl(newUrl)
