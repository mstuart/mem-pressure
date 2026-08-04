# mem-pressure

> Monitor Node.js memory usage and emit events when thresholds are exceeded

## Install

```sh
npm install mem-pressure
```

## Usage

```js
import MemoryMonitor, {getMemorySnapshot} from 'mem-pressure';

const monitor = new MemoryMonitor({threshold: 0.9, interval: 10_000});

monitor.addEventListener('pressure', event => {
	console.log('Memory pressure detected!');
	console.log(`Heap usage: ${(event.detail.heapUsedRatio * 100).toFixed(1)}%`);
});

monitor.start();

// Get a one-off snapshot
const snapshot = getMemorySnapshot();
console.log(snapshot.heapUsedRatio);

// Stop monitoring
monitor.stop();
```

## API

### MemoryMonitor(options?)

Creates a new memory monitor instance. Extends `EventTarget`.

#### options

Type: `object`

##### threshold

Type: `number`\
Default: `0.85`

Heap usage ratio (0-1) at which to emit `'pressure'` events.

##### interval

Type: `number`\
Default: `5000`

Polling interval in milliseconds.

#### Events

##### `'pressure'`

Emitted when `heapUsed / heapTotal` exceeds the threshold. The listener receives a `CustomEvent` with `detail` set to a `MemorySnapshot` object.

#### .start()

Start monitoring memory usage. Returns `this` for chaining.

#### .stop()

Stop monitoring memory usage. Returns `this` for chaining.

#### `[Symbol.dispose]()`

Calls `.stop()`. Enables use with the `using` declaration.

### getMemorySnapshot()

Returns a `MemorySnapshot` object with the following properties:

- `rss` — Resident Set Size in bytes
- `heapTotal` — Total size of the allocated heap in bytes
- `heapUsed` — Actual memory used during execution in bytes
- `external` — Memory used by C++ objects bound to JavaScript objects in bytes
- `arrayBuffers` — Memory allocated for `ArrayBuffer` and `SharedArrayBuffer` in bytes
- `heapUsedRatio` — Ratio of `heapUsed` to `heapTotal` (0-1)

## Related

- [v8](https://nodejs.org/api/v8.html) - Node.js V8 API
- [process.memoryUsage](https://nodejs.org/api/process.html#processmemoryusage) - Node.js memory usage API

## License

MIT
