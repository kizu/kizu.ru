# DocPad Configuration File
# http://docpad.org/docs/config

docpadConfig = {
    plugins:
        stylus:
            stylusLibraries:
                nib: false
                'autoprefixer-stylus': true
            stylusOptions:
                compress: true
                'include css': true

    events:
        renderBefore: () ->

            # Rewrite `pages/` to the root and `posts/` to the `blog/`.
            this.docpad.getCollection('documents').forEach (page) ->
                newOutPath = page.get('outPath')
                    .replace('/pages/', '/')
                    .replace('/posts/', '/blog/')
                newUrl = page.get('url')
                    .replace('pages/', '')
                    .replace('posts/', 'blog/')
                page.set('outPath', newOutPath)
                page.setUrl(newUrl)
}

module.exports = docpadConfig
