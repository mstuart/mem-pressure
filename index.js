import {EventEmitter} from 'node:events';
import process from 'node:process';

/**
Get a snapshot of current memory usage.

@returns {{rss: number, heapTotal: number, heapUsed: number, external: number, arrayBuffers: number, heapUsedRatio: number}} The memory snapshot.
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
export default class MemoryMonitor extends EventEmitter {
	#threshold;
	#interval;
	#timer;

	/**
	@param {object} [options]
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

	@returns {this}
	*/
	start() {
		if (this.#timer) {
			return this;
		}

		this.#timer = setInterval(() => {
			const snapshot = getMemorySnapshot();

			if (snapshot.heapUsedRatio >= this.#threshold) {
				this.emit('pressure', snapshot);
			}
		}, this.#interval);

		this.#timer.unref();

		return this;
	}

	/**
	Stop monitoring memory usage.

	@returns {this}
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
	[Symbol.dispose]() {
		this.stop();
	}
}
