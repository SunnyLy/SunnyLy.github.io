// Observe one known method in the supplied toy app, bounded by MAX_CALLS.
// Load separately from lab-inspect.js when studying method observation.
(() => {
  if (typeof Java === 'undefined' || !Java.available) {
    throw new Error('Java bridge/runtime unavailable; check the loading mode.');
  }
  Java.perform(() => {
    const MAX_CALLS = 5;
    const Probe = Java.use('com.example.fridalab.NoteProbe');
    const twice = Probe.twice.overload('int');
    let calls = 0;
    twice.implementation = function (value) {
      calls++;
      try {
        // Call this exact overload once. Return its result unchanged.
        const result = twice.call(this, value);
        console.log(JSON.stringify({ event: 'twice', call: calls, value, result }));
        return result;
      } finally {
        // No catch/alternate return: original business exceptions propagate.
        if (calls >= MAX_CALLS) twice.implementation = null;
      }
    };
    console.log('[lab] observe NoteProbe.twice(int); call limit=' + MAX_CALLS);
  });
})();
