# DocPad Configuration File
# http://docpad.org/docs/config

docpadConfig = {
    # Skip files starting from underscore from scanning by DocPad
    ignoreCustomPatterns: /^_/

    plugins:
        markedrenderers: require('./markedrenderers.coffee')

        metadefaults:
            defaults:
                layout: 'default'
                categories: 'blog'

            routes:
                '/pages/': '/'
                '/posts/': '/%categories%/'

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
}

module.exports = docpadConfig
