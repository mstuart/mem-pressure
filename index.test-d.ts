import {expectType, expectError} from 'tsd';
import MemoryMonitor, {getMemorySnapshot, type MemorySnapshot} from './index.js';

// GetMemorySnapshot
const snapshot = getMemorySnapshot();
expectType<MemorySnapshot>(snapshot);
expectType<number>(snapshot.rss);
expectType<number>(snapshot.heapTotal);
expectType<number>(snapshot.heapUsed);
expectType<number>(snapshot.external);
expectType<number>(snapshot.arrayBuffers);
expectType<number>(snapshot.heapUsedRatio);

// MemoryMonitor constructor
const monitor = new MemoryMonitor();
expectType<MemoryMonitor>(monitor);

const monitor2 = new MemoryMonitor({threshold: 0.9});
expectType<MemoryMonitor>(monitor2);

const monitor3 = new MemoryMonitor({interval: 1000});
expectType<MemoryMonitor>(monitor3);

const monitor4 = new MemoryMonitor({threshold: 0.8, interval: 2000});
expectType<MemoryMonitor>(monitor4);

// Start/stop return this
expectType<MemoryMonitor>(monitor.start());
expectType<MemoryMonitor>(monitor.stop());

// Invalid usage
expectError(new MemoryMonitor({threshold: 'high'}));
expectError(new MemoryMonitor({interval: 'fast'}));
