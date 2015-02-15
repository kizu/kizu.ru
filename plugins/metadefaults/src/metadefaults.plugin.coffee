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
