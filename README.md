# TurboHarmony 🎭

> Seamless integration between Alpine.js and Hotwire Turbo

![npm version](https://img.shields.io/npm/v/turbo-harmony)
![license](https://img.shields.io/npm/l/turbo-harmony)
![bundle size](https://img.shields.io/bundlephobia/minzip/turbo-harmony)

TurboHarmony solves the integration challenges between Alpine.js and Turbo, ensuring your Alpine components work flawlessly with Turbo Drive navigation, Turbo Frames, and especially Turbo Streams.

## 🎯 The Problem

When using Alpine.js with Turbo, you might encounter:

- Alpine components not initializing after Turbo Stream updates
- State loss during page navigation
- Memory leaks from uncleared event listeners
- Double initialization of components
- Broken Alpine functionality after partial page updates

## ✨ The Solution

TurboHarmony provides a drop-in adapter that:

- ✅ Automatically reinitializes Alpine components after Turbo updates
- ✅ Preserves component state during navigation (optional)
- ✅ Prevents memory leaks and double initialization
- ✅ Works with all Turbo features (Drive, Frames, Streams)
- ✅ Provides debugging tools and performance metrics
- ✅ Zero configuration required (but fully customizable)

## 📦 Installation

### NPM/Yarn

```bash
npm install turbo-harmony
# or
yarn add turbo-harmony
```

### CDN

```html
<!-- After Alpine and Turbo -->
<script src="https://unpkg.com/turbo-harmony@latest/dist/turbo-harmony.min.js"></script>
```

## 🚀 Quick Start

### Basic Setup

```javascript
import Alpine from 'alpinejs'
import * as Turbo from '@hotwired/turbo'
import TurboHarmony from 'turbo-harmony'

// Initialize TurboHarmony
const harmony = new TurboHarmony()

// Start Alpine
Alpine.start()
```

### With Configuration

```javascript
const harmony = new TurboHarmony({
  // Enable debug mode for development
  debug: true,
  
  // Preserve Alpine component state during navigation
  preserveState: true,
  
  // Add custom lifecycle hooks
  beforeReinit: (element) => {
    console.log('About to reinitialize:', element)
  },
  afterReinit: (element) => {
    console.log('Reinitialized:', element)
  }
})
```

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | `false` | Enable debug logging |
| `logLevel` | string | `'warn'` | Log level: 'debug', 'info', 'warn', 'error' |
| `preserveState` | boolean | `false` | Preserve Alpine component state |
| `preserveStateSelectors` | array | `['[x-data]']` | Selectors for state preservation |
| `skipSelectors` | array | `['.turbo-harmony-skip', '.no-alpine', '[data-turbo-harmony-skip]']` | Elements to skip |
| `reinitDelay` | number | `0` | Delay (ms) before reinitializing |
| `batchUpdates` | boolean | `true` | Batch multiple updates for performance |
| `beforeReinit` | function | `null` | Hook called before reinitialization |
| `afterReinit` | function | `null` | Hook called after reinitialization |
| `onError` | function | `null` | Custom error handler |
| `autoStart` | boolean | `true` | Automatically initialize on creation |

## 📖 Advanced Usage

### State Preservation

Preserve form inputs and component state during navigation:

```javascript
const harmony = new TurboHarmony({
  preserveState: true,
  preserveStateSelectors: [
    '[x-data]',
    '[data-preserve-state]',
    'form[data-turbo-permanent]'
  ]
})
```

### Custom Skip Logic

Skip certain elements from reinitialization:

```html
<!-- This component won't be reinitialized -->
<div x-data="myComponent()" class="turbo-harmony-skip">
  ...
</div>

<!-- Using data attribute -->
<div x-data="myComponent()" data-turbo-harmony-skip>
  ...
</div>
```

### Error Handling

```javascript
const harmony = new TurboHarmony({
  onError: (error, context) => {
    console.error('TurboHarmony error:', error)
    // Send to error tracking service
    Sentry.captureException(error, { extra: context })
  }
})
```

### Performance Monitoring

```javascript
// Get performance metrics
const metrics = harmony.getMetrics()
console.log('Metrics:', metrics)

// Output:
// {
//   streamUpdates: 42,
//   frameUpdates: 15,
//   driveNavigation: 8,
//   reinitializations: 65,
//   errors: 0,
//   averageReinitTime: 2.34,
//   successRate: 100
// }
```

## 🐛 Debugging

### Enable Debug Mode

```javascript
const harmony = new TurboHarmony({ 
  debug: true,
  logLevel: 'debug' 
})
```

### Interactive Debugger

In development, press `Ctrl+Shift+H` to toggle the debug panel:

```javascript
import { TurboHarmonyDebugger } from 'turbo-harmony/debugger'

const debugger = new TurboHarmonyDebugger(harmony)
debugger.activate()
```

### Manual Controls

```javascript
// Manually reinitialize all Alpine components
harmony.reinitializeAll()

// Reset metrics
harmony.resetMetrics()

// Get lifecycle report
const report = harmony.getLifecycleReport()
```

## 🎯 Common Patterns

### Turbo Streams with Alpine

```erb
<!-- Rails Turbo Stream example -->
<turbo-stream action="append" target="messages">
  <template>
    <div x-data="message('Hello!')" x-init="$el.scrollIntoView()">
      <span x-text="text"></span>
    </div>
  </template>
</turbo-stream>
```

### Dynamic Components

```javascript
// Alpine component that works with Turbo Streams
Alpine.data('dynamicList', () => ({
  items: [],
  
  addItem(item) {
    this.items.push(item)
    // TurboHarmony ensures this works after stream updates
  }
}))
```

### Form Handling

```html
<form x-data="form()" 
      data-turbo-permanent
      @turbo:submit-end="handleResponse($event)">
  <!-- TurboHarmony preserves form state -->
</form>
```

## 🧪 Testing

```javascript
import { test, expect } from 'vitest'
import TurboHarmony from 'turbo-harmony'

test('reinitializes Alpine after Turbo Stream', async () => {
  const harmony = new TurboHarmony()
  
  // Simulate Turbo Stream update
  const event = new CustomEvent('turbo:stream-render', {
    detail: { target: document.body }
  })
  
  document.dispatchEvent(event)
  
  const metrics = harmony.getMetrics()
  expect(metrics.streamUpdates).toBe(1)
})
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repository
git clone https://github.com/turbo-harmony/turbo-harmony.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## 📝 License

MIT © TurboHarmony Contributors

## 🙏 Acknowledgments

- Alpine.js team for the reactive framework
- Hotwire team for Turbo
- All contributors and users of TurboHarmony

---

Made with ❤️ for the Alpine.js + Turbo community