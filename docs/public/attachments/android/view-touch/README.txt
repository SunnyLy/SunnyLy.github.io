View touch dispatch study

1. Add TouchDispatchActivity.java to an ordinary Android application module.
   The example package is com.example.touchstudy; adapt it to your own project.
2. Register the activity in the application's AndroidManifest.xml:
   <activity android:name="com.example.touchstudy.TouchDispatchActivity"
             android:exported="false" />
3. Open it from another Activity in the same app:
   startActivity(new android.content.Intent(this,
       com.example.touchstudy.TouchDispatchActivity.class));
4. Observe logs with:
   adb logcat -s TouchStudy:D

This file uses public framework APIs, requires API 21 or later, and has no
AndroidX dependency. Runtime permission or network access is not needed.
Java source compilation is checked against Android SDK 35. Compilation does
not replace an on-device interaction check.

Try tapping the blue button, moving horizontally past touch slop, toggling
parent interception, and lifting the active finger while another stays down.
When a child is intercepted mid-gesture, it receives CANCEL instead of a
successful click. The intercepting MOVE is used to cancel the child; do not
assume the parent's onTouchEvent receives that same MOVE.

The parent only demonstrates horizontal drag. It does not implement vertical
scroll, fling, nested scrolling or drag-state restoration. Use the framework
Button for the child's accessible click behavior. Return-value logs are
printed AFTER super returns, so their order shows stack unwinding.
