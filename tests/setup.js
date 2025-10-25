/**
 * Test setup file
 * Configures the testing environment with DOM and mocks
 */

import { beforeEach, afterEach, vi } from 'vitest'

// Mock Alpine.js
global.Alpine = {
  start: vi.fn(),
  initTree: vi.fn(),
  destroyTree: vi.fn(),
  _x_dataStack: []
}

// Mock Turbo
global.Turbo = {
  visit: vi.fn(),
  clearCache: vi.fn()
}

// Mock window object for browser APIs
global.window = global
global.document = global.document || {}

// Setup before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks()

  // Reset Alpine mock
  global.Alpine = {
    start: vi.fn(),
    initTree: vi.fn(),
    destroyTree: vi.fn()
  }

  // Reset Turbo mock
  global.Turbo = {
    visit: vi.fn(),
    clearCache: vi.fn()
  }
})

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks()
})
