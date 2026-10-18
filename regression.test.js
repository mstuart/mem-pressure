import test from "ava";
import MemoryMonitor from "./index.js";

test("rejects intervals that would overflow into rapid polling", (t) => {
  t.throws(() => new MemoryMonitor({ interval: 2 ** 31 }), {
    instanceOf: RangeError,
  });
  const monitor = new MemoryMonitor({ interval: 2_147_483_647 });
  monitor.start();
  monitor.stop();
});
