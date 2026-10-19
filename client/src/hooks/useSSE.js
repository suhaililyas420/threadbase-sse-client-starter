// hooks/useSSE.js
// ─────────────────────────────────────────────────────────────
// TASK 1: implement this hook so the React app can receive
//         server-sent events from /api/notifications/stream.
//
// The hook receives two arguments:
//   url       - the SSE endpoint, e.g. "/api/notifications/stream"
//   onMessage - a callback: onMessage(parsedData) — called for each frame
//
// What the implementation must do (in order):
//
//   1. Read `user` from AuthContext using useAuth().
//
//   2. Inside useEffect:
//        a. NULL GUARD — if there is no user, return early (stops the
//           401 reconnect flood when the user is logged out).
//        b. Create:  const source = new EventSource(url, { withCredentials: true });
//        c. Set source.onmessage to call onMessage(JSON.parse(event.data))
//           inside a try/catch — log any parse errors.
//        d. Set source.onerror to log the error.
//        e. CLEANUP — return () => source.close();
//
//   3. Dependency array: [url, user, onMessage]
//
// Do NOT change the function signature or the export.
// ─────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSSE(url, onMessage) {
  const { user } = useAuth();

  useEffect(() => {
    // NULL GUARD — if there is no user, return early (stops the
    // 401 reconnect flood when the user is logged out).
    if (!user) return;

    const source = new EventSource(url, { withCredentials: true });

    source.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (e) {
        console.error("[useSSE] parse error:", event.data, e);
      }
    };

    source.onerror = (err) => console.error("[useSSE] error:", err);

    // CLEANUP — close the connection when the component unmounts
    // or when a dependency changes. Without this, ghost connections
    // accumulate and events fire multiple times.
    return () => source.close();

  }, [url, user, onMessage]);
}
