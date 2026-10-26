Frida Java Lab source

This is source material for a self-owned Android debug app, not a prebuilt APK
or a complete Gradle project. It makes no network requests and handles no secrets.

1. Create an Android Java debug project with applicationId `com.example.fridalab`,
   Java 8 source support, and minSdk 21 or later.
2. Put the three Java files in `app/src/main/java/com/example/fridalab/`.
3. Merge the provided Activity declaration into the app Manifest, replacing any
   other MAIN/LAUNCHER entry for this exercise. No extra permissions are required.
4. Build and install your debug app on a dedicated test emulator/device. Open its
   Activity and confirm that the button produces `Result: 14` without instrumentation.
5. After setting up an official, compatible Frida connection for this test image,
   load `lab-inspect.js` with the Frida CLI. Run `lab-observe.js` separately to
   observe the sample's fixed `NoteProbe.twice(int)` overload.

The CLI supplies the Java bridge; a raw Frida 17 API script needs an explicitly
bundled bridge. Keep the app in the foreground for the instance lookup. A class
lookup during early startup does not imply that a live Activity instance exists.

`lab-inspect.js` limits output, not the cost of VM class/heap enumeration.
`lab-observe.js` restores the method after its MAX_CALLS limit; if fewer calls
occur, unload the script or end its session to remove it. Observation affects
timing and may be affected by optimization, so a missing log is not proof of an
unexecuted source method.

The repository checks Java compilation against Android SDK 35 and JavaScript
syntax. Device injection, ART compatibility and UI behavior still need an actual
runtime test; no such result is implied by the source archive.
