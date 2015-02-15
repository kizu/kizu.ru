module.exports = (BasePlugin) ->
    class MetadefaultsPlugin extends BasePlugin
        name: 'metadefaults'

        config:
            # TODO: options for disabling date and not rewriting url because of it
            date: true

            # TODO: options for disabling categories?
            categories: true

            # TODO: should I move this from the “routes” plugin?
            routes: {}

        renderBefore: (opts) ->
            config = @config
            docpad = @docpad
            medaDateRegex = ///([0-9]{4}-[0-9]{2}-[0-9]{2})-///

            metadataFiles = {}

            this.docpad.getCollection('documents').forEach (document) ->
                newOutPath = document.get('outPath')
                newUrl = document.get('url')
                docmentAttrs = document.attributes
                dateString = docmentAttrs.relativeBase.match(medaDateRegex)
                dateString = dateString && dateString[1]

                if dateString
                    document.setMeta { date: new Date(dateString) }

                    newOutPath = newOutPath.replace(dateString + '-', '')
                    newUrl = newUrl.replace(dateString + '-', '')

                    document.set('outPath', newOutPath)
                    document.setUrl(newUrl)

                # Set the metadata defaults from the associated metadata.json
                # Works now only when placed in the same directory
                # If there is a `lang` metadata set, then if there is an object witj
                #   and appropriate key as a value, use it instead.
                metadata = metadataFiles[docmentAttrs.fullDirPath]
                unless metadata
                    metadataFile = null
                    try
                        metadataFile = require(docmentAttrs.fullDirPath + '/_metadata.json')

                    if metadataFile
                        metadata = metadataFile
                        metadataFiles[docmentAttrs.fullDirPath] = metadata

                if metadata
                    actualMetadata = {}
                    for key, value of metadata
                        actualMetadata[key] = value
                        if typeof value == 'object'
                            value_lang = value[document.getMeta('lang')]
                            if value_lang
                                actualMetadata[key] = value_lang

                    document.setMetaDefaults(actualMetadata)
