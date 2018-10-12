// Build stuff
const gulp = require('gulp');
const tap = require('gulp-tap');
const rename = require('gulp-rename');

const log = require('fancy-log');
const spawn = require('child_process').spawn;
const del = require('del');

// Handling stuff
const handleMarkdown = require('./handleMarkdown.js');

const clean = done => del(['./out/**/*', './build/hugo/'], done);

// Copying hugo's src files to the build folder
const hugoSrc = () => {
  return gulp
    .src('./src/hugo/**/*', { since: gulp.lastRun(hugoSrc) })
    .pipe(gulp.dest('./build/hugo'));
};

// TODO: should handle .md and everything else differently
//       at least, watcher should run incrementally for docs,
//       but completely for dependant files.
const documents = () => {
  return gulp
    .src('./src/posts/**/*', { since: gulp.lastRun(documents) })
    .pipe(tap((file, t) => {
      if (file.extname !== '.md') return;
      const relPath = file.history[0].replace(file.base + '/', '');
      const content = handleMarkdown(file.contents.toString(), relPath, file.base);
      file.contents = Buffer.from(content);
    }))
    .pipe(gulp.dest('./build/hugo/content/posts'));
};

const examples = () => {
  return gulp
    .src('./src/posts/**/examples/*.html', { since: gulp.lastRun(examples) })
    .pipe(tap((file) => {
      file.contents = Buffer.from('<!DOCTYPE html><meta charset="utf-8"><title>Demo</title>\n' + file.contents.toString());
    }))
    .pipe(rename(path => {
      path.dirname = path.dirname.replace(/^\d{4}-\d{2}-\d{2}-(.+)/, "$1");
    }))
    .pipe(gulp.dest('./build/hugo/static/demos/'));
};

const pages = () => {
  return gulp
    .src('./src/pages/**/*', { since: gulp.lastRun(pages) })
    .pipe(tap(file => {
      if (file.extname !== '.md') return;
      const relPath = file.history[0].replace(file.base + '/', '');
      const content = handleMarkdown(file.contents.toString(), relPath, file.base);
      file.contents = Buffer.from(content);
    }))
    .pipe(gulp.dest('./build/hugo/content/'));
};

const stylesSrc = () => {
  return gulp.src('./src/css/**/*.css', { since: gulp.lastRun(stylesSrc) })
    .pipe(gulp.dest('./build/hugo/static/s/src/'));
}

const stylesFile = require('./stylesFileTask.js');

// External tasks
const hugoBuild = () => spawn(
  'hugo',
  ['-s', 'build/hugo', '-d', '../../out/'],
  { stdio: 'inherit' }
);

let hugoProcess;
const hugoServer = () => {
  hugoProcess = spawn(
    'hugo',
    ['server', '--buildDrafts', '--ignoreCache', '--disableFastRender', '-s', 'build/hugo'],
    { stdio: 'inherit' }
  );
  return hugoProcess;
};


// Watcher
const watchEverything = () => {
  gulp.watch('./src/hugo/**/*', hugoSrc);
  gulp.watch('./src/posts/**/*', documents);
  gulp.watch('./src/posts/**/examples/*.html', examples);
  gulp.watch('./src/pages/**/*', pages);
  gulp.watch('./src/css/**/*.css', gulp.parallel(stylesFile, stylesSrc));
}

const watchReloaded = () => {
  var process;
  const spawnChildren = callBack => {
    if (process) {
      process.kill();
    }
    process = spawn(
      'gulp',
      [process ? 'buildandwatcheverything' : 'watcheverything'],
      { stdio: 'inherit' }
    );
    if (callBack) {
      callBack();
    }
  }

  gulp.watch('./gulpfile.js/**/*', spawnChildren);
  spawnChildren();
}

// Defining tasks
gulp.task('styles', gulp.parallel(stylesFile, stylesSrc));
gulp.task('buildForHugo', gulp.parallel(hugoSrc, pages, documents, examples, 'styles'));
gulp.task('prepareHugo', gulp.series(clean, 'buildForHugo'));
gulp.task('build', gulp.series('prepareHugo', hugoBuild));

gulp.task('buildandwatcheverything', gulp.series('buildForHugo', watchEverything));
gulp.task('watcheverything', watchEverything);
gulp.task('watch', gulp.series('prepareHugo', gulp.parallel(watchReloaded, hugoServer)));

gulp.task('default', gulp.series('watch'));
