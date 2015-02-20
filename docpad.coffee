# DocPad Configuration File
# http://docpad.org/docs/config

docpadConfig = {
    # Skip files starting from underscore from scanning by DocPad
    ignoreCustomPatterns: /^_/

    plugins:
        metadefaults:
            defaults:
                layout: 'default'

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
}

module.exports = docpadConfig
