# TurboHarmony

> Alpine.js 與 Hotwire Turbo 的簡單整合工具

一個幫助 Alpine.js 和 Turbo 更好協作的小工具。

## 遇到的問題

在使用 Alpine.js 搭配 Turbo 時，可能會遇到：

- Turbo Stream 更新後，Alpine 組件沒有重新初始化
- 頁面導航時 Alpine 狀態丟失
- 組件重複初始化或記憶體洩漏

## 解決方法

TurboHarmony 提供簡單的解決方案：

- 自動重新初始化 Alpine 組件
- 基本的錯誤處理
- 可選的狀態保存功能
- 簡單的除錯工具

## 安裝方式

### NPM/Yarn

```bash
npm install github:kaochenlong/turbo-harmony
```

## 使用方式

### 基本使用

```javascript
import Alpine from 'alpinejs'
import TurboHarmony from 'turbo-harmony'

// 初始化 TurboHarmony
const harmony = new TurboHarmony()

// 啟動 Alpine
Alpine.start()
```

### 不同版本選擇

```javascript
// 完整版（包含所有功能）
import TurboHarmony from 'turbo-harmony'

// 標準版（移除除錯功能）
import TurboHarmony from 'turbo-harmony/standard'

// 精簡版（只有核心功能）
import TurboHarmony from 'turbo-harmony/lite'
```

### 基本設定

```javascript
const harmony = new TurboHarmony({
  // 開發時啟用除錯
  debug: true,

  // 是否保存狀態
  preserveState: false,

  // 要跳過的元素
  skipSelectors: ['.no-alpine', '.turbo-harmony-skip']
})
```

## 設定選項

| 選項            | 型別     | 預設值                    | 說明               |
| --------------- | -------- | ------------------------- | ------------------ |
| `debug`         | boolean  | `false`                   | 啟用除錯模式       |
| `preserveState` | boolean  | `false`                   | 保存組件狀態       |
| `skipSelectors` | array    | `['.turbo-harmony-skip']` | 跳過的選擇器       |
| `beforeReinit`  | function | `null`                    | 重新初始化前的回調 |
| `afterReinit`   | function | `null`                    | 重新初始化後的回調 |
| `onError`       | function | `null`                    | 錯誤處理回調       |

## 跳過特定元素

```html
<!-- 這個組件不會被重新初始化 -->
<div x-data="myComponent()" class="turbo-harmony-skip">...</div>
```

## 目前狀態

這是一個實驗性質的工具，主要用於解決我們專案中遇到的問題。如果對您有幫助，歡迎使用和回饋。

## 授權

MIT

---

# TurboHarmony

> Simple integration tool for Alpine.js and Hotwire Turbo

A small utility to help Alpine.js and Turbo work better together.

## Problems We Encountered

When using Alpine.js with Turbo, you might encounter:

- Alpine components not reinitializing after Turbo Stream updates
- Alpine state loss during page navigation
- Component double initialization or memory leaks

## Our Solution

TurboHarmony provides a simple solution:

- Automatically reinitialize Alpine components
- Basic error handling
- Optional state preservation
- Simple debugging tools

## Installation

### NPM/Yarn

```bash
npm install github:kaochenlong/turbo-harmony
```

## Usage

### Basic Usage

```javascript
import Alpine from 'alpinejs'
import TurboHarmony from 'turbo-harmony'

// Initialize TurboHarmony
const harmony = new TurboHarmony()

// Start Alpine
Alpine.start()
```

### Different Build Variants

```javascript
// Full version (all features)
import TurboHarmony from 'turbo-harmony'

// Standard version (no debug features)
import TurboHarmony from 'turbo-harmony/standard'

// Lite version (core features only)
import TurboHarmony from 'turbo-harmony/lite'
```

### Basic Configuration

```javascript
const harmony = new TurboHarmony({
  // Enable debug in development
  debug: true,

  // Whether to preserve state
  preserveState: false,

  // Elements to skip
  skipSelectors: ['.no-alpine', '.turbo-harmony-skip']
})
```

## Configuration Options

| Option          | Type     | Default                   | Description              |
| --------------- | -------- | ------------------------- | ------------------------ |
| `debug`         | boolean  | `false`                   | Enable debug mode        |
| `preserveState` | boolean  | `false`                   | Preserve component state |
| `skipSelectors` | array    | `['.turbo-harmony-skip']` | Skip selectors           |
| `beforeReinit`  | function | `null`                    | Before reinit callback   |
| `afterReinit`   | function | `null`                    | After reinit callback    |
| `onError`       | function | `null`                    | Error handler callback   |

## Skip Specific Elements

```html
<!-- This component won't be reinitialized -->
<div x-data="myComponent()" class="turbo-harmony-skip">...</div>
```

## Current Status

This is an experimental tool primarily built to solve problems in our own projects. If it helps you, feel free to use it and provide feedback.

## License

MIT

