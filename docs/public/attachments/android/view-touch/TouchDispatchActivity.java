package com.example.touchstudy;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

/** Ordinary framework Views; no AndroidX dependency. Filter logcat by TouchStudy. */
public final class TouchDispatchActivity extends Activity {
    private static final String TAG = "TouchStudy";

    static void log(String owner, String method, MotionEvent e, boolean result) {
        Log.d(TAG, owner + "." + method + " "
                + MotionEvent.actionToString(e.getAction()) + " -> " + result);
    }

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        int padding = dp(20);
        root.setPadding(padding, padding, padding, padding);

        TextView hint = new TextView(this);
        hint.setText("点击蓝色按钮；水平拖动观察子 View 的 CANCEL。\n"
                + "切换模式后比较。多指时可抬起当前拖动手指，观察平滑接续。\n"
                + "下方父容器只演示水平拖动，不实现纵向滚动。日志标签：TouchStudy");
        root.addView(hint);

        final HorizontalDragLayout stage = new HorizontalDragLayout(this);
        stage.setBackgroundColor(Color.rgb(235, 240, 248));
        Button mode = new Button(this);
        mode.setText("父容器拦截：开启");
        mode.setOnClickListener(v -> {
            stage.interceptEnabled = !stage.interceptEnabled;
            mode.setText("父容器拦截：" + (stage.interceptEnabled ? "开启" : "关闭"));
        });
        root.addView(mode);
        root.addView(stage, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(260)));

        LoggedButton child = new LoggedButton(this);
        child.setText("点我 / 水平拖动");
        child.setTextColor(Color.WHITE);
        child.setBackgroundTintList(android.content.res.ColorStateList.valueOf(
                Color.rgb(37, 99, 235)));
        child.setOnTouchListener((v, e) -> {
            log("Child", "OnTouchListener", e, false);
            return false; // 保留 Button 自己的按压、取消和点击逻辑。
        });
        child.setOnClickListener(v -> Toast.makeText(this,
                "onClick：本次点击成立", Toast.LENGTH_SHORT).show());
        stage.addView(child, new FrameLayout.LayoutParams(dp(170), dp(100), Gravity.CENTER));
        setContentView(root);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override public boolean dispatchTouchEvent(MotionEvent e) {
        boolean handled = super.dispatchTouchEvent(e);
        log("Activity", "dispatchTouchEvent", e, handled);
        return handled;
    }

    @Override public boolean onTouchEvent(MotionEvent e) {
        boolean handled = super.onTouchEvent(e);
        log("Activity", "onTouchEvent", e, handled);
        return handled;
    }

    private static final class LoggedButton extends Button {
        LoggedButton(Context context) { super(context); }

        @Override public boolean dispatchTouchEvent(MotionEvent e) {
            boolean handled = super.dispatchTouchEvent(e);
            log("Child", "dispatchTouchEvent", e, handled);
            return handled;
        }

        @Override public boolean onTouchEvent(MotionEvent e) {
            boolean handled = super.onTouchEvent(e);
            log("Child", "onTouchEvent", e, handled);
            return handled;
        }
    }

    private static final class HorizontalDragLayout extends FrameLayout {
        boolean interceptEnabled = true;
        private final int touchSlop;
        private int activePointerId = MotionEvent.INVALID_POINTER_ID;
        private float downX, downY, lastX;
        private boolean dragging;

        HorizontalDragLayout(Context context) {
            super(context);
            touchSlop = ViewConfiguration.get(context).getScaledTouchSlop();
            setMotionEventSplittingEnabled(false); // 本例只观察一个子触摸目标。
        }

        @Override public boolean dispatchTouchEvent(MotionEvent e) {
            boolean handled = super.dispatchTouchEvent(e);
            log("Parent", "dispatchTouchEvent", e, handled);
            int action = e.getActionMasked();
            if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
                resetGesture(); // 子 View 处理完结事件时，父 onTouchEvent 不一定会执行。
            }
            return handled;
        }

        @Override public boolean onInterceptTouchEvent(MotionEvent e) {
            switch (e.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    activePointerId = e.getPointerId(0);
                    downX = lastX = e.getX(0);
                    downY = e.getY(0);
                    dragging = false;
                    break; // 让子 View 先获得 DOWN，保留点击机会。
                case MotionEvent.ACTION_MOVE:
                    int index = e.findPointerIndex(activePointerId);
                    if (interceptEnabled && index >= 0 && shouldStartDrag(e, index)) {
                        dragging = true;
                        lastX = e.getX(index); // 舍去越过阈值的这一段，避免接管时跳动。
                        getParent().requestDisallowInterceptTouchEvent(true);
                    }
                    break;
                case MotionEvent.ACTION_POINTER_UP:
                    switchActivePointer(e);
                    break;
                default:
                    break;
            }
            log("Parent", "onInterceptTouchEvent", e, dragging);
            return dragging;
        }

        private boolean shouldStartDrag(MotionEvent e, int index) {
            float dx = e.getX(index) - downX;
            float dy = e.getY(index) - downY;
            return Math.abs(dx) > touchSlop && Math.abs(dx) > Math.abs(dy);
        }

        @Override public boolean onTouchEvent(MotionEvent e) {
            switch (e.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    // 点在父容器空白处时也可以由父容器持有这条序列。
                    activePointerId = e.getPointerId(0);
                    downX = lastX = e.getX(0);
                    downY = e.getY(0);
                    break;
                case MotionEvent.ACTION_MOVE:
                    int index = e.findPointerIndex(activePointerId);
                    if (index < 0) break;
                    if (!dragging && interceptEnabled && shouldStartDrag(e, index)) {
                        dragging = true;
                        lastX = e.getX(index);
                        getParent().requestDisallowInterceptTouchEvent(true);
                    }
                    if (dragging) {
                        View child = getChildAt(0);
                        float limit = Math.max(0f, (getWidth() - child.getWidth()) / 2f);
                        float next = child.getTranslationX() + e.getX(index) - lastX;
                        child.setTranslationX(Math.max(-limit, Math.min(limit, next)));
                        lastX = e.getX(index);
                    }
                    break;
                case MotionEvent.ACTION_POINTER_UP:
                    switchActivePointer(e);
                    break;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    resetGesture(); // CANCEL 只清理，不把它当作一次点击提交。
                    break;
                default:
                    break;
            }
            log("Parent", "onTouchEvent", e, true);
            return true;
        }

        private void switchActivePointer(MotionEvent e) {
            int lifted = e.getActionIndex();
            if (e.getPointerId(lifted) != activePointerId) return;
            int next = lifted == 0 ? 1 : 0;
            if (next >= e.getPointerCount()) {
                activePointerId = MotionEvent.INVALID_POINTER_ID;
                return;
            }
            activePointerId = e.getPointerId(next);
            downX = lastX = e.getX(next); // 切换坐标基准，不能沿用离开手指的 lastX。
            downY = e.getY(next);
        }

        private void resetGesture() {
            dragging = false;
            activePointerId = MotionEvent.INVALID_POINTER_ID;
            if (getParent() != null) getParent().requestDisallowInterceptTouchEvent(false);
        }
    }
}
