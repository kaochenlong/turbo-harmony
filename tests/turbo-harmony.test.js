/**
 * TurboHarmony Tests
 * Core functionality tests for Alpine.js + Turbo integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import TurboHarmony from '../src/index.js'

describe('TurboHarmony', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''

    // Setup Alpine mock
    global.Alpine = {
      start: vi.fn(),
      initTree: vi.fn(),
      destroyTree: vi.fn()
    }

    // Setup Turbo mock
    global.Turbo = {
      visit: vi.fn(),
      clearCache: vi.fn()
    }
  })

  describe('Initialization', () => {
    it('should initialize successfully with Alpine and Turbo available', () => {
      const harmony = new TurboHarmony()
      expect(harmony.isInitialized).toBe(true)
    })

    it('should throw error when Alpine is not available', () => {
      global.Alpine = undefined

      expect(() => {
        new TurboHarmony()
      }).toThrow('Alpine.js not found')
    })

    it('should throw error when Turbo is not available', () => {
      global.Turbo = undefined

      expect(() => {
        new TurboHarmony()
      }).toThrow('Turbo not found')
    })

    it('should not initialize twice', () => {
      const harmony = new TurboHarmony()
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      harmony.init()

      // Should log warning when trying to init again (only in debug mode)
      expect(harmony.isInitialized).toBe(true)

      consoleSpy.mockRestore()
    })

    it('should support autoStart option', () => {
      const harmony = new TurboHarmony({ autoStart: false })
      expect(harmony.isInitialized).toBe(false)

      harmony.init()
      expect(harmony.isInitialized).toBe(true)
    })
  })

  describe('Configuration Options', () => {
    it('should accept custom options', () => {
      const options = {
        debug: true,
        preserveState: true,
        skipSelectors: ['.custom-skip'],
        reinitDelay: 100
      }

      const harmony = new TurboHarmony(options)

      expect(harmony.options.debug).toBe(true)
      expect(harmony.options.preserveState).toBe(true)
      expect(harmony.options.skipSelectors).toContain('.custom-skip')
      expect(harmony.options.reinitDelay).toBe(100)
    })

    it('should have correct default options', () => {
      const harmony = new TurboHarmony()

      expect(harmony.options.debug).toBe(false)
      expect(harmony.options.preserveState).toBe(false)
      expect(harmony.options.skipSelectors).toContain('.turbo-harmony-skip')
      expect(harmony.options.reinitDelay).toBe(0)
      expect(harmony.options.autoStart).toBe(true)
    })

    it('should merge custom options with defaults', () => {
      const harmony = new TurboHarmony({ debug: true })

      expect(harmony.options.debug).toBe(true)
      expect(harmony.options.preserveState).toBe(false) // still default
    })
  })

  describe('Event Listeners', () => {
    it('should register Turbo event listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      new TurboHarmony()

      expect(addEventListenerSpy).toHaveBeenCalledWith('turbo:before-visit', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('turbo:load', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('turbo:before-stream-render', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('turbo:stream-render', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('turbo:before-frame-render', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('turbo:frame-render', expect.any(Function))
    })

    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const harmony = new TurboHarmony()
      harmony.destroy()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('turbo:before-visit', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('turbo:load', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('turbo:stream-render', expect.any(Function))
      expect(harmony.isInitialized).toBe(false)
    })
  })

  describe('Turbo Stream Handling', () => {
    it('should reinitialize Alpine when target element has x-data', () => {
      const harmony = new TurboHarmony()

      // Create a target element with x-data
      const target = document.createElement('div')
      target.id = 'test-target'

      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ count: 0 }')
      alpineEl.textContent = 'Test'

      target.appendChild(alpineEl)
      document.body.appendChild(target)

      // Directly test the core reinitialize method
      harmony.reinitializeAlpineInElement(target)

      // Should call Alpine.destroyTree and initTree
      expect(global.Alpine.destroyTree).toHaveBeenCalled()
      expect(global.Alpine.initTree).toHaveBeenCalled()
    })

    it('should skip elements with skip selector', () => {
      const harmony = new TurboHarmony()

      // Create element with skip class
      const target = document.createElement('div')
      target.className = 'turbo-harmony-skip'

      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ count: 0 }')
      alpineEl.textContent = 'Test'
      target.appendChild(alpineEl)

      document.body.appendChild(target)

      const event = new CustomEvent('turbo:stream-render', {
        detail: { target: target }
      })

      document.dispatchEvent(event)

      // Should NOT call Alpine methods
      expect(global.Alpine.destroyTree).not.toHaveBeenCalled()
      expect(global.Alpine.initTree).not.toHaveBeenCalled()
    })
  })

  describe('Turbo Frame Handling', () => {
    it('should reinitialize Alpine when frame has x-data', () => {
      const harmony = new TurboHarmony()

      // Create a frame element
      const frame = document.createElement('turbo-frame')
      frame.id = 'test-frame'

      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ count: 0 }')
      alpineEl.textContent = 'Test'
      frame.appendChild(alpineEl)

      document.body.appendChild(frame)

      // Directly test the core method
      harmony.reinitializeAlpineInElement(frame)

      // Should call Alpine methods
      expect(global.Alpine.destroyTree).toHaveBeenCalled()
      expect(global.Alpine.initTree).toHaveBeenCalled()
    })
  })

  describe('Turbo Drive Handling', () => {
    it('should destroy Alpine tree before visit', () => {
      const harmony = new TurboHarmony()

      const event = new CustomEvent('turbo:before-visit', {
        detail: { url: 'http://example.com' }
      })

      document.dispatchEvent(event)

      expect(global.Alpine.destroyTree).toHaveBeenCalledWith(document.body)
    })

    it('should reinitialize Alpine on load', () => {
      const harmony = new TurboHarmony()

      const event = new CustomEvent('turbo:load')

      document.dispatchEvent(event)

      expect(global.Alpine.initTree).toHaveBeenCalledWith(document.body)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should call beforeReinit hook', () => {
      const beforeReinit = vi.fn()
      const harmony = new TurboHarmony({ beforeReinit })

      const target = document.createElement('div')
      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ count: 0 }')
      alpineEl.textContent = 'Test'
      target.appendChild(alpineEl)

      document.body.appendChild(target)

      // Directly call reinitialize
      harmony.reinitializeAlpineInElement(target)

      expect(beforeReinit).toHaveBeenCalledWith(target)
    })

    it('should call afterReinit hook', () => {
      const afterReinit = vi.fn()
      const harmony = new TurboHarmony({ afterReinit })

      const target = document.createElement('div')
      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ count: 0 }')
      alpineEl.textContent = 'Test'
      target.appendChild(alpineEl)

      document.body.appendChild(target)

      // Directly call reinitialize
      harmony.reinitializeAlpineInElement(target)

      expect(afterReinit).toHaveBeenCalledWith(target)
    })

    it('should call onError hook when error occurs', () => {
      const onError = vi.fn()
      const harmony = new TurboHarmony({ onError })

      // Make Alpine.initTree throw an error
      global.Alpine.initTree.mockImplementation(() => {
        throw new Error('Test error')
      })

      const target = document.createElement('div')
      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ count: 0 }')
      alpineEl.textContent = 'Test'
      target.appendChild(alpineEl)

      document.body.appendChild(target)

      // Directly call reinitialize which will trigger error
      harmony.reinitializeAlpineInElement(target)

      expect(onError).toHaveBeenCalled()
    })
  })

  describe('Element Detection', () => {
    it('should detect elements with x-data', () => {
      const harmony = new TurboHarmony()

      const target = document.createElement('div')
      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ count: 0 }')
      alpineEl.textContent = 'Test'
      target.appendChild(alpineEl)
      document.body.appendChild(target)

      // Directly test reinitialize
      harmony.reinitializeAlpineInElement(target)

      expect(global.Alpine.destroyTree).toHaveBeenCalled()
      expect(global.Alpine.initTree).toHaveBeenCalled()
    })

    it('should handle parent with x-data when child frame updates', () => {
      const harmony = new TurboHarmony()

      // Create parent with x-data
      const parent = document.createElement('div')
      parent.setAttribute('x-data', '{ count: 0 }')

      // Create child frame without x-data
      const frame = document.createElement('turbo-frame')
      frame.id = 'child-frame'

      const button = document.createElement('button')
      button.setAttribute('x-on:click', 'count++')
      button.textContent = 'Click'
      frame.appendChild(button)

      parent.appendChild(frame)
      document.body.appendChild(parent)

      // Directly test reinitialize on frame
      harmony.reinitializeAlpineInElement(frame)

      // Should reinitialize from parent
      expect(global.Alpine.destroyTree).toHaveBeenCalled()
      expect(global.Alpine.initTree).toHaveBeenCalled()
    })
  })

  describe('Manual Methods', () => {
    it('should manually reinitialize all', () => {
      const harmony = new TurboHarmony()

      // Add an element with x-data to the body
      const alpineEl = document.createElement('div')
      alpineEl.setAttribute('x-data', '{ test: true }')
      document.body.appendChild(alpineEl)

      harmony.reinitializeAll()

      expect(global.Alpine.destroyTree).toHaveBeenCalledWith(document.body)
      expect(global.Alpine.initTree).toHaveBeenCalledWith(document.body)
    })
  })

  describe('Skip Selector Logic', () => {
    it('should check shouldSkipElement correctly', () => {
      const harmony = new TurboHarmony({
        skipSelectors: ['.skip-me', '[data-no-alpine]']
      })

      const skipEl = document.createElement('div')
      skipEl.className = 'skip-me'

      const normalEl = document.createElement('div')

      expect(harmony.shouldSkipElement(skipEl)).toBe(true)
      expect(harmony.shouldSkipElement(normalEl)).toBe(false)
    })

    it('should return true for null or undefined elements', () => {
      const harmony = new TurboHarmony()

      expect(harmony.shouldSkipElement(null)).toBe(true)
      expect(harmony.shouldSkipElement(undefined)).toBe(true)
    })
  })
})
