import process from 'node:process';

/**
Get a snapshot of current memory usage.

@returns {{rss: number, heapTotal: number, heapUsed: number, external: number, arrayBuffers: number, heapUsedRatio: number}} An object with RSS, heap, external, and array buffer memory figures in bytes.
*/
export function getMemorySnapshot() {
	const {rss, heapTotal, heapUsed, external, arrayBuffers} = process.memoryUsage();

	return {
		rss,
		heapTotal,
		heapUsed,
		external,
		arrayBuffers,
		heapUsedRatio: heapUsed / heapTotal,
	};
}

/**
Monitor Node.js memory usage and emit events when thresholds are exceeded.
*/
export default class MemoryMonitor extends EventTarget {
	#threshold;
	#interval;
	#timer;

	/**
	Create a new memory monitor.

	@param {object} [options] - Configuration options.
	@param {number} [options.threshold=0.85] - Heap usage ratio (0-1) at which to emit `'pressure'` events.
	@param {number} [options.interval=5000] - Polling interval in milliseconds.
	*/
	constructor(options = {}) {
		super();
		const {threshold = 0.85, interval = 5000} = options;

		if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
			throw new TypeError('Expected `threshold` to be a number between 0 and 1');
		}

		if (typeof interval !== 'number' || interval <= 0) {
			throw new TypeError('Expected `interval` to be a positive number');
		}

		this.#threshold = threshold;
		this.#interval = interval;
		this.#timer = undefined;
	}

	/**
	Start monitoring memory usage.

	@returns {this} The monitor instance, for chaining.
	*/
	start() {
		if (this.#timer) {
			return this;
		}

		this.#timer = setInterval(() => {
			const snapshot = getMemorySnapshot();

			if (snapshot.heapUsedRatio >= this.#threshold) {
				this.dispatchEvent(new CustomEvent('pressure', {detail: snapshot}));
			}
		}, this.#interval);

		this.#timer.unref();

		return this;
	}

	/**
	Stop monitoring memory usage.

	@returns {this} The monitor instance, for chaining.
	*/
	stop() {
		if (this.#timer) {
			clearInterval(this.#timer);
			this.#timer = undefined;
		}

		return this;
	}

	/**
	Dispose of the monitor, stopping any active monitoring.
	*/
	[Symbol.dispose]() { // eslint-disable-line unicorn/no-nonstandard-builtin-properties
		this.stop();
	}
}
