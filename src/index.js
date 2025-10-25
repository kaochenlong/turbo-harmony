/**
 * TurboHarmony - Alpine.js + Turbo Integration
 *
 * A comprehensive adapter that ensures Alpine.js components work seamlessly
 * with Turbo Drive, Turbo Stream, and Turbo Frame updates.
 *
 * @author TurboHarmony Contributors
 * @version 1.0.0
 * @license MIT
 */

class TurboHarmony {
  constructor(options = {}) {
    this.options = {
      // Debug and logging
      debug: false,
      // @if DEBUG
      logLevel: 'warn', // 'debug', 'info', 'warn', 'error'
      // @endif

      // State management
      preserveState: false,
      preserveStateSelectors: ['[x-data]'],

      // Element filtering
      skipSelectors: ['.turbo-harmony-skip', '.no-alpine', '[data-turbo-harmony-skip]'],

      // Performance options
      reinitDelay: 0, // ms delay before reinitializing
      batchUpdates: true,

      // Lifecycle hooks
      beforeReinit: null, // (element) => {}
      afterReinit: null, // (element) => {}
      onError: null, // (error, context) => {}

      // Advanced options
      watchAttributes: ['x-data', 'x-show', 'x-if', 'x-for'],
      autoStart: true,

      ...options
    }

    // @if DEBUG
    // Performance and debugging metrics
    this.metrics = {
      streamUpdates: 0,
      frameUpdates: 0,
      driveNavigation: 0,
      reinitializations: 0,
      errors: 0,
      performance: [],
      startTime: performance.now()
    }
    // @endif

    // Internal state
    this.isInitialized = false
    this.preservedStates = new WeakMap()
    this.initializedElements = new WeakSet()

    // @if DEBUG
    this.componentLifecycle = new Map()
    // @endif

    // Bind methods to maintain context
    this.handleBeforeVisit = this.handleBeforeVisit.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
    this.handleBeforeStreamRender = this.handleBeforeStreamRender.bind(this)
    this.handleStreamRender = this.handleStreamRender.bind(this)
    this.handleBeforeFrameRender = this.handleBeforeFrameRender.bind(this)
    this.handleFrameRender = this.handleFrameRender.bind(this)
    this.handleError = this.handleError.bind(this)

    if (this.options.autoStart) {
      this.init()
    }
  }

  /**
   * Initialize TurboHarmony
   * Validates dependencies and sets up event listeners
   */
  init() {
    if (this.isInitialized) {
      this.log('warn', 'TurboHarmony already initialized')
      return this
    }

    this.validateDependencies()
    this.setupEventListeners()

    this.isInitialized = true
    this.log('info', 'TurboHarmony initialized successfully', {
      options: this.options,
      version: '1.0.0'
    })

    return this
  }

  /**
   * Validate that required dependencies are available
   */
  validateDependencies() {
    if (typeof window === 'undefined') {
      throw new Error('TurboHarmony: window object not available')
    }

    if (!window.Alpine) {
      throw new Error(
        'TurboHarmony: Alpine.js not found. Please ensure Alpine.js is loaded before TurboHarmony.'
      )
    }

    if (!window.Turbo) {
      throw new Error(
        'TurboHarmony: Turbo not found. Please ensure @hotwired/turbo is loaded before TurboHarmony.'
      )
    }

    this.log('debug', 'Dependencies validated successfully')
  }

  /**
   * Set up all Turbo event listeners
   */
  setupEventListeners() {
    // Turbo Drive events (full page navigation)
    document.addEventListener('turbo:before-visit', this.handleBeforeVisit)
    document.addEventListener('turbo:load', this.handleLoad)

    // Turbo Stream events (partial page updates) - Main focus
    document.addEventListener('turbo:before-stream-render', this.handleBeforeStreamRender)
    document.addEventListener('turbo:stream-render', this.handleStreamRender)

    // Turbo Frame events (frame-specific updates)
    document.addEventListener('turbo:before-frame-render', this.handleBeforeFrameRender)
    document.addEventListener('turbo:frame-render', this.handleFrameRender)

    // Error handling
    window.addEventListener('error', this.handleError)
    window.addEventListener('unhandledrejection', this.handleError)

    this.log('debug', 'Event listeners registered')
  }

  /**
   * Handle Turbo Drive before visit (full page navigation)
   */
  handleBeforeVisit(event) {
    // @if DEBUG
    this.metrics.driveNavigation++
    // @endif
    this.log('debug', 'Turbo Drive: before visit', { location: event.detail.url })

    // Clean up Alpine instances before navigation
    if (Alpine.destroyTree) {
      Alpine.destroyTree(document.body)
    }
  }

  /**
   * Handle Turbo Drive load (after page navigation)
   */
  handleLoad(event) {
    this.log('debug', 'Turbo Drive: load complete')

    // Only reinitialize DOM tree, don't call Alpine.start() again
    if (Alpine.initTree) {
      Alpine.initTree(document.body)
    }
  }

  /**
   * Handle before Turbo Stream render
   */
  handleBeforeStreamRender(event) {
    this.log('debug', 'Turbo Stream: before render', {
      action: event.detail?.action,
      target: event.detail?.target
    })

    // @if PRESERVE_STATE
    // Prepare for Stream update
    const targetElement = this.findTargetElement(event)
    if (targetElement && this.options.preserveState) {
      this.preserveAlpineState(targetElement)
    }
    // @endif
  }

  /**
   * Handle Turbo Stream render (after partial update)
   * This is the core functionality for Stream integration
   */
  handleStreamRender(event) {
    // @if DEBUG
    const startTime = performance.now()
    this.metrics.streamUpdates++
    // @endif

    try {
      const targetElement = this.findTargetElement(event)

      if (!targetElement) {
        this.log('warn', 'Turbo Stream: target element not found', event.detail)
        return
      }

      this.log('debug', 'Turbo Stream: render detected', {
        action: event.detail?.action,
        target: targetElement.tagName,
        id: targetElement.id,
        classes: targetElement.className
      })

      // Check if we should skip this element
      if (this.shouldSkipElement(targetElement)) {
        this.log('debug', 'Turbo Stream: skipping element due to skip selector')
        return
      }

      // Perform Alpine reinitialization
      this.reinitializeAlpineInElement(targetElement)

      // @if DEBUG
      // Record performance
      const endTime = performance.now()
      this.metrics.performance.push(endTime - startTime)
      // @endif
    } catch (error) {
      this.handleError(error, 'handleStreamRender')
    }
  }

  /**
   * Handle before Turbo Frame render
   */
  handleBeforeFrameRender(event) {
    this.log('debug', 'Turbo Frame: before render', { frame: event.target.id })

    // @if DEBUG
    // Clean up tracking for elements that will be removed
    const frameElement = event.target
    if (frameElement) {
      const alpineElements = frameElement.querySelectorAll('[x-data]')
      alpineElements.forEach(el => {
        this.initializedElements.delete(el)
        this.trackComponentLifecycle(el, 'beforeDestroy')
      })
    }
    // @endif
  }

  /**
   * Handle Turbo Frame render
   */
  handleFrameRender(event) {
    // @if DEBUG
    this.metrics.frameUpdates++
    // @endif
    const frameElement = event.target

    this.log('debug', 'Turbo Frame: render complete', { frame: frameElement.id })

    // Reinitialize Alpine within the frame
    if (!this.shouldSkipElement(frameElement)) {
      this.reinitializeAlpineInElement(frameElement)
    }
  }

  /**
   * Find the target element from a Turbo event
   */
  findTargetElement(event) {
    // Try multiple ways to find the target element
    return (
      event.target ||
      event.detail?.target ||
      (event.detail?.selector && document.querySelector(event.detail.selector)) ||
      null
    )
  }

  /**
   * Check if an element should be skipped for Alpine reinitialization
   */
  shouldSkipElement(element) {
    if (!element || !element.matches) return true

    return this.options.skipSelectors.some(selector => {
      try {
        return element.matches(selector)
      } catch (e) {
        this.log('warn', `Invalid skip selector: ${selector}`, e)
        return false
      }
    })
  }

  /**
   * Reinitialize Alpine.js for a specific element
   * This is the core method that makes the magic happen
   */
  reinitializeAlpineInElement(element) {
    // @if DEBUG
    this.metrics.reinitializations++
    // @endif

    try {
      this.log('debug', 'Reinitializing Alpine in element', {
        tag: element.tagName,
        id: element.id,
        classes: element.className
      })

      // Execute beforeReinit hook
      if (this.options.beforeReinit) {
        this.options.beforeReinit(element)
      }

      // @if PRESERVE_STATE
      // Preserve state if enabled
      if (this.options.preserveState) {
        this.preserveAlpineState(element)
      }
      // @endif

      // Track initialized elements to prevent double initialization
      const alpineElements = element.querySelectorAll('[x-data]')
      const elementsToInit = []

      alpineElements.forEach(el => {
        // Skip if already initialized and still connected
        if (el._x_dataStack && el._x_dataStack.length > 0 && this.initializedElements.has(el)) {
          this.log('debug', 'Skipping already initialized element', {
            id: el.id,
            classes: el.className
          })
          // @if DEBUG
          this.trackComponentLifecycle(el, 'skipped')
          // @endif
          return
        }
        elementsToInit.push(el)
        // @if DEBUG
        this.trackComponentLifecycle(el, 'queued')
        // @endif
      })

      // Only destroy and reinit if there are uninitialized elements
      if (elementsToInit.length > 0) {
        // Destroy existing Alpine instances within the element
        if (Alpine.destroyTree) {
          Alpine.destroyTree(element)
        }

        // Reinitialize Alpine
        const reinit = () => {
          if (Alpine.initTree) {
            Alpine.initTree(element)
          } else if (Alpine.start) {
            // Fallback for older Alpine versions
            Alpine.start()
          }

          // Mark elements as initialized
          elementsToInit.forEach(el => {
            this.initializedElements.add(el)
            // @if DEBUG
            this.trackComponentLifecycle(el, 'initialized')
            // @endif
          })

          // @if PRESERVE_STATE
          // Restore state if preserved
          if (this.options.preserveState) {
            this.restoreAlpineState(element)
          }
          // @endif

          // Execute afterReinit hook
          if (this.options.afterReinit) {
            this.options.afterReinit(element)
          }

          this.log('debug', 'Alpine reinitialization complete', {
            initialized: elementsToInit.length
          })
        }

        // Apply delay if configured
        if (this.options.reinitDelay > 0) {
          setTimeout(reinit, this.options.reinitDelay)
        } else {
          reinit()
        }
      } else {
        // No x-data elements found inside, check if parent has x-data
        // This handles the common pattern where a parent element has x-data
        // and child Turbo Frames contain only Alpine directives (x-on:*, x-model, etc.)
        const parentWithData = element.closest('[x-data]')

        if (parentWithData) {
          // Found parent with x-data, reinitialize from parent to ensure
          // child directives can access the Alpine component context
          this.log('debug', 'Found parent with x-data, reinitializing from parent')

          const reinit = () => {
            if (Alpine.destroyTree) {
              Alpine.destroyTree(parentWithData)
            }

            if (Alpine.initTree) {
              Alpine.initTree(parentWithData)
            }

            // Execute afterReinit hook
            if (this.options.afterReinit) {
              this.options.afterReinit(element)
            }

            this.log('debug', 'Alpine reinitialization from parent complete')
          }

          // Apply delay if configured
          if (this.options.reinitDelay > 0) {
            setTimeout(reinit, this.options.reinitDelay)
          } else {
            reinit()
          }
        } else {
          // No parent with x-data, just try to initialize the element itself
          this.log('debug', 'No x-data found in parent chain, initializing element directly')

          const reinit = () => {
            if (Alpine.initTree) {
              Alpine.initTree(element)
            }

            // Execute afterReinit hook
            if (this.options.afterReinit) {
              this.options.afterReinit(element)
            }

            this.log('debug', 'Alpine directive initialization complete')
          }

          // Apply delay if configured
          if (this.options.reinitDelay > 0) {
            setTimeout(reinit, this.options.reinitDelay)
          } else {
            reinit()
          }
        }
      }
    } catch (error) {
      this.handleError(error, 'reinitializeAlpineInElement')
    }
  }

  // @if PRESERVE_STATE
  /**
   * Preserve Alpine component state before reinitialization
   */
  preserveAlpineState(element) {
    try {
      const alpineElements = element.querySelectorAll(this.options.preserveStateSelectors.join(','))
      const states = new Map()

      alpineElements.forEach(el => {
        // Access Alpine's internal data stack
        if (el._x_dataStack && el._x_dataStack.length > 0) {
          try {
            const state = this.safeStringify(el._x_dataStack[0])
            states.set(this.getElementKey(el), JSON.parse(state))
          } catch (e) {
            this.log('warn', 'Failed to preserve state for element', e)
          }
        }
      })

      this.preservedStates.set(element, states)
      this.log('debug', `Preserved state for ${states.size} Alpine components`)
    } catch (error) {
      this.handleError(error, 'preserveAlpineState')
    }
  }

  /**
   * Restore Alpine component state after reinitialization
   */
  restoreAlpineState(element) {
    try {
      const savedStates = this.preservedStates.get(element)
      if (!savedStates) return

      // Wait a tick for Alpine to fully initialize
      setTimeout(() => {
        const alpineElements = element.querySelectorAll(
          this.options.preserveStateSelectors.join(',')
        )

        alpineElements.forEach(el => {
          const key = this.getElementKey(el)
          const savedState = savedStates.get(key)

          if (savedState && el._x_dataStack && el._x_dataStack.length > 0) {
            try {
              // Only restore properties that exist and are writable
              const currentData = el._x_dataStack[0]
              Object.keys(savedState).forEach(prop => {
                const descriptor = Object.getOwnPropertyDescriptor(currentData, prop)
                // Skip getters/setters and non-writable properties
                if (!descriptor || descriptor.set || descriptor.writable !== false) {
                  try {
                    currentData[prop] = savedState[prop]
                  } catch (e) {
                    this.log('debug', `Skipped non-writable property: ${prop}`)
                  }
                }
              })
              this.log('debug', 'Restored state for element', key)
            } catch (e) {
              this.log('warn', 'Failed to restore state for element', e)
            }
          }
        })

        // Clean up
        this.preservedStates.delete(element)
      }, 10)
    } catch (error) {
      this.handleError(error, 'restoreAlpineState')
    }
  }

  /**
   * Generate a unique key for an element (for state preservation)
   */
  getElementKey(element) {
    return (
      element.id ||
      element.getAttribute('data-key') ||
      `${element.tagName}-${Array.from(element.parentNode.children).indexOf(element)}`
    )
  }

  /**
   * Safe JSON stringify that handles circular references and non-serializable values
   */
  safeStringify(obj) {
    const seen = new WeakSet()

    return JSON.stringify(obj, (key, value) => {
      // Skip DOM elements and other non-serializable browser objects
      if (
        value instanceof HTMLElement ||
        value instanceof Window ||
        value instanceof Document ||
        value instanceof Event
      ) {
        return undefined
      }

      // Skip functions
      if (typeof value === 'function') {
        return undefined
      }

      // Skip properties that start with _ (often internal/private)
      if (typeof key === 'string' && key.startsWith('_')) {
        return undefined
      }

      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return undefined
        }
        seen.add(value)
      }

      return value
    })
  }
  // @endif

  /**
   * Enhanced logging system with levels and formatting
   */
  log(level, message, data = null) {
    if (!this.options.debug) return

    // @if DEBUG
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    const currentLevel = levels[this.options.logLevel] || 1

    if (levels[level] >= currentLevel) {
      const timestamp = new Date().toISOString()
      const prefix = `[TurboHarmony ${timestamp}]`
      const method =
        level === 'error' ? 'error' : level === 'warn' ? 'warn' : level === 'info' ? 'info' : 'log'

      if (data) {
        console[method](prefix, message, data)
      } else {
        console[method](prefix, message)
      }
    }
    // @else
    if (level === 'error' || level === 'warn') {
      console[level]('[TurboHarmony]', message, data || '')
    }
    // @endif
  }

  /**
   * Centralized error handling
   */
  handleError(error, context = '') {
    // @if DEBUG
    this.metrics.errors++
    // @endif

    const errorInfo = {
      message: error.message || error,
      context,
      timestamp: new Date().toISOString(),
      // @if DEBUG
      metrics: this.getMetrics()
      // @endif
    }

    this.log('error', `TurboHarmony error in ${context}:`, errorInfo)

    // Execute custom error handler if provided
    if (this.options.onError) {
      try {
        this.options.onError(error, errorInfo)
      } catch (handlerError) {
        console.error('[TurboHarmony] Error in custom error handler:', handlerError)
      }
    }
  }

  // @if DEBUG
  /**
   * Track component lifecycle events
   */
  trackComponentLifecycle(element, event) {
    const key = this.getElementKey(element)
    const timestamp = performance.now()

    if (!this.componentLifecycle.has(key)) {
      this.componentLifecycle.set(key, [])
    }

    this.componentLifecycle.get(key).push({
      event,
      timestamp,
      element: {
        id: element.id,
        classes: element.className,
        tag: element.tagName
      }
    })
  }

  /**
   * Get lifecycle report for debugging
   */
  getLifecycleReport() {
    const report = []
    this.componentLifecycle.forEach((events, key) => {
      report.push({
        component: key,
        events: events,
        totalEvents: events.length,
        duplicateInits: events.filter(e => e.event === 'initialized').length - 1
      })
    })
    return report
  }

  /**
   * Get performance and usage metrics
   */
  getMetrics() {
    const uptime = performance.now() - this.metrics.startTime
    const avgPerformance =
      this.metrics.performance.length > 0
        ? this.metrics.performance.reduce((a, b) => a + b) / this.metrics.performance.length
        : 0

    return {
      ...this.metrics,
      uptime: Math.round(uptime),
      averageReinitTime: Math.round(avgPerformance * 100) / 100,
      successRate:
        this.metrics.errors === 0
          ? 100
          : Math.round(
              (1 -
                this.metrics.errors /
                  (this.metrics.streamUpdates +
                    this.metrics.frameUpdates +
                    this.metrics.driveNavigation)) *
                100
            ),
      totalComponents: this.componentLifecycle.size,
      lifecycleReport: this.getLifecycleReport()
    }
  }

  /**
   * Reset metrics (useful for testing and debugging)
   */
  resetMetrics() {
    this.metrics = {
      streamUpdates: 0,
      frameUpdates: 0,
      driveNavigation: 0,
      reinitializations: 0,
      errors: 0,
      performance: [],
      startTime: performance.now()
    }

    this.log('info', 'Metrics reset')
  }
  // @endif

  /**
   * Manually reinitialize Alpine for the entire document
   * Useful for debugging or manual intervention
   */
  reinitializeAll() {
    this.log('info', 'Manual reinitialization triggered')
    this.reinitializeAlpineInElement(document.body)
  }

  /**
   * Destroy TurboHarmony and clean up event listeners
   */
  destroy() {
    document.removeEventListener('turbo:before-visit', this.handleBeforeVisit)
    document.removeEventListener('turbo:load', this.handleLoad)
    document.removeEventListener('turbo:before-stream-render', this.handleBeforeStreamRender)
    document.removeEventListener('turbo:stream-render', this.handleStreamRender)
    document.removeEventListener('turbo:before-frame-render', this.handleBeforeFrameRender)
    document.removeEventListener('turbo:frame-render', this.handleFrameRender)
    window.removeEventListener('error', this.handleError)
    window.removeEventListener('unhandledrejection', this.handleError)

    this.isInitialized = false
    this.log('info', 'TurboHarmony destroyed')
  }
}

// Export for different module systems
export default TurboHarmony
export { TurboHarmony }

// Global assignment for non-module usage
if (typeof window !== 'undefined') {
  window.TurboHarmony = TurboHarmony
}

