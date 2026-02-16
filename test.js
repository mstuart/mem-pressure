import test from 'ava';
import MemoryMonitor, {getMemorySnapshot} from './index.js';

// getMemorySnapshot tests

test('getMemorySnapshot returns all expected fields', t => {
	const snapshot = getMemorySnapshot();
	t.is(typeof snapshot.rss, 'number');
	t.is(typeof snapshot.heapTotal, 'number');
	t.is(typeof snapshot.heapUsed, 'number');
	t.is(typeof snapshot.external, 'number');
	t.is(typeof snapshot.arrayBuffers, 'number');
	t.is(typeof snapshot.heapUsedRatio, 'number');
});

test('getMemorySnapshot heapUsedRatio is between 0 and 1', t => {
	const snapshot = getMemorySnapshot();
	t.true(snapshot.heapUsedRatio >= 0);
	t.true(snapshot.heapUsedRatio <= 1);
});

test('getMemorySnapshot rss is positive', t => {
	const snapshot = getMemorySnapshot();
	t.true(snapshot.rss > 0);
});

test('getMemorySnapshot heapTotal is positive', t => {
	const snapshot = getMemorySnapshot();
	t.true(snapshot.heapTotal > 0);
});

test('getMemorySnapshot heapUsed is positive', t => {
	const snapshot = getMemorySnapshot();
	t.true(snapshot.heapUsed > 0);
});

test('getMemorySnapshot heapUsedRatio equals heapUsed / heapTotal', t => {
	const snapshot = getMemorySnapshot();
	const expected = snapshot.heapUsed / snapshot.heapTotal;
	t.is(snapshot.heapUsedRatio, expected);
});

// MemoryMonitor constructor tests

test('constructor with default options', t => {
	const monitor = new MemoryMonitor();
	t.truthy(monitor);
	t.true(monitor instanceof MemoryMonitor);
});

test('constructor with custom threshold', t => {
	const monitor = new MemoryMonitor({threshold: 0.5});
	t.truthy(monitor);
});

test('constructor with custom interval', t => {
	const monitor = new MemoryMonitor({interval: 1000});
	t.truthy(monitor);
});

test('constructor throws on invalid threshold type', t => {
	t.throws(() => new MemoryMonitor({threshold: 'high'}), {
		instanceOf: TypeError,
		message: 'Expected `threshold` to be a number between 0 and 1',
	});
});

test('constructor throws on threshold > 1', t => {
	t.throws(() => new MemoryMonitor({threshold: 1.5}), {
		instanceOf: TypeError,
	});
});

test('constructor throws on threshold < 0', t => {
	t.throws(() => new MemoryMonitor({threshold: -0.1}), {
		instanceOf: TypeError,
	});
});

test('constructor throws on invalid interval type', t => {
	t.throws(() => new MemoryMonitor({interval: 'fast'}), {
		instanceOf: TypeError,
		message: 'Expected `interval` to be a positive number',
	});
});

test('constructor throws on interval <= 0', t => {
	t.throws(() => new MemoryMonitor({interval: 0}), {
		instanceOf: TypeError,
	});
});

// start/stop tests

test('start returns this for chaining', t => {
	const monitor = new MemoryMonitor();
	const result = monitor.start();
	t.is(result, monitor);
	monitor.stop();
});

test('stop returns this for chaining', t => {
	const monitor = new MemoryMonitor();
	const result = monitor.stop();
	t.is(result, monitor);
});

test('start can be called multiple times safely', t => {
	const monitor = new MemoryMonitor({interval: 100});
	monitor.start();
	monitor.start();
	t.pass();
	monitor.stop();
});

test('stop can be called multiple times safely', t => {
	const monitor = new MemoryMonitor();
	monitor.start();
	monitor.stop();
	monitor.stop();
	t.pass();
});

test('stop can be called without start', t => {
	const monitor = new MemoryMonitor();
	monitor.stop();
	t.pass();
});

// Pressure event test

test('emits pressure event when threshold is low', async t => {
	const monitor = new MemoryMonitor({threshold: 0, interval: 10});

	const snapshot = await new Promise(resolve => {
		monitor.on('pressure', snapshot => {
			resolve(snapshot);
		});

		monitor.start();
	});

	monitor.stop();

	t.is(typeof snapshot.rss, 'number');
	t.is(typeof snapshot.heapTotal, 'number');
	t.is(typeof snapshot.heapUsed, 'number');
	t.is(typeof snapshot.heapUsedRatio, 'number');
});

// Symbol.dispose tests

test('Symbol.dispose stops monitoring', t => {
	const monitor = new MemoryMonitor({interval: 10});
	monitor.start();
	monitor[Symbol.dispose]();
	t.pass();
});

test('Symbol.dispose can be called multiple times', t => {
	const monitor = new MemoryMonitor();
	monitor.start();
	monitor[Symbol.dispose]();
	monitor[Symbol.dispose]();
	t.pass();
});

test('monitor has Symbol.dispose method', t => {
	const monitor = new MemoryMonitor();
	t.is(typeof monitor[Symbol.dispose], 'function');
});
