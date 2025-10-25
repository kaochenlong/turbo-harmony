/**
 * TurboHarmony Lite - Minimal Alpine.js + Turbo Integration
 * @version 1.0.0
 * @license MIT
 */

class TurboHarmony {
  constructor(options = {}) {
    this.options = {
      debug: false,
      preserveState: false,
      skipSelectors: ['.turbo-harmony-skip', '[data-turbo-harmony-skip]'],
      reinitDelay: 0,
      beforeReinit: null,
      afterReinit: null,
      onError: null,
      autoStart: true,
      ...options
    }

    this.isInitialized = false
    this.preservedStates = new WeakMap()
    this.initializedElements = new WeakSet()

    // Bind methods
    this.handleBeforeVisit = this.handleBeforeVisit.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
    this.handleStreamRender = this.handleStreamRender.bind(this)
    this.handleFrameRender = this.handleFrameRender.bind(this)

    if (this.options.autoStart) {
      this.init()
    }
  }

  init() {
    if (this.isInitialized) return this

    this.validateDependencies()
    this.setupEventListeners()
    this.isInitialized = true

    return this
  }

  validateDependencies() {
    if (!window.Alpine) {
      throw new Error('TurboHarmony: Alpine.js not found')
    }
    if (!window.Turbo) {
      throw new Error('TurboHarmony: Turbo not found')
    }
  }

  setupEventListeners() {
    document.addEventListener('turbo:before-visit', this.handleBeforeVisit)
    document.addEventListener('turbo:load', this.handleLoad)
    document.addEventListener('turbo:stream-render', this.handleStreamRender)
    document.addEventListener('turbo:frame-render', this.handleFrameRender)
  }

  handleBeforeVisit() {
    if (Alpine.destroyTree) {
      Alpine.destroyTree(document.body)
    }
  }

  handleLoad() {
    if (Alpine.initTree) {
      Alpine.initTree(document.body)
    }
  }

  handleStreamRender(event) {
    const target = event.target || event.detail?.target
    if (target && !this.shouldSkipElement(target)) {
      this.reinitializeAlpineInElement(target)
    }
  }

  handleFrameRender(event) {
    const frame = event.target
    if (frame && !this.shouldSkipElement(frame)) {
      this.reinitializeAlpineInElement(frame)
    }
  }

  shouldSkipElement(element) {
    return this.options.skipSelectors.some(selector => element.matches?.(selector))
  }

  reinitializeAlpineInElement(element) {
    try {
      if (this.options.beforeReinit) {
        this.options.beforeReinit(element)
      }

      const alpineElements = element.querySelectorAll('[x-data]')
      const elementsToInit = []

      alpineElements.forEach(el => {
        if (!el._x_dataStack || !this.initializedElements.has(el)) {
          elementsToInit.push(el)
        }
      })

      if (elementsToInit.length > 0) {
        if (Alpine.destroyTree) {
          Alpine.destroyTree(element)
        }

        const reinit = () => {
          if (Alpine.initTree) {
            Alpine.initTree(element)
          }

          elementsToInit.forEach(el => {
            this.initializedElements.add(el)
          })

          if (this.options.afterReinit) {
            this.options.afterReinit(element)
          }
        }

        if (this.options.reinitDelay > 0) {
          setTimeout(reinit, this.options.reinitDelay)
        } else {
          reinit()
        }
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error, 'reinitializeAlpineInElement')
      }
    }
  }

  destroy() {
    document.removeEventListener('turbo:before-visit', this.handleBeforeVisit)
    document.removeEventListener('turbo:load', this.handleLoad)
    document.removeEventListener('turbo:stream-render', this.handleStreamRender)
    document.removeEventListener('turbo:frame-render', this.handleFrameRender)
    this.isInitialized = false
  }
}

export default TurboHarmony
export { TurboHarmony }

if (typeof window !== 'undefined') {
  window.TurboHarmony = TurboHarmony
}

