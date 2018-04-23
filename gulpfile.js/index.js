// Build stuff
const gulp = require('gulp');
const tap = require('gulp-tap');

const log = require('fancy-log');
const spawn = require('child_process').spawn;
const del = require('del');

// Handling stuff
const shell = require('shelljs');

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
    .pipe(tap(file => {
      if (file.extname !== '.md') return;
      const relPath = file.history[0].replace(file.base + '/', '');
      const content = handleMarkdown(file.contents.toString(), relPath);
      file.contents = Buffer.from(content);
    }))
    .pipe(gulp.dest('./build/hugo/content/posts'));
};

const stylesSrc = () => {
  return gulp.src('./src/css/*', { since: gulp.lastRun(stylesSrc) })
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
    ['server', '--noHTTPCache', '-s', 'build/hugo'],
    { stdio: 'inherit' }
  );
  return hugoProcess;
};


// Watcher
const watchEverything = () => {
  gulp.watch('./src/hugo/**/*', hugoSrc);
  gulp.watch('./src/posts/**/*', documents);
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
gulp.task('buildForHugo', gulp.parallel(hugoSrc, documents, 'styles'));
gulp.task('prepareHugo', gulp.series(clean, 'buildForHugo'));
gulp.task('build', gulp.series('prepareHugo', hugoBuild));

gulp.task('buildandwatcheverything', gulp.series('buildForHugo', watchEverything));
gulp.task('watcheverything', watchEverything);
gulp.task('watch', gulp.series('prepareHugo', gulp.parallel(watchReloaded, hugoServer)));

gulp.task('default', gulp.series('watch'));
