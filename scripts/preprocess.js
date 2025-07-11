import { readFileSync, writeFileSync } from 'fs'

/**
 * Simple preprocessor for conditional compilation
 * Supports @if, @else, @endif directives
 */
export function preprocess(code, defines = {}) {
  const lines = code.split('\n')
  const output = []
  const stack = []
  let skip = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Check for preprocessor directives
    if (trimmed.startsWith('// @if ')) {
      const condition = trimmed.substring(7).trim()
      const shouldInclude = defines[condition] === true
      stack.push({ condition, shouldInclude, hadElse: false })
      skip = !shouldInclude || (stack.length > 1 && stack[stack.length - 2].skip)
      continue
    }
    
    if (trimmed === '// @else') {
      if (stack.length === 0) {
        throw new Error(`@else without @if at line ${i + 1}`)
      }
      const current = stack[stack.length - 1]
      current.hadElse = true
      skip = current.shouldInclude || (stack.length > 1 && !stack[stack.length - 2].shouldInclude)
      continue
    }
    
    if (trimmed === '// @endif') {
      if (stack.length === 0) {
        throw new Error(`@endif without @if at line ${i + 1}`)
      }
      stack.pop()
      skip = stack.length > 0 && !stack[stack.length - 1].shouldInclude
      continue
    }
    
    // Include line if not skipping
    if (!skip) {
      output.push(line)
    }
  }
  
  if (stack.length > 0) {
    throw new Error('Unclosed @if directive')
  }
  
  return output.join('\n')
}

// Export as a Rollup plugin
export function preprocessPlugin(defines = {}) {
  return {
    name: 'preprocess',
    transform(code, id) {
      if (!id.endsWith('.js')) return null
      
      try {
        const processed = preprocess(code, defines)
        return {
          code: processed,
          map: null
        }
      } catch (error) {
        this.error(`Preprocessing error in ${id}: ${error.message}`)
      }
    }
  }
}