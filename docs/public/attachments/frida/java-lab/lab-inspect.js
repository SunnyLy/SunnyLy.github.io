// For the supplied com.example.fridalab debug sample and Frida CLI only.
// No business methods are replaced, no data outside the sample is printed.
(() => {
  if (typeof Java === 'undefined' || !Java.available) {
    throw new Error('Java bridge/runtime unavailable; check the loading mode.');
  }
  Java.perform(() => {
    const MAX_ROWS = 8;
    const Class = Java.use('java.lang.Class');
    let printedClasses = 0;
    Java.enumerateLoadedClasses({
      onMatch(name, handle) {
        if (!name.startsWith('com.example.fridalab.') || printedClasses >= MAX_ROWS) return;
        printedClasses++;
        // Use the actual Class handle, avoiding an assumed default ClassLoader.
        const type = Java.cast(handle, Class);
        const interfaces = type.getInterfaces();
        const names = [];
        for (let i = 0; i < interfaces.length; i++) {
          names.push(String(interfaces[i].getName()));
        }
        console.log(JSON.stringify({ event: 'class', name, directInterfaces: names }));
      },
      onComplete() {
        console.log('[lab] loaded-class enumeration complete');
      },
    });

    const groups = Java.enumerateMethods('com.example.fridalab.*!twice/su');
    let printedMethods = 0;
    for (const group of groups) {
      for (const type of group.classes) {
        for (const method of type.methods) {
          if (printedMethods++ >= MAX_ROWS) continue;
          console.log(JSON.stringify({ event: 'method', className: type.name, method }));
        }
      }
    }

    Java.choose('com.example.fridalab.NoteProbe', {
      onMatch(instance) {
        // Only read the sample's constant tag; do not retain the instance.
        console.log(JSON.stringify({ event: 'instance', tag: String(instance.getTag()) }));
        return 'stop';
      },
      onComplete() {
        console.log('[lab] instance enumeration complete');
      },
    });
  });
})();
