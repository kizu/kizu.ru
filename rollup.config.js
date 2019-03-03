import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/js/index.js',
  output: {
    file: './build/hugo/static/j/scripts.js',
    format: 'iife',
  },
  plugins: [
    babel({
      exclude: [
        './src/js/prism.js',
      ],
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    terser(),
  ],
}
