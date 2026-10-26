package com.example.binderstudy;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.os.Process;
import android.os.SystemClock;
import android.util.Log;

public final class ProgressListenerService extends Service {
    private final IProgressListener.Stub listener = new IProgressListener.Stub() {
        @Override
        public void onProgress(long taskId, int percent) {
            // 示例只记录一条小消息；这里不执行下载、数据库事务或等待锁。
            if (percent < 0 || percent > 100) {
                Log.w("BinderStudy", "invalid progress");
                return; // oneway 的业务校验结果不会自动返回给发送方。
            }
            Log.i("BinderStudy", "received: task=" + taskId + ", progress=" + percent
                    + ", pid=" + Process.myPid() + ", tid=" + Process.myTid()
                    + ", at=" + SystemClock.elapsedRealtime());
        }
    };

    @Override
    public IBinder onBind(Intent intent) {
        return listener;
    }
}
