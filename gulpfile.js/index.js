// Requires
var fs = require('fs');
var express = require('express');

var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var foreach = require('gulp-foreach');
var data = require('gulp-data');
var each = require('each-done');
var source = require('vinyl-source-stream');

var jade = require('gulp-jade');
var stylus = require('stylus');
var posthtml = require('posthtml');
var yamlFront = require('yaml-front-matter');

var typography = require(process.cwd() + '/gulpfile.js/typography.js');
var marked_overloaded = require(process.cwd() + '/gulpfile.js/marked_overloaded.js');
var marked_renderers = require(process.cwd() + '/gulpfile.js/marked_renderers.js');

// Constants
var pathRegex = new RegExp([
        '^',
        '((?:[^\/]+\/)*)?',             // Path,            like `foo/bar/`
        '(?:(\\d{4}-\\d{2}-\\d{2})-)?', // Date,            like `2015-12-02`
        '(\\([^\\)]+\\)-)?',            // Categories       like `(issues old)`
        '(?!index)([^\/\\.\\_]+)',      // Slug             like `whatever-title`
        '(?:\/(index))?',               // Is in folder     like `/index`
        '(?:_(\\w{2}))?',               // Lang             like `en`
        '((?:\\.[^\\.\\/]+)+)',         // Extension[s]     like `.md`
        '$'
    ].join(''));

// Future options
var languages = ['ru', 'en']; // Default should be `['en']`
var defaultLanguage = 'ru';   // Default should be `'en'`
var postsDir = './src/documents/posts/';

// Global stuff
var documents = [];
var loc_strings = {};

// Helper functions

var rerequire = function(path) {
    delete require.cache[require.resolve(path)];
    return require(path);
}

var storeDocument = function(stream, file) {
    var document = {};

    document.relativePath = file.relative;

    var pathData = file.relative.match(pathRegex);
    if (pathData) {
        document.path = pathData[1];
        document.date = pathData[2];
        document.categories = pathData[3];
        document.slug = pathData[4];
        document.isInFolder = pathData[5];
        document.lang = pathData[6];
        document.extension = pathData[7];
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
                document.resources.push(fileName);
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

    // Transform markdown to HTML
    // TODO: Move to its own process, so we could watch just renderers and stuff
    // TODO: get the title from markdown
    document.rawContent = file.contents.toString();
    document.YAMLmetadata = yamlFront.loadFront(document.rawContent);
    var content = document.YAMLmetadata.__content;
    delete document.YAMLmetadata.__content;

    document.content = marked_overloaded(content, marked_renderers);
    var splittedContent = document.content.split('\n');
    // TODO: can this be made using just one posthtml pass?
    var firstLine = posthtml().process(splittedContent[0], { sync: true });
    if (firstLine.tree[0].tag == 'h1') {
        document.titleHTML = splittedContent[0];
        firstLine = posthtml()
            .use( function(tree) {
                var result = '';
                tree.walk(function(node) {
                    textNode = node
                    if (typeof(textNode) == 'string') {
                        result += textNode;
                    }
                    return textNode
                    });
                return result
            })
            .process(document.titleHTML, { sync: true });

        document.title = firstLine.html;
        splittedContent.splice(0, 1);
        document.content = splittedContent.join('\n');
    }

    document.content = typography(document.content, document.lang);

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
        'loc': function(locString, lang){ return loc_strings[locString] && loc_strings[locString][lang || document.lang] || 'No loc string found!' }
    };
    return gulp.src('./src/layouts/default.jade')
        .pipe(data(function(){return jadeData}))
        .pipe(jade({ pretty: true }))
        .pipe(rename({ dirname: document.url }))
        .pipe(rename({ basename: 'index' }))
        .pipe(gulp.dest('./out/'));
};

var writeResources = function(document) {
    // TODO: properly detect those resources to write and probably rename
    return gulp.src([postsDir + document.initialUrl + '*', '!' + postsDir + document.initialUrl + '*.md', '!' + postsDir + document.initialUrl + '_*'])
        .pipe(rename({ dirname: document.url }))
        .pipe(gulp.dest('./out/'));
};

var buildStylus = function(stream, stylesheet) {
    style = stylus(stylesheet.contents.toString())
        .set('filename', stylesheet.base + stylesheet.relative)
        .set('include css', true)
    if (stylesheet.relative === 'style.styl') {
        style.set('sourcemap', { 'inline': true });
    }
    style.render(function(err, output) {
        if (err) {
            console.error(err);
        } else {
            var stylesheetStream = source(stylesheet.relative.replace('.styl', '.css'));
            stylesheetStream.end(output);
            stylesheetStream.pipe(gulp.dest('./out/s/'));
        }
    });
    return stream;
};

// Tasks

gulp.task('collect-documents', function(done) {
    documents = [];

    return gulp
        .src(postsDir + '**/*.md')
        .pipe(foreach(storeDocument));

});

gulp.task('write-documents', function(done) {
    loc_strings = rerequire(process.cwd() + '/gulpfile.js/loc_strings.json');
    each(documents, writeDocument, done);
});

gulp.task('write-resources', function(done) {
    each(documents, writeResources, done);
});

gulp.task('documents', function(done) {
    runSequence('collect-documents', ['write-documents', 'write-resources'], done);
});

gulp.task('styl', function(done) {
    return gulp
        .src('./src/documents/styles/*.styl')
        .pipe(foreach(buildStylus));
});

gulp.task('scripts', function(done) {
    return gulp
        .src('./src/documents/scripts/*')
        .pipe(gulp.dest('./out/j/'));
});

gulp.task('express', function() {
  express().use(express.static('./out/')).listen(4000);
  gutil.log('Server is running on http://localhost:4000');
});

gulp.task('build', ['documents', 'styl', 'scripts']);

gulp.task('watch', ['express', 'build'], function() {
    // Watching documents and rebuilding all of them
    watch('./src/documents/posts/**/*', function() { gulp.start('documents'); });

    // Watch jade layouts and rewrite documents without recollecting
    watch(['./src/layouts/*.jade', './gulpfile.js/loc_strings.json'], function() { gulp.start('write-documents'); });

    // Watch .styl files and rebuild all the styles
    watch(['./src/documents/styles/*.styl', './src/styl/**/*.styl'], function() { gulp.start('styl'); });
});

gulp.task('default', ['watch']);
