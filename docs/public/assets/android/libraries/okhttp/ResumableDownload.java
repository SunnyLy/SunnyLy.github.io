import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

import java.io.*;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 单文件、单区间下载任务；每次重试创建新实例，在后台线程调用。 */
public final class ResumableDownload {
    private static final Pattern RANGE = Pattern.compile("bytes ([0-9]+)-([0-9]+)/([0-9]+)");
    private static final Pattern UNSATISFIED = Pattern.compile("bytes \\*/([0-9]+)");
    private final OkHttpClient client;
    private volatile Call active;
    private volatile boolean cancelled;
    private boolean used;

    public ResumableDownload(OkHttpClient sharedClient) {
        // 共享连接池和 Dispatcher；本例直接验证网络响应，不混用 HTTP 磁盘缓存。
        client = sharedClient.newBuilder().cache(null).build();
    }

    public void cancel() {
        cancelled = true;
        Call call = active;
        if (call != null) call.cancel();
    }

    public synchronized File download(String url, File target, String sha256, long maxBytes)
            throws IOException {
        if (used) throw new IllegalStateException("Create a new task for each attempt");
        used = true;
        if (sha256 == null || !sha256.matches("[0-9a-fA-F]{64}") || maxBytes <= 0) {
            throw new IllegalArgumentException("Trusted SHA-256 and positive size limit required");
        }
        sha256 = sha256.toLowerCase(java.util.Locale.ROOT);
        File parent = target.getAbsoluteFile().getParentFile();
        if (!parent.isDirectory() && !parent.mkdirs()) throw new IOException("Cannot create directory");
        File part = new File(target.getPath() + ".part");
        File meta = new File(target.getPath() + ".part.properties");
        // 独立锁文件不删除，避免不同进程锁住不同 inode；所有写入者须遵循同一协议。
        try (RandomAccessFile lockFile = new RandomAccessFile(target.getPath() + ".lock", "rw");
             FileLock lock = lockFile.getChannel().tryLock()) {
            if (lock == null) throw new IOException("Another writer owns this target");
            checkCancelled();
            if (target.exists()) {
                if (target.length() <= maxBytes && matches(target, sha256)) return target;
                throw new IOException("Target exists; use a new versioned filename");
            }
            try (RandomAccessFile out = new RandomAccessFile(part, "rw")) {
                Properties state = readState(meta);
                String etag = state.getProperty("etag");
                long total = numberOrUnknown(state.getProperty("total"));
                long offset = out.length(); // 只适用于从 0 连续写入的单区间文件。
                boolean resumable = url.equals(state.getProperty("url"))
                        && sha256.equals(state.getProperty("sha256")) && strongEtag(etag)
                        && total >= 0 && total <= maxBytes && offset <= total;
                if (!resumable) {
                    out.setLength(0);
                    out.getFD().sync();
                    offset = 0;
                }
                Request.Builder request = new Request.Builder().url(url)
                        .header("Accept-Encoding", "identity");
                if (offset > 0) {
                    request.header("Range", "bytes=" + offset + "-")
                            .header("If-Range", etag);
                }
                active = client.newCall(request.build());
                checkCancelled(); // 处理 cancel() 发生在 Call 创建之前的竞争。
                try (Response response = active.execute()) {
                    long expected;
                    if (response.code() == 416 && offset > 0) {
                        Matcher m = UNSATISFIED.matcher(value(response.header("Content-Range")));
                        if (m.matches() && number(m.group(1)) == offset && matches(part, sha256)) {
                            out.getFD().sync();
                            // 不把 416 本身当完成证据；可信摘要也必须一致。
                        } else {
                            out.setLength(0);
                            out.getFD().sync();
                            throw new IOException("416 not proven complete; next attempt starts at 0");
                        }
                    } else {
                        if (response.code() != 200 && response.code() != 206) {
                            throw new IOException("HTTP " + response.code());
                        }
                        String encoding = response.header("Content-Encoding");
                        if (encoding != null && !"identity".equalsIgnoreCase(encoding)) {
                            throw new IOException("Encoded representation is unsupported");
                        }
                        ResponseBody body = response.body();
                        if (body == null) throw new IOException("Missing body");
                        if (response.code() == 206) {
                            Matcher m = RANGE.matcher(value(response.header("Content-Range")));
                            if (offset == 0 || !m.matches()) throw new IOException("Unexpected 206");
                            long start = number(m.group(1)), end = number(m.group(2));
                            long reportedTotal = number(m.group(3));
                            String returnedEtag = response.header("ETag");
                            // If-Range 成功的 206 可以省略 ETag；若携带，则必须与保存值相同。
                            if (start != offset || end < start || reportedTotal <= end
                                    || reportedTotal != total
                                    || (returnedEtag != null && !etag.equals(returnedEtag))
                                    || value(response.header("Content-Type")).startsWith("multipart/")) {
                                throw new IOException("Content-Range or resource version mismatch");
                            }
                            expected = end - start + 1;
                            if (body.contentLength() >= 0 && body.contentLength() != expected) {
                                throw new IOException("Partial response length mismatch");
                            }
                        } else {
                            // 即使请求带了 Range，200 的 Body 仍然是完整文件，绝不能 append。
                            total = body.contentLength();
                            if (total > maxBytes) throw new IOException("File exceeds limit");
                            out.setLength(0);
                            out.getFD().sync();
                            offset = 0;
                            // 先清空旧数据，再保存新版本。元数据损坏时下次保守重下。
                            saveState(meta, url, sha256, response.header("ETag"), total);
                            expected = total;
                        }
                        out.seek(offset);
                        long received = 0;
                        try (InputStream in = body.byteStream()) {
                            byte[] buffer = new byte[8192];
                            int count;
                            while ((count = in.read(buffer)) != -1) {
                                checkCancelled();
                                if (count > maxBytes - offset - received
                                        || (expected >= 0 && count > expected - received)) {
                                    out.setLength(0); // 响应越界，丢弃不可再信任的片段。
                                    throw new IOException("Body exceeds declared range or size limit");
                                }
                                out.write(buffer, 0, count);
                                received += count;
                            }
                        } finally {
                            out.getFD().sync(); // 网络失败时保留已经连续写入的前缀。
                        }
                        if ((expected >= 0 && received != expected)
                                || (total >= 0 && out.length() != total)) {
                            throw new IOException("Incomplete file; retry with a new task");
                        }
                        checkCancelled();
                        if (!matches(part, sha256)) {
                            out.setLength(0);
                            out.getFD().sync();
                            throw new IOException("SHA-256 mismatch; next attempt starts at 0");
                        }
                    }
                } finally {
                    active = null;
                }
            }
            checkCancelled();
            // 同目录、新文件名；验证前不会暴露正式文件。失败保留 part 和元数据。
            if (!part.renameTo(target)) throw new IOException("Cannot publish verified file");
            return target;
        } catch (OverlappingFileLockException e) {
            throw new IOException("Another writer owns this target", e);
        }
    }

    private void checkCancelled() throws IOException {
        if (cancelled || Thread.currentThread().isInterrupted()) throw new InterruptedIOException("Cancelled");
    }

    private static boolean strongEtag(String tag) {
        // RFC entity-tag 语法；W/ 前缀不匹配，不能放入 If-Range。
        return tag != null && tag.matches("\"[\\x21\\x23-\\x7E\\x80-\\xFF]*\"");
    }

    private static Properties readState(File meta) {
        Properties p = new Properties();
        try (InputStream in = new FileInputStream(meta)) { p.load(in); }
        catch (IOException | IllegalArgumentException e) { p.clear(); }
        return p;
    }

    private static void saveState(File meta, String url, String sha, String etag, long total)
            throws IOException {
        Properties p = new Properties();
        p.setProperty("url", url);
        p.setProperty("sha256", sha);
        p.setProperty("etag", value(etag));
        p.setProperty("total", Long.toString(total));
        try (FileOutputStream out = new FileOutputStream(meta)) {
            p.store(out, "single-range download");
            out.getFD().sync();
        }
    }

    private static boolean matches(File file, String expected) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream in = new FileInputStream(file)) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = in.read(buffer)) != -1) digest.update(buffer, 0, count);
            }
            StringBuilder hex = new StringBuilder();
            for (byte b : digest.digest()) {
                hex.append(Character.forDigit((b >>> 4) & 15, 16));
                hex.append(Character.forDigit(b & 15, 16));
            }
            return expected.equals(hex.toString());
        } catch (NoSuchAlgorithmException impossible) { throw new AssertionError(impossible); }
    }

    private static long number(String value) throws IOException {
        try { return Long.parseLong(value); }
        catch (NumberFormatException e) { throw new IOException("Invalid byte count", e); }
    }

    private static long numberOrUnknown(String value) {
        try { return Long.parseLong(value); }
        catch (NumberFormatException e) { return -1; }
    }

    private static String value(String s) { return s == null ? "" : s; }
}
