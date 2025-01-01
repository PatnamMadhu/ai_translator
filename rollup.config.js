import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';
import terser  from '@rollup/plugin-terser';  // Updated Terser plugin

const production = !process.env.ROLLUP_WATCH;  // Define production variable

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production
      }
    }),
    css({ output: 'bundle.css' }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    production && terser()  // Minify the code in production mode
  ],
  watch: {
    clearScreen: false
  }
};
