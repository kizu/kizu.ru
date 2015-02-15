# DocPad Configuration File
# http://docpad.org/docs/config

docpadConfig = {
    plugins:
        routing:
            routes:
                '/pages/': '/'
                '/posts/': '/blog/'

        multilang:
            languages: ['en', 'ru']
            defaultLanguage: 'ru'

        stylus:
            stylusLibraries:
                nib: false
                'autoprefixer-stylus': true
            stylusOptions:
                compress: true
                'include css': true

    events:
        renderBefore: () ->
            this.docpad.getCollection('html').forEach (document) ->
                # Set the default layout
                document.setMetaDefaults(layout: 'default')
}

module.exports = docpadConfig
