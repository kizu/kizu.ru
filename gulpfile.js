// Requires
var fs = require('fs');

var gulp = require('gulp');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var foreach = require('gulp-foreach');
var data = require('gulp-data');
var each = require('each-done');

var marked = require('marked');
var jade = require('gulp-jade');

// Constants
var pathRegex = new RegExp([
        '^',
        '((?:[^\/]+\/)*)?',             // Path,            like `foo/bar/`
        '(?:(\\d{4}-\\d{2}-\\d{2})-)?', // Date,            like `2015-12-02`
        '(\\([^\\)]+\\)-)?',            // Categories       like `(issues old)`
        '(?!index)([^\/\\.\\_]+)',      // Slug             like `whatever-title`
        '(?:\/(index))?',                   // Is in folder     like `/index`
        '(?:_(\\w{2}))?',               // Lang             like `en`
        '((?:\\.[^\\.\\/]+)+)',         // Extension[s]     like `.md`
        '$'
    ].join(''));


// Future options

var defaultLanguage = 'ru'
var postsDir = './src/documents/posts/'

// Global stuff
var documents = [];


// Helper functions

var storeDocument = function(stream, file) {
    var document = {};

    document.relativePath = file.relative;

    var pathData = file.relative.match(pathRegex)
    if (pathData) {
        document.path = pathData[1]
        document.date = pathData[2]
        document.categories = pathData[3]
        document.slug = pathData[4]
        document.isInFolder = pathData[5]
        document.lang = pathData[6]
        document.extension = pathData[7]
    }

    document.initialUrl = (document.path || '') + (document.date && document.date + '-' || '') + (document.categories || '') + document.slug + '/';
    document.filename = (document.isInFolder || '') + (document.lang && '_' + document.lang || '') + document.extension;

    if (document.categories) {
        document.categories = document.categories.replace(/^\((.+)\)-$/, '$1').split(' ');
    } else {
        document.categories = ['blog'];
    }

    // TODO: properly handle filename and the case when the resources are not in dir
    if (document.isInFolder) {
        var directory = file.base + document.initialUrl;

        // TODO: rewrite this stuff hardly!
        var getResource = function(fileName) {
            if (document.lang !== 'en' && fileName === (document.isInFolder || '') + '_en' + document.extension) {
                if (!document.translations) {
                    document.translations = {};
                }
                document.translations.en = true;
            } else if (document.lang !== 'ru' && fileName === (document.isInFolder || '') + '_ru' + document.extension) {
                if (!document.translations) {
                    document.translations = {};
                }
                document.translations.ru = true;
            } else if (fileName.substr(fileName.length - 3) !== '.md' && fileName[0] !== '.') {
                if (!document.resources) {
                    document.resources = [];
                }
                document.resources.push(fileName)
            }
        };

        var resources = fs.readdirSync(directory);
        if (resources) {
            for (var i = 0; i < resources.length; i++) {
                getResource(resources[i]);
            }
        }

    }

    document.url = (document.lang != defaultLanguage ? document.lang + '/' : '') + document.categories.join('/') + '/' + document.slug + '/';

    document.content = marked(file.contents.toString());

    // console.log(document);
    documents.push(document);

    return stream;
};

var writeDocument = function(document) {
    var jadeData = {
        'documents': documents,
        'document': document,
        'config': {
            'defaultLanguage': defaultLanguage
        },
        'loc': function(locString){ return 'loc string for ' + locString; }
    };
    gulp.src('./src/layouts/default.jade')
        .pipe(data(() => jadeData))
        .pipe(jade({ pretty: true }))
        .pipe(rename({ dirname: document.url }))
        .pipe(rename({ basename: 'index' }))
        .pipe(gulp.dest('./out/'));
};

var writeResources = function(document) {
    // TODO: properly detect those resources to write and probably rename
    gulp.src([postsDir + document.initialUrl + '*', '!' + postsDir + document.initialUrl + '*.md', '!' + postsDir + document.initialUrl + '_*'])
        .pipe(rename({ dirname: document.url }))
        .pipe(gulp.dest('./out/'));
};

// Tasks

gulp.task('collect-documents', function() {
    documents = [];

    return gulp
        .src(postsDir + '**/*.md')
        .pipe(foreach(storeDocument));

});

gulp.task('write-documents', function(done) {
    each(documents, writeDocument, done);
});

gulp.task('write-resources', function(done) {
    each(documents, writeResources, done);
});

gulp.task('default', function(done) {
    runSequence('collect-documents', ['write-documents', 'write-resources'], done);
});
