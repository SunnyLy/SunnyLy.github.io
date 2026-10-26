package com.example.binderstudy;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.os.SystemClock;
import android.util.Log;
import android.widget.TextView;

public final class ProgressDemoActivity extends Activity {
    private boolean bound;
    private final ServiceConnection connection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder binder) {
            IProgressListener listener = IProgressListener.Stub.asInterface(binder);
            new Thread(() -> {
                try {
                    listener.onProgress(7L, 50);
                    // 只记录本次调用返回；不能据此显示“接收方处理成功”。
                    Log.i("BinderStudy", "send returned at=" + SystemClock.elapsedRealtime());
                } catch (RemoteException e) {
                    // oneway 在编码、提交或传输阶段仍可能失败。
                    Log.e("BinderStudy", "send failed", e);
                }
            }, "progress-sender").start();
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.w("BinderStudy", "service disconnected");
        }
    };

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        TextView text = new TextView(this);
        text.setText("查看 BinderStudy 日志，比较 send returned 与 received。");
        setContentView(text);
    }

    @Override
    protected void onStart() {
        super.onStart();
        bound = bindService(new Intent(this, ProgressListenerService.class),
                connection, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void onStop() {
        if (bound) {
            unbindService(connection);
            bound = false;
        }
        super.onStop();
    }
}
