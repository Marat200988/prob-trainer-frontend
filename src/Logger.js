// Мини-логгер с подписчиками и буфером
const buffer = [];
const listeners = new Set();

export const logger = {
  level: "info", // 'debug' | 'info' | 'warn' | 'error'
  push(evt) {
    const event = { ts: new Date().toISOString(), ...evt };
    buffer.push(event);
    for (const fn of listeners) try { fn(event, buffer.slice()); } catch {}
  },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  getAll() { return buffer.slice(); },
  clear() { buffer.length = 0; },
  debug(msg, extra) { this.push({ level: "debug", msg, extra }); },
  info(msg, extra)  { this.push({ level: "info",  msg, extra }); },
  warn(msg, extra)  { this.push({ level: "warn",  msg, extra }); },
  error(msg, extra) { this.push({ level: "error", msg, extra }); },
};

// Перехват глобальных ошибок
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    logger.error("window.onerror", { message: e.message, source: e.filename, lineno: e.lineno, colno: e.colno, error: String(e.error || "") });
  });
  window.addEventListener("unhandledrejection", (e) => {
    logger.error("unhandledrejection", { reason: String(e.reason || "") });
  });

  // Проксируем console.* (необязательно, но удобно)
  ["log","info","warn","error"].forEach((m) => {
    const orig = console[m];
    console[m] = (...args) => {
      try {
        logger.push({ level: m === "log" ? "info" : m, msg: "console."+m, extra: args.map(String) });
      } catch {}
      orig(...args);
    };
  });
}
