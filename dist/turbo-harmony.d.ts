declare module 'turbo-harmony' {
  export interface TurboHarmonyOptions {
    /**
     * Enable debug mode
     * @default false
     */
    debug?: boolean;

    /**
     * Log level for debug messages
     * @default 'warn'
     */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';

    /**
     * Preserve Alpine component state during reinitializations
     * @default false
     */
    preserveState?: boolean;

    /**
     * CSS selectors for elements whose state should be preserved
     * @default ['[x-data]']
     */
    preserveStateSelectors?: string[];

    /**
     * CSS selectors for elements to skip during reinitialization
     * @default ['.turbo-harmony-skip', '.no-alpine', '[data-turbo-harmony-skip]']
     */
    skipSelectors?: string[];

    /**
     * Delay in milliseconds before reinitializing Alpine components
     * @default 0
     */
    reinitDelay?: number;

    /**
     * Batch multiple updates for better performance
     * @default true
     */
    batchUpdates?: boolean;

    /**
     * Callback executed before Alpine reinitialization
     */
    beforeReinit?: (element: HTMLElement) => void;

    /**
     * Callback executed after Alpine reinitialization
     */
    afterReinit?: (element: HTMLElement) => void;

    /**
     * Custom error handler
     */
    onError?: (error: Error, context: ErrorContext) => void;

    /**
     * Alpine attributes to watch for changes
     * @default ['x-data', 'x-show', 'x-if', 'x-for']
     */
    watchAttributes?: string[];

    /**
     * Automatically initialize TurboHarmony on creation
     * @default true
     */
    autoStart?: boolean;
  }

  export interface ErrorContext {
    message: string;
    context: string;
    timestamp: string;
    metrics: Metrics;
  }

  export interface Metrics {
    streamUpdates: number;
    frameUpdates: number;
    driveNavigation: number;
    reinitializations: number;
    errors: number;
    performance: number[];
    startTime: number;
    uptime: number;
    averageReinitTime: number;
    successRate: number;
    totalComponents: number;
    lifecycleReport: LifecycleReport[];
  }

  export interface LifecycleReport {
    component: string;
    events: LifecycleEvent[];
    totalEvents: number;
    duplicateInits: number;
  }

  export interface LifecycleEvent {
    event: 'queued' | 'initialized' | 'skipped' | 'beforeDestroy';
    timestamp: number;
    element: {
      id: string;
      classes: string;
      tag: string;
    };
  }

  export class TurboHarmony {
    constructor(options?: TurboHarmonyOptions);

    /**
     * Initialize TurboHarmony
     */
    init(): TurboHarmony;

    /**
     * Get current metrics
     */
    getMetrics(): Metrics;

    /**
     * Reset all metrics
     */
    resetMetrics(): void;

    /**
     * Get lifecycle report for debugging
     */
    getLifecycleReport(): LifecycleReport[];

    /**
     * Manually reinitialize Alpine for the entire document
     */
    reinitializeAll(): void;

    /**
     * Destroy TurboHarmony and clean up event listeners
     */
    destroy(): void;

    /**
     * Current configuration options
     */
    readonly options: Required<TurboHarmonyOptions>;

    /**
     * Whether TurboHarmony is initialized
     */
    readonly isInitialized: boolean;
  }

  export default TurboHarmony;
}

declare module 'turbo-harmony/debugger' {
  import { TurboHarmony } from 'turbo-harmony';

  export class TurboHarmonyDebugger {
    constructor(turboHarmony: TurboHarmony);

    /**
     * Activate the debugger interface
     */
    activate(): void;

    /**
     * Deactivate the debugger
     */
    deactivate(): void;

    /**
     * Refresh the metrics display
     */
    refreshMetrics(): void;

    /**
     * Export metrics to console and clipboard
     */
    exportMetrics(): void;

    /**
     * Toggle log output visibility
     */
    toggleLogging(): void;

    /**
     * Whether the debugger is active
     */
    readonly isActive: boolean;
  }
}