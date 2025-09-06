import React, { useEffect, useState } from "react";
import { logger } from "./logger";

const levelColor = {
  debug: "text-gray-400",
  info:  "text-blue-600 dark:text-blue-300",
  warn:  "text-yellow-700 dark:text-yellow-300",
  error: "text-red-600 dark:text-red-300",
};

export default function LogPanel({ floating = true }) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState(logger.getAll());

  useEffect(() => {
    return logger.on((_evt, all) => setLogs(all));
  }, []);

  return (
    <>
      {floating && (
        <button
          onClick={() => setOpen(o => !o)}
          className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-xl shadow bg-black text-white dark:bg-white dark:text-black"
          title="Открыть логи"
        >
          {open ? "✕ Логи" : "🪵 Логи"}
        </button>
      )}

      {open && (
        <div className="fixed inset-x-2 bottom-16 md:inset-x-auto md:right-4 md:bottom-4 md:w-[min(40rem,95vw)] z-50
                        rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="font-semibold">Логи (последние {logs.length})</div>
            <div className="flex items-center gap-2">
              <button className="text-sm underline" onClick={() => setLogs([]) || logger.clear()}>Очистить</button>
              <button className="text-sm underline" onClick={() => setOpen(false)}>Закрыть</button>
            </div>
          </div>
          <div className="max-h-[50vh] overflow-auto text-sm p-2 space-y-1">
            {logs.length === 0 && <div className="text-gray-500 p-2">Пока пусто…</div>}
            {logs.map((l, i) => (
              <div key={i} className="rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <span className={levelColor[l.level] || ""}>{l.level.toUpperCase()}</span>
                  <span className="text-xs text-gray-500">{l.ts}</span>
                </div>
                <div className="font-medium">{l.msg}</div>
                {l.extra && (
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {JSON.stringify(l.extra, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
