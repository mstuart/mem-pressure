export type MemorySnapshot = {
	/**
	Resident Set Size in bytes.
	*/
	rss: number;

	/**
	Total size of the allocated heap in bytes.
	*/
	heapTotal: number;

	/**
	Actual memory used during execution in bytes.
	*/
	heapUsed: number;

	/**
	Memory used by C++ objects bound to JavaScript objects in bytes.
	*/
	external: number;

	/**
	Memory allocated for `ArrayBuffer` and `SharedArrayBuffer` in bytes.
	*/
	arrayBuffers: number;

	/**
	Ratio of `heapUsed` to `heapTotal` (0-1).
	*/
	heapUsedRatio: number;
};

export type MemoryMonitorOptions = {
	/**
	Heap usage ratio (0-1) at which to emit `'pressure'` events.

	@default 0.85
	*/
	threshold?: number;

	/**
	Polling interval in milliseconds.

	@default 5000
	*/
	interval?: number;
};

/**
A `CustomEvent` emitted when memory pressure is detected.
*/
export type MemoryPressureEvent = CustomEvent<MemorySnapshot>;

/**
Monitor Node.js memory usage and emit events when thresholds are exceeded.

@param options - Configuration options.

@example
```
import MemoryMonitor from 'mem-pressure';

const monitor = new MemoryMonitor({threshold: 0.9, interval: 10_000});

monitor.addEventListener('pressure', event => {
	console.log('Memory pressure!', event.detail.heapUsedRatio);
});

monitor.start();

// Later...
monitor.stop();
```
*/
export default class MemoryMonitor extends EventTarget {
	constructor(options?: MemoryMonitorOptions);

	/**
	Start monitoring memory usage.

	@returns The monitor instance for chaining.
	*/
	start(): this;

	/**
	Stop monitoring memory usage.

	@returns The monitor instance for chaining.
	*/
	stop(): this;

	/**
	Dispose of the monitor, stopping any active monitoring.
	*/
	[Symbol.dispose](): void; // eslint-disable-line unicorn/no-nonstandard-builtin-properties
}

/**
Get a snapshot of current memory usage.

@returns An object with RSS, heap, external, and array buffer memory figures in bytes.

@example
```
import {getMemorySnapshot} from 'mem-pressure';

const snapshot = getMemorySnapshot();
console.log(snapshot.heapUsedRatio);
//=> 0.42
```
*/
export function getMemorySnapshot(): MemorySnapshot;
