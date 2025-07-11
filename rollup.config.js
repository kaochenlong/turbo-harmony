import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { readFileSync } from 'fs'
import { preprocessPlugin } from './scripts/preprocess.js'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const banner = `/**
 * TurboHarmony v${pkg.version}
 * (c) ${new Date().getFullYear()} TurboHarmony Contributors
 * @license MIT
 */`

// Define build variants
const builds = [
  {
    name: 'full',
    file: 'turbo-harmony.js',
    defines: { DEBUG: true, PRESERVE_STATE: true }
  },
  {
    name: 'standard',
    file: 'turbo-harmony.standard.js',
    defines: { DEBUG: false, PRESERVE_STATE: true }
  },
  {
    name: 'lite',
    file: 'turbo-harmony.lite.js',
    defines: { DEBUG: false, PRESERVE_STATE: false }
  }
]

// Generate configs for each build variant
const configs = []

builds.forEach(build => {
  // Unminified version
  configs.push({
    input: 'src/index.js',
    external: ['alpinejs', '@hotwired/turbo'],
    output: {
      file: `dist/${build.file}`,
      format: 'es',
      banner: banner + (build.name !== 'full' ? `\n/* Build: ${build.name} */` : ''),
      sourcemap: true
    },
    plugins: [
      preprocessPlugin(build.defines),
      resolve(),
      commonjs()
    ]
  })

  // Minified version
  configs.push({
    input: 'src/index.js',
    external: ['alpinejs', '@hotwired/turbo'],
    output: {
      file: `dist/${build.file.replace('.js', '.min.js')}`,
      format: 'es',
      banner: banner + (build.name !== 'full' ? `\n/* Build: ${build.name} */` : ''),
      sourcemap: true
    },
    plugins: [
      preprocessPlugin(build.defines),
      resolve(),
      commonjs(),
      terser()
    ]
  })
})

export default configs