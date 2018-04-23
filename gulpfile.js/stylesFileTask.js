const gulp = require('gulp');
const tap = require('gulp-tap');
const shell = require('shelljs');

const rename = require('gulp-rename');

const csso = require('csso');
const csstree = require('css-tree');

const stylesFile = () => {
  return gulp.src('./src/css/**/main.css')
    .pipe(tap(file => {
      const css = file.contents.toString();
      const ast = csstree.parse(css, {
        filename: 'src/main.css',
        positions: true
      });
      // FIXME: Replace most of this with a proper method, without toPlainObject.
      csstree.toPlainObject(ast)
      ast.children.map((node, index) => {
        if (node.name === 'import') {
          const importName = node.prelude.children[0].value.value.replace('"', '').replace('"', '');
          const importPath = file.base + '/' + importName;
          if (shell.test('-e', importPath)) {
            const importCSS = shell.cat(importPath).toString();
            const importAst = csstree.parse(importCSS, {
              filename: 'src/' + importName,
              positions: true
            });
            csstree.toPlainObject(importAst)
            ast.children.splice(index, 1, ...importAst.children)
          }
        }
      })
      csstree.fromPlainObject(ast);
      const compressedAst = csso.compress(ast);
      const newCSS = csstree.generate(compressedAst.ast, {
       sourceMap: true
      });
      const sourceMapAnnotation = '\n' +
        '/*# sourceMappingURL=data:application/json;base64,' +
        new Buffer(newCSS.map.toString()).toString('base64') +
        ' */';

      file.contents = Buffer.from(newCSS.css + sourceMapAnnotation);
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./build/hugo/static/s/'));
};

module.exports = stylesFile;
