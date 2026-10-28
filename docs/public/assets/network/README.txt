NETWORK COMMUNICATION LAB
=========================

Prerequisites: Python 3.11 or newer. Standard library only.
Save network_lab.py in a local experiment folder. Run commands from that folder.
These teaching servers bind to loopback only. They are not production servers.
The public GitHub Pages site only distributes this file; it does not run Python.

1. HTTP baseline (two terminals)

   Terminal A: python network_lab.py http-server
   Terminal B: python network_lab.py http-client

   Expected: HTTP status 200, JSON code 0 and status ok.
   Open the printed Browser/SSE demo URL in the same computer's browser.
   Click Receive SSE: tick events arrive, then done closes EventSource.
   Stop the server with Ctrl+C when finished.

2. HTTP examples (leave the HTTP server running)

   python network_lab.py http-client --path /echo --method POST --data 42
   python network_lab.py http-client --path /cache
   python network_lab.py http-client --path /cache --header 'If-None-Match: "notes-v1"'
   python network_lab.py http-client --path /file --header 'Range: bytes=100-'
   python network_lab.py http-client --path /status/503
   python network_lab.py http-client --path /business-error
   python network_lab.py http-client --path /slow --timeout 0.1
   python network_lab.py http-client --path /events --stream

   Expected: echo=200; first cache=200; matching ETag=304; range=206;
   status route=503; business-error=HTTP200/code40001; slow=read timeout;
   events=tick events then done, response closes.

   IMPORTANT: quoted ETags/JSON may be altered by Windows PowerShell's native
   argument passing. For cache verification, use this portable Python command:

   python -c "import http.client; from network_lab import HOST,HTTP_PORT,CACHE_ETAG,IO_TIMEOUT; c=http.client.HTTPConnection(HOST,HTTP_PORT,timeout=IO_TIMEOUT); c.request('GET','/cache',headers={'If-None-Match':CACHE_ETAG}); r=c.getresponse(); print(r.status,r.read()); c.close()"

   The JSON number 42 avoids shell quoting differences. For JSON objects, use
   json.dumps(value).encode('utf-8') in Python and set application/json, as shown
   in the HTTP note. Do not substitute a broken shell command for protocol logic.

   /echo rejects NaN/Infinity and numbers outside its finite float range with 400.
   Values that cannot be encoded as UTF-8 (including escaped unpaired surrogates),
   malformed JSON and nesting beyond the parser's limit also receive a JSON 400.
   These are this implementation's limits, not a claim that every JSON number
   outside the range or every escaped surrogate is a JSON syntax error.

3. TCP framing (separate pair of terminals)

   Terminal A: python network_lab.py tcp-server
   Terminal B: python network_lab.py tcp-client --message hello --split

   Expected: hello. The request has a 4-byte big-endian length prefix plus UTF-8
   data. --split uses several writes; this does not guarantee TCP packet borders.
   recv_exact loops until header/body is complete or EOF/timeout occurs.
   MAX_FRAME limits allocation and total accepted frame size.

4. UDP datagrams (separate pair of terminals)

   Terminal A: python network_lab.py udp-server
   Terminal B: python network_lab.py udp-client --message hello

   Expected: hello. This is one datagram, not a reliable delivery guarantee.
   UDP connect selects the peer; it does not perform a TCP handshake.
   UDP_MAX_BYTES is a teaching limit, not the protocol's maximum payload.

5. Addresses and constants

   python network_lab.py urls
   python network_lab.py --help

   HOST/TCP_PORT/UDP_PORT/HTTP_PORT/MAX_FRAME/IO_TIMEOUT/EVENT_COUNT and delay
   constants are defined once in network_lab.py. Use --port to select another
   port on both server and client. A server prints its actual bound address.
   --port accepts 1..65535; urls --port prints an overridden HTTP address.
   --message is for TCP/UDP clients; --split is only for tcp-client.
   --path/--method/--data/--header/--timeout/--stream are only for http-client.
   --timeout must be positive and finite; other modes use IO_TIMEOUT.
   The platform socket API may impose a smaller supported timeout range;
   unsupported values produce a controlled error rather than a traceback.
   Options supplied to the wrong mode are rejected, not silently ignored.
   A phone's localhost is the phone itself, not the computer hosting this lab.

6. Boundaries

   HTTP is HTTP/1.1 with explicit response length, except SSE uses connection
   close to delimit the response. No TLS, HTTP/2, HTTP/3, WebSocket or MQTT server
   is provided. SSE sends a finite sequence; it does not retain/replay history.
   The SSE page closes on event: done rather than reconnecting forever.
   /file implements only one open-ended bytes=N- range, strong ETag If-Range,
   Content-Range, 200/206/416. Other range forms return a demo error.
   /echo requires one Content-Length and application/json; no chunked uploads.
   Do not expose this lab on a public interface or use it for production traffic.
