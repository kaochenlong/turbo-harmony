import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const banner = `/**
 * TurboHarmony Lite v${pkg.version}
 * (c) ${new Date().getFullYear()} TurboHarmony Contributors
 * @license MIT
 */`

export default [
  // ESM build (lite)
  {
    input: 'src/index.lite.js',
    external: ['alpinejs', '@hotwired/turbo'],
    output: {
      file: 'dist/turbo-harmony.lite.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [resolve(), commonjs()]
  },

  // Minified ESM build (lite)
  {
    input: 'src/index.lite.js',
    external: ['alpinejs', '@hotwired/turbo'],
    output: {
      file: 'dist/turbo-harmony.lite.min.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [resolve(), commonjs(), terser()]
  }
]