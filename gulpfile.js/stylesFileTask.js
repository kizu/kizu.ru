const gulp = require('gulp');
const tap = require('gulp-tap');
const shell = require('shelljs');
const log = require('fancy-log');

const rename = require('gulp-rename');

const csso = require('csso');
const csstree = require('css-tree');

const stylesFile = () => {
  return gulp.src('./src/css/**/main.css')
    .pipe(tap(file => {
      const ast = csstree.parse(file.contents.toString(), {
        filename: 'src/main.css',
        positions: true
      });

      csstree.walk(ast, {
        visit: 'Atrule',
        enter: (node, item, list) => {
          if (node.name === 'import') {
            let importName = '';
            csstree.walk(node, {
              visit: 'String',
              enter: node2 => {
                importName = node2.value.replace(/['"]/g, '');
              }
            });

            const importPath = file.base + '/' + importName;
            if (shell.test('-e', importPath)) {
              const importAst = csstree.parse(shell.cat(importPath).toString(), {
                filename: 'src/' + importName,
                positions: true
              });
              list.replace(item, importAst.children);
              // log(importPath)
            }
          }
        }
      });

      const compressedAst = csso.compress(ast);
      const newCSS = csstree.generate(compressedAst.ast, {
       sourceMap: true
      });
      const sourceMapAnnotation = '\n' +
        '/*# sourceMappingURL=data:application/json;base64,' +
        Buffer.from(newCSS.map.toString()).toString('base64') +
        ' */';

      file.contents = Buffer.from(newCSS.css + sourceMapAnnotation);
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./build/hugo/static/s/'));
};

module.exports = stylesFile;
