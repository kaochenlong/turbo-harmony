/**
 * TurboHarmony Debugger
 * Interactive debugging tools for TurboHarmony
 */

export class TurboHarmonyDebugger {
  constructor(turboHarmony) {
    this.turboHarmony = turboHarmony
    this.isActive = false
    this.panel = null
  }

  /**
   * Activate the debugger interface
   */
  activate() {
    if (this.isActive) return

    this.createDebugPanel()
    this.setupKeyboardShortcuts()
    this.isActive = true

    console.log('%c[TurboHarmony Debugger] Activated', 'color: #22c55e; font-weight: bold')
    console.log('Press Ctrl+Shift+H to toggle debug panel')
  }

  /**
   * Deactivate the debugger
   */
  deactivate() {
    if (!this.isActive) return

    if (this.panel) {
      this.panel.remove()
      this.panel = null
    }

    this.removeKeyboardShortcuts()
    this.isActive = false
  }

  /**
   * Create the debug panel UI
   */
  createDebugPanel() {
    const panel = document.createElement('div')
    panel.id = 'turbo-harmony-debug-panel'
    panel.innerHTML = `
      <style>
        #turbo-harmony-debug-panel {
          position: fixed;
          top: 10px;
          right: 10px;
          width: 350px;
          max-height: 80vh;
          background: rgba(0, 0, 0, 0.9);
          color: #fff;
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          z-index: 999999;
          overflow-y: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        #turbo-harmony-debug-panel h3 {
          margin: 0 0 10px 0;
          color: #22c55e;
          font-size: 14px;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
        }
        #turbo-harmony-debug-panel .metric {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          border-bottom: 1px solid #333;
        }
        #turbo-harmony-debug-panel .metric-label {
          color: #9ca3af;
        }
        #turbo-harmony-debug-panel .metric-value {
          color: #22c55e;
          font-weight: bold;
        }
        #turbo-harmony-debug-panel .controls {
          margin-top: 10px;
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        #turbo-harmony-debug-panel button {
          background: #22c55e;
          color: #000;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: bold;
        }
        #turbo-harmony-debug-panel button:hover {
          background: #16a34a;
        }
        #turbo-harmony-debug-panel .close-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #dc2626;
          width: 20px;
          height: 20px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #turbo-harmony-debug-panel .log-output {
          margin-top: 10px;
          max-height: 200px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.5);
          padding: 5px;
          border-radius: 4px;
          font-size: 11px;
        }
        #turbo-harmony-debug-panel .log-entry {
          margin-bottom: 3px;
          padding: 2px;
        }
        #turbo-harmony-debug-panel .log-debug { color: #9ca3af; }
        #turbo-harmony-debug-panel .log-info { color: #3b82f6; }
        #turbo-harmony-debug-panel .log-warn { color: #f59e0b; }
        #turbo-harmony-debug-panel .log-error { color: #dc2626; }
      </style>
      
      <button class="close-btn" onclick="window.turboHarmonyDebugger.deactivate()">×</button>
      <h3>TurboHarmony Debug Panel</h3>
      
      <div id="debug-metrics"></div>
      
      <div class="controls">
        <button onclick="window.turboHarmonyDebugger.refreshMetrics()">Refresh</button>
        <button onclick="window.turboHarmonyDebugger.turboHarmony.resetMetrics()">Reset Metrics</button>
        <button onclick="window.turboHarmonyDebugger.turboHarmony.reinitializeAll()">Reinit All</button>
        <button onclick="window.turboHarmonyDebugger.exportMetrics()">Export</button>
        <button onclick="window.turboHarmonyDebugger.toggleLogging()">Toggle Logs</button>
      </div>
      
      <div id="debug-log-output" class="log-output" style="display: none;"></div>
    `

    document.body.appendChild(panel)
    this.panel = panel
    this.refreshMetrics()

    // Make panel draggable
    this.makeDraggable(panel)

    // Store debugger reference globally for button onclick handlers
    window.turboHarmonyDebugger = this
  }

  /**
   * Make the panel draggable
   */
  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    const header = element.querySelector('h3')
    
    header.style.cursor = 'move'
    header.onmousedown = dragMouseDown

    function dragMouseDown(e) {
      e = e || window.event
      e.preventDefault()
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      document.onmousemove = elementDrag
    }

    function elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      element.style.top = (element.offsetTop - pos2) + "px"
      element.style.left = (element.offsetLeft - pos1) + "px"
      element.style.right = 'auto'
    }

    function closeDragElement() {
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  /**
   * Refresh the metrics display
   */
  refreshMetrics() {
    if (!this.panel) return

    const metrics = this.turboHarmony.getMetrics()
    const metricsContainer = this.panel.querySelector('#debug-metrics')

    metricsContainer.innerHTML = `
      <div class="metric">
        <span class="metric-label">Stream Updates:</span>
        <span class="metric-value">${metrics.streamUpdates}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Frame Updates:</span>
        <span class="metric-value">${metrics.frameUpdates}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Page Navigations:</span>
        <span class="metric-value">${metrics.driveNavigation}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Reinitializations:</span>
        <span class="metric-value">${metrics.reinitializations}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Errors:</span>
        <span class="metric-value" style="color: ${metrics.errors > 0 ? '#dc2626' : '#22c55e'}">${metrics.errors}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Avg Reinit Time:</span>
        <span class="metric-value">${metrics.averageReinitTime}ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">Success Rate:</span>
        <span class="metric-value">${metrics.successRate}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">Total Components:</span>
        <span class="metric-value">${metrics.totalComponents}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Uptime:</span>
        <span class="metric-value">${Math.round(metrics.uptime / 1000)}s</span>
      </div>
    `
  }

  /**
   * Export metrics to console and clipboard
   */
  exportMetrics() {
    const metrics = this.turboHarmony.getMetrics()
    const report = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
      options: this.turboHarmony.options,
      userAgent: navigator.userAgent
    }

    console.log('%c[TurboHarmony Export]', 'color: #22c55e; font-weight: bold')
    console.log(report)

    // Copy to clipboard
    const reportText = JSON.stringify(report, null, 2)
    navigator.clipboard.writeText(reportText).then(() => {
      alert('Metrics exported to console and copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err)
    })
  }

  /**
   * Toggle log output visibility
   */
  toggleLogging() {
    const logOutput = this.panel.querySelector('#debug-log-output')
    const isVisible = logOutput.style.display !== 'none'
    
    if (isVisible) {
      logOutput.style.display = 'none'
      this.turboHarmony.options.debug = false
    } else {
      logOutput.style.display = 'block'
      this.turboHarmony.options.debug = true
      this.setupLogCapture()
    }
  }

  /**
   * Capture console logs for display in the panel
   */
  setupLogCapture() {
    const logOutput = this.panel.querySelector('#debug-log-output')
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    // Override console methods to capture TurboHarmony logs
    console.log = (...args) => {
      originalLog.apply(console, args)
      if (args[0]?.includes?.('[TurboHarmony')) {
        this.addLogEntry('debug', args)
      }
    }

    console.warn = (...args) => {
      originalWarn.apply(console, args)
      if (args[0]?.includes?.('[TurboHarmony')) {
        this.addLogEntry('warn', args)
      }
    }

    console.error = (...args) => {
      originalError.apply(console, args)
      if (args[0]?.includes?.('[TurboHarmony')) {
        this.addLogEntry('error', args)
      }
    }
  }

  /**
   * Add a log entry to the panel
   */
  addLogEntry(level, args) {
    const logOutput = this.panel.querySelector('#debug-log-output')
    const entry = document.createElement('div')
    entry.className = `log-entry log-${level}`
    entry.textContent = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ')
    
    logOutput.appendChild(entry)
    logOutput.scrollTop = logOutput.scrollHeight
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    this.keyboardHandler = (e) => {
      // Ctrl+Shift+H to toggle debug panel
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault()
        if (this.panel.style.display === 'none') {
          this.panel.style.display = 'block'
        } else {
          this.panel.style.display = 'none'
        }
      }
    }

    document.addEventListener('keydown', this.keyboardHandler)
  }

  /**
   * Remove keyboard shortcuts
   */
  removeKeyboardShortcuts() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler)
    }
  }
}

// Auto-activate debugger in development mode
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.addEventListener('turbo-harmony:init', (event) => {
    const turboHarmony = event.detail.instance
    const debugger = new TurboHarmonyDebugger(turboHarmony)
    debugger.activate()
  })
}