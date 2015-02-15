# Export Plugin
module.exports = (BasePlugin) ->
    # Define Plugin
    class MetadefaultsPlugin extends BasePlugin
        # Plugin name
        name: 'metadefaults'

        config:
            ololo: []

        # Render some content synchronously
        renderBefore: (opts) ->
            config = @config
            docpad = @docpad

            this.docpad.getCollection('documents').forEach (document) ->
                newOutPath = document.get('outPath')
                newUrl = document.get('url')
                medaDateRegex = ///[0-9]{4}-[0-9]{2}-[0-9]{2}///
                dateString = document.attributes.relativeBase.match(medaDateRegex)
                dateString = dateString && dateString[0]

                if dateString
                    document.setMeta { date: new Date(dateString) }

                    newOutPath = newOutPath.replace(dateString + '-', '')
                    newUrl = newUrl.replace(dateString + '-', '')

                    document.set('outPath', newOutPath)
                    document.setUrl(newUrl)
