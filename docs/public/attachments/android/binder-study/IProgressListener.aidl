package com.example.binderstudy;

interface IProgressListener {
    oneway void onProgress(long taskId, int percent);
}
