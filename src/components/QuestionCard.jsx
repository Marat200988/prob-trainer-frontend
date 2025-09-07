import { useMemo, useState } from "react";

/**
 * Универсальная нормализация вариантов:
 * - принимает объект вида {"A":"...","B":"..."}
 * - или массив строк ["...","..."]
 * - возвращает [{key:"A", text:"..."}, ...]
 */
function useNormalizedOptions(rawOptions) {
  return useMemo(() => {
    if (!rawOptions) return [];
    if (Array.isArray(rawOptions)) {
      const letters = ["A","B","C","D","E","F","G"];
      return rawOptions.map((t, i) => ({ key: letters[i] || String(i + 1), text: String(t ?? "") }));
    }
    if (typeof rawOptions === "object") {
      return Object.entries(rawOptions).map(([k, v]) => ({ key: String(k), text: String(v ?? "") }));
    }
    return [];
  }, [rawOptions]);
}

export default function QuestionCard({ q, genId, onSubmit }) {
  // q: { id, title, question, content, content_md, options, type }
  const [answer, setAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {correct, correctAnswer, brier, explanation_md}

  const options = useNormalizedOptions(q?.options);
  const disabled = submitting || !options.length;

  const content = q?.content_md ?? q?.content ?? "";
  const questionText =
    (q?.question && String(q.question)) ||
    (q?.title && String(q.title)) ||
    ""; // На всякий случай

  async function handleSubmit() {
    if (disabled) return;
    if (!answer) return; // ничего не выбрано
    setSubmitting(true);
    try {
      const res = await onSubmit({
        genId,
        qid: q.id,
        type: q.type || "mcq",
        userAnswer: answer, // ключ "A" | "B" | ...
      });
      setResult(res || null);
    } catch (e) {
      setResult({ error: e?.message || String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-slate-800/40 p-4 mb-6">
      {questionText && (
        <h3 className="text-lg font-semibold mb-2">{questionText}</h3>
      )}
      {content && (
        <p className="text-slate-300 whitespace-pre-wrap mb-3">{content}</p>
      )}

      <div className="space-y-2">
        {options.map(opt => (
          <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`q-${q.id}`}
              value={opt.key}
              checked={answer === opt.key}
              onChange={(e) => setAnswer(e.target.value)} // <-- ВСЕГДА ключ!
              className="accent-emerald-500"
            />
            <span>{opt.key}) {opt.text}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled || !answer}
        className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 disabled:bg-emerald-800"
      >
        Ответить
      </button>

      {result?.error && (
        <div className="mt-3 text-rose-400">Error: {result.error}</div>
      )}
      {result && !result?.error && (
        <div className="mt-3">
          <div className={result.correct ? "text-emerald-400" : "text-rose-400"}>
            {result.correct ? "Верно" : "Неверно"}
            {typeof result.brier === "number" && (
              <span className="ml-2 opacity-80">• Brier: {result.brier.toFixed(3)}</span>
            )}
          </div>
          {result.correctAnswer && (
            <div className="mt-1 text-slate-300">
              Правильный ответ: <b>{result.correctAnswer}</b>
            </div>
          )}
          {result.explanation_md && (
            <div className="mt-2 text-slate-300 whitespace-pre-wrap">
              {result.explanation_md}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
