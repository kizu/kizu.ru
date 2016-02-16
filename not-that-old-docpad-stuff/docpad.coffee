# DocPad Configuration File
# http://docpad.org/docs/config

# TODO: make all this as a part of `multilang` plugin
loc_strings = require('./loc_strings.coffee')

docpadConfig = {
    # Using just coffee for local plugins
    warnUncompiledPrivatePlugins: false

    # Global stuff for templates
    templateData:
        site:
            url: 'http://kizu.ru'
            rootUrl: '/' # Could be overrided for different environments

        # Localized
        # TODO: optional second param for overriding lang
        loc: (string) ->
            loc_strings[string][@document.lang]


    # Skip files starting from underscore from scanning by DocPad
    ignoreCustomPatterns: /^_/

    plugins:
        stylus:
            stylusRequire: require('stylus')
            stylusOptions:
                sourcemap:
                    inline: true

        markedrenderers: require('./markedrenderers.coffee')

        metadefaults:
            defaults:
                layout: 'default'
                categories: 'blog'

            routes:
                '/scripts/': '/j/'
                '/styles/': '/s/'
                '/pages/': '/'
                '/posts/': '/%categories%/'

        multilang:
            languages: ['en', 'ru']
            defaultLanguage: 'ru'

}

module.exports = docpadConfig
