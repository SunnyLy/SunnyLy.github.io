"""Loopback-only network learning lab. Python 3.11+, standard library only.

Run `python network_lab.py --help`. This is a teaching server, not production.
The constants below are the single source for the notes' lab configuration.
"""
import argparse
import hashlib
import http.client
import json
import math
import re
import socket
import socketserver
import struct
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

HOST = "127.0.0.1"
TCP_PORT = 9000
UDP_PORT = 9001
HTTP_PORT = 8080
MAX_FRAME = 64 * 1024
UDP_MAX_BYTES = 1200  # A demo limit, not the UDP protocol maximum.
IO_TIMEOUT = 5.0
EVENT_COUNT = 3
EVENT_INTERVAL = 0.15
SLOW_DELAY_SECONDS = 2.0
FILE_BYTES = b"network-notes-range-demo\n" * 1024
FILE_ETAG = '"' + hashlib.sha256(FILE_BYTES).hexdigest() + '"'
CACHE_ETAG = '"notes-v1"'
DEMO_PAGE = b'''<!doctype html><meta charset="utf-8"><title>Network lab</title>
<link rel="icon" href="data:,">
<h1>Local network lab</h1><button id="start">Receive SSE</button><pre id="log"></pre>
<script>
let source;
const log = document.querySelector('#log');
document.querySelector('#start').onclick = () => {
  if (source) source.close();
  log.textContent = '';
  source = new EventSource('/events');
  source.addEventListener('tick', e => { log.textContent += e.lastEventId + ' ' + e.data + '\\n'; });
  source.addEventListener('done', () => { log.textContent += 'done\\n'; source.close(); });
  source.onerror = () => { log.textContent += 'disconnected; EventSource may reconnect\\n'; };
};
</script>'''


def reject_json_constant(text):
    raise ValueError("non-finite JSON literal")


def finite_json_float(text):
    value = float(text)
    if not math.isfinite(value):
        raise ValueError("number outside supported finite range")
    return value


def recv_exact(conn, count):
    """TCP can return short reads; EOF before count bytes is an incomplete frame."""
    result = bytearray()
    while len(result) < count:
        chunk = conn.recv(count - len(result))
        if not chunk:
            raise EOFError("connection ended inside a frame")
        result.extend(chunk)
    return bytes(result)


def recv_frame(conn):
    size = struct.unpack("!I", recv_exact(conn, 4))[0]
    if size > MAX_FRAME:
        raise ValueError("frame exceeds MAX_FRAME")
    return recv_exact(conn, size)


def send_frame(conn, payload):
    if len(payload) > MAX_FRAME:
        raise ValueError("frame exceeds MAX_FRAME")
    conn.sendall(struct.pack("!I", len(payload)) + payload)


class TcpHandler(socketserver.BaseRequestHandler):
    def handle(self):
        self.request.settimeout(IO_TIMEOUT)
        try:
            send_frame(self.request, recv_frame(self.request))
        except (OSError, EOFError, ValueError):
            # Incomplete/oversized requests get no successful response frame.
            return


class TcpServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


class UdpHandler(socketserver.BaseRequestHandler):
    def handle(self):
        data, sock = self.request
        if len(data) <= UDP_MAX_BYTES:
            sock.sendto(data, self.client_address)


class UdpServer(socketserver.UDPServer):
    max_packet_size = UDP_MAX_BYTES + 1


class LabHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def setup(self):
        super().setup()
        self.connection.settimeout(IO_TIMEOUT)

    def _send(self, status, body=b"", headers=None):
        self.send_response(status)
        if status != 304:
            self.send_header("Content-Length", str(len(body)))
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        if body:
            self.wfile.write(body)

    def _json(self, status, value, headers=None):
        # Finish serialization before sending status/headers; reject non-JSON numbers.
        payload = json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self._send(status, payload, {"Content-Type": "application/json; charset=utf-8", **(headers or {})})

    def do_POST(self):
        # Keep this demo's framing explicit. Production servers must parse HTTP fully.
        lengths = self.headers.get_all("Content-Length", [])
        if self.headers.get("Transfer-Encoding") or len(lengths) != 1:
            self.close_connection = True
            self._json(411, {"error": "one Content-Length required; no chunked request support"})
            return
        try:
            length = int(lengths[0])
            if not 0 <= length <= MAX_FRAME:
                raise ValueError()
        except ValueError:
            self.close_connection = True
            self._json(413, {"error": "invalid or oversized body"})
            return
        raw = self.rfile.read(length)
        if len(raw) != length:
            self.close_connection = True
            self._json(400, {"error": "incomplete body"})
            return
        if urlsplit(self.path).path != "/echo":
            self._json(404, {"error": "route not found"})
            return
        if self.headers.get_content_type() != "application/json":
            self._json(415, {"error": "application/json required"})
            return
        try:
            value = json.loads(raw.decode("utf-8"), parse_constant=reject_json_constant,
                               parse_float=finite_json_float)
            # Encoding can fail for an escaped unpaired surrogate; still send a 400.
            self._json(200, {"code": 0, "data": value})
        except (ValueError, UnicodeError, RecursionError):
            self._json(400, {"error": "unsupported JSON value or encoding"})
            return

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/":
            self._send(200, DEMO_PAGE, {"Content-Type": "text/html; charset=utf-8"})
        elif path == "/health":
            self._json(200, {"code": 0, "status": "ok"})
        elif path == "/cache":
            headers = {"ETag": CACHE_ETAG, "Cache-Control": "no-cache"}
            candidates = [v.strip() for v in self.headers.get("If-None-Match", "").split(",")]
            if "*" in candidates or any(v.removeprefix("W/") == CACHE_ETAG for v in candidates):
                self._send(304, headers=headers)
            else:
                self._json(200, {"version": 1, "text": "cached note"}, headers)
        elif path == "/file":
            self._file()
        elif path == "/events":
            self._events()
        elif path == "/status/503":
            self._json(503, {"error": "demo unavailable"})
        elif path == "/business-error":
            self._json(200, {"code": 40001, "message": "demo business rejection"})
        elif path == "/slow":
            time.sleep(SLOW_DELAY_SECONDS)
            try:
                self._json(200, {"code": 0, "status": "finished"})
            except OSError:
                pass  # A timed-out client may have closed the connection.
        else:
            self._json(404, {"error": "route not found"})

    def _file(self):
        headers = {"Content-Type": "application/octet-stream", "ETag": FILE_ETAG,
                   "Accept-Ranges": "bytes"}
        requested = self.headers.get("Range")
        validator = self.headers.get("If-Range")
        if requested and (validator is None or validator == FILE_ETAG):
            # Teaching subset: one open-ended bytes=N- range only.
            match = re.fullmatch(r"bytes=([0-9]+)-", requested)
            if not match:
                self._json(400, {"error": "demo supports only one bytes=N- range"})
                return
            start = int(match.group(1))
            if start >= len(FILE_BYTES):
                self._send(416, headers={**headers, "Content-Range": f"bytes */{len(FILE_BYTES)}"})
            else:
                self._send(206, FILE_BYTES[start:], {**headers,
                    "Content-Range": f"bytes {start}-{len(FILE_BYTES) - 1}/{len(FILE_BYTES)}"})
        else:
            # If-Range mismatch: ignore Range and send the complete representation.
            self._send(200, FILE_BYTES, headers)

    def _events(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True  # Close-delimited response; no fake Content-Length.
        try:
            for event_id in range(1, EVENT_COUNT + 1):
                event = f'id: {event_id}\nevent: tick\ndata: {{"tick": {event_id}}}\n\n'
                self.wfile.write(event.encode("utf-8"))
                self.wfile.flush()
                time.sleep(EVENT_INTERVAL)
            self.wfile.write(b"event: done\ndata: complete\n\n")
            self.wfile.flush()
        except OSError:
            pass


def tcp_client(message, port=TCP_PORT, split=False):
    payload = message.encode("utf-8")
    if len(payload) > MAX_FRAME:
        raise ValueError("frame exceeds MAX_FRAME")
    with socket.create_connection((HOST, port), timeout=IO_TIMEOUT) as conn:
        if split:
            frame = struct.pack("!I", len(payload)) + payload
            # Multiple writes do not imply multiple TCP segments or matching recv calls.
            for offset in range(0, len(frame), 2):
                conn.sendall(frame[offset:offset + 2])
        else:
            send_frame(conn, payload)
        return recv_frame(conn).decode("utf-8")


def udp_client(message, port=UDP_PORT):
    payload = message.encode("utf-8")
    if len(payload) > UDP_MAX_BYTES:
        raise ValueError("datagram exceeds UDP_MAX_BYTES")
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as conn:
        conn.settimeout(IO_TIMEOUT)
        conn.connect((HOST, port))  # UDP connect chooses a peer; no TCP-like handshake.
        conn.send(payload)
        return conn.recv(UDP_MAX_BYTES).decode("utf-8")


def http_client(args):
    headers = {}
    for field in args.header:
        name, separator, value = field.partition(":")
        if not separator:
            raise ValueError("header must be Name: value")
        headers[name.strip()] = value.strip()
    body = args.data.encode("utf-8") if args.data is not None else None
    if body is not None:
        headers.setdefault("Content-Type", "application/json")
    conn = http.client.HTTPConnection(HOST, args.port or HTTP_PORT, timeout=args.timeout)
    try:
        conn.request(args.method, args.path, body=body, headers=headers)
        response = conn.getresponse()
        print(f"HTTP status: {response.status}", flush=True)
        for name, value in response.getheaders():
            print(f"{name}: {value}", flush=True)
        if args.stream:
            for line in response:
                print(line.decode("utf-8").rstrip("\r\n"), flush=True)
        else:
            data = response.read()
            print(data.decode("utf-8", errors="replace"))
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["tcp-server", "tcp-client", "udp-server", "udp-client",
                                           "http-server", "http-client", "urls"])
    parser.add_argument("--port", type=int, help="override lab port (1..65535); urls uses the HTTP port")
    parser.add_argument("--message", help="TCP/UDP clients: UTF-8 message")
    parser.add_argument("--split", action="store_true", default=None,
                        help="tcp-client: split a frame across several sends")
    parser.add_argument("--path", help="http-client: request path (default /health)")
    parser.add_argument("--method", choices=["GET", "POST"], help="http-client: method (default GET)")
    parser.add_argument("--data")
    parser.add_argument("--header", action="append")
    parser.add_argument("--timeout", type=float, help="http-client: positive finite I/O timeout")
    parser.add_argument("--stream", action="store_true", default=None)
    args = parser.parse_args()
    allowed = {
        "message": {"tcp-client", "udp-client"}, "split": {"tcp-client"},
        **{name: {"http-client"} for name in
           ("path", "method", "data", "header", "timeout", "stream")},
    }
    for option, commands in allowed.items():
        if getattr(args, option) is not None and args.command not in commands:
            parser.error(f"--{option} is not supported by {args.command}")
    if args.port is not None and not 1 <= args.port <= 65535:
        parser.error("--port must be in 1..65535")
    if args.timeout is not None and (not math.isfinite(args.timeout) or args.timeout <= 0):
        parser.error("--timeout must be positive and finite")
    args.message = "hello network" if args.message is None else args.message
    args.path = "/health" if args.path is None else args.path
    args.method = args.method or "GET"
    args.header = args.header or []
    args.timeout = IO_TIMEOUT if args.timeout is None else args.timeout
    if args.command == "urls":
        base = f"http://{HOST}:{args.port or HTTP_PORT}"
        print(f"HTTP_BASE={base}\ncurl --http1.1 -i {base}/health\ncurl -N {base}/events")
    elif args.command.endswith("-server"):
        kind = args.command.split("-")[0]
        types = {"tcp": (TcpServer, TcpHandler, TCP_PORT), "udp": (UdpServer, UdpHandler, UDP_PORT),
                 "http": (ThreadingHTTPServer, LabHandler, HTTP_PORT)}
        server_type, handler, port = types[kind]
        with server_type((HOST, args.port or port), handler) as server:
            print(f"{kind.upper()} listening on {server.server_address}; Ctrl+C to stop", flush=True)
            if kind == "http":
                print(f"Browser/SSE demo: http://{HOST}:{server.server_address[1]}/", flush=True)
            server.serve_forever()
    elif args.command == "tcp-client":
        print(tcp_client(args.message, args.port or TCP_PORT, args.split))
    elif args.command == "udp-client":
        print(udp_client(args.message, args.port or UDP_PORT))
    else:
        http_client(args)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
    except (OSError, EOFError, ValueError, OverflowError, http.client.HTTPException) as error:
        print(f"{type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
