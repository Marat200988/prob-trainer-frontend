// Мини-логгер с буфером и подписчиками
const buffer = [];
const listeners = new Set();

export const logger = {
  push(evt) {
    const event = { ts: new Date().toISOString(), level: evt.level || "info", msg: evt.msg || "", extra: evt.extra };
    buffer.push(event);
    for (const fn of listeners) {
      try { fn(event, buffer.slice()); } catch {}
    }
  },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  getAll() { return buffer.slice(); },
  clear() { buffer.length = 0; },
  debug(msg, extra) { this.push({ level: "debug", msg, extra }); },
  info(msg, extra)  { this.push({ level: "info",  msg, extra }); },
  warn(msg, extra)  { this.push({ level: "warn",  msg, extra }); },
  error(msg, extra) { this.push({ level: "error", msg, extra }); },
};
// src/logger.js

export function logInfo(message, data) {
  console.log("INFO", message, data || "");
}

export function logError(message, data) {
  console.error("ERROR", message, data || "");
}

export function logDebug(message, data) {
  console.debug("DEBUG", message, data || "");
}
// Перехват глобальных ошибок и непросанных промисов
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    logger.error("window.onerror", { message: e.message, source: e.filename, lineno: e.lineno, colno: e.colno, error: String(e.error || "") });
  });
  window.addEventListener("unhandledrejection", (e) => {
    logger.error("unhandledrejection", { reason: String(e.reason || "") });
  });

  // Проксируем console.* (удобно видеть в панели)
  ["log","info","warn","error"].forEach((m) => {
    const orig = console[m];
    console[m] = (...args) => {
      try { logger.push({ level: m === "log" ? "info" : m, msg: "console."+m, extra: args.map(a => {
        try { return typeof a === "string" ? a : JSON.stringify(a); } catch { return String(a); }
      }) }); } catch {}
      orig(...args);
    };
  });
}
