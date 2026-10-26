package com.example.fridalab;

/** Pure teaching object: no account, network, storage, or security decisions. */
public final class NoteProbe implements Probe {
    private final String tag;

    public NoteProbe(String tag) {
        this.tag = tag;
    }

    public String getTag() {
        return tag;
    }

    @Override public int twice(int value) {
        return value * 2;
    }
}
