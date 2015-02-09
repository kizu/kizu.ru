# DocPad Configuration File
# http://docpad.org/docs/config

docpadConfig = {
    plugins:
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
            this.docpad.getCollection('documents').forEach (document) ->
                # Rewrite `pages/` to the root and `posts/` to the `blog/`.
                newOutPath = document.get('outPath')
                    .replace('/pages/', '/')
                    .replace('/posts/', '/blog/')
                newUrl = document.get('url')
                    .replace('pages/', '')
                    .replace('posts/', 'blog/')
                document.set('outPath', newOutPath)
                document.setUrl(newUrl)

            this.docpad.getCollection('html').forEach (document) ->
                # Set the default layout
                document.setMetaDefaults(layout: 'default')
}

module.exports = docpadConfig
