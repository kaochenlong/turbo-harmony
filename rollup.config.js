import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const banner = `/**
 * TurboHarmony v${require('./package.json').version}
 * (c) ${new Date().getFullYear()} TurboHarmony Contributors
 * @license MIT
 */`

export default [
  // ESM build
  {
    input: 'src/index.js',
    external: ['alpinejs', '@hotwired/turbo'],
    output: {
      file: 'dist/turbo-harmony.esm.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [resolve(), commonjs()]
  },

  // CommonJS build
  {
    input: 'src/index.js',
    external: ['alpinejs', '@hotwired/turbo'],
    output: {
      file: 'dist/turbo-harmony.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named'
    },
    plugins: [resolve(), commonjs()]
  },

  // UMD build (for CDN usage)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/turbo-harmony.js',
      format: 'umd',
      name: 'TurboHarmony',
      banner,
      sourcemap: true,
      globals: {
        'alpinejs': 'Alpine',
        '@hotwired/turbo': 'Turbo'
      }
    },
    plugins: [resolve(), commonjs()]
  },

  // Minified UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/turbo-harmony.min.js',
      format: 'umd',
      name: 'TurboHarmony',
      banner,
      sourcemap: true,
      globals: {
        'alpinejs': 'Alpine',
        '@hotwired/turbo': 'Turbo'
      }
    },
    plugins: [resolve(), commonjs(), terser()]
  }
]