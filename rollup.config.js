import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/js/index.js',
  output: {
    file: './build/hugo/assets/j/scripts.js',
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
    terser(),
  ],
}
