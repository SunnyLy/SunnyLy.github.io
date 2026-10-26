package com.example.fridalab;

import android.app.Activity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public final class DemoActivity extends Activity {
    // Keep a strong reference while the Activity is alive for Java.choose().
    private final NoteProbe probe = new NoteProbe("local-demo");

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        TextView result = new TextView(this);
        result.setText("Click to run NoteProbe.twice(7)");
        Button run = new Button(this);
        run.setText("Run twice(7)");
        run.setOnClickListener(view -> result.setText("Result: " + probe.twice(7)));
        layout.addView(result);
        layout.addView(run);
        setContentView(layout);
    }
}
