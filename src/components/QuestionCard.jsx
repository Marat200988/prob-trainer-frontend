import { useMemo, useState } from "react";

/** Нормализация вариантов в универсальный массив [{key, text}] */
// --- замените целиком эту функцию ---
function useNormalizedOptions(rawOptions) {
  return useMemo(() => {
    if (!rawOptions) return [];

    // Массив
    if (Array.isArray(rawOptions)) {
      const letters = ["A", "B", "C", "D", "E", "F", "G"];
      return rawOptions.map((item, i) => {
        if (item && typeof item === "object") {
          // Поддержка форматов {key,text}, {label,value}, {id,name}, {letter,option}
          const key =
            item.key ??
            item.letter ??
            item.value ??
            item.id ??
            letters[i] ??
            String(i + 1);
          const text =
            item.text ??
            item.label ??
            item.value ??
            item.option ??
            item.name ??
            "";
          return { key: String(key), text: String(text) };
        }
        // Примитивная строка/число
        return { key: letters[i] || String(i + 1), text: String(item ?? "") };
      });
    }

    // Объект {A:"...", B:"..."}
    if (typeof rawOptions === "object") {
      return Object.entries(rawOptions).map(([k, v]) => ({
        key: String(k),
        text: String(v ?? ""),
      }));
    }

    return [];
  }, [rawOptions]);
}

export default function QuestionCard({ q, onSubmit }) {
  const [answer, setAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const options = useNormalizedOptions(q?.options);
  const disabled = submitting || !options.length;

  // Показываем максимум инфы: question -> title -> первая строка из content_md
  const contentMd = q?.content_md || q?.contentMd || q?.content || "";
  const fallbackFromMd = stripMd(contentMd).split("\n").filter(Boolean)[0] || "";
  const questionText =
    (q?.question && String(q.question)) ||
    (q?.title && String(q.title)) ||
    fallbackFromMd;

  async function handleSubmit() {
    if (disabled) return;
    if (!answer) return;
    setSubmitting(true);
    try {
      const res = await onSubmit?.({
        qid: q.id,
        type: q.type || "mcq",
        userAnswer: answer,
      });
      setResult(res || null);
    } catch {
      setResult({
        correct: false,
        brier: 0.49,
        error: "Ошибка проверки",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl bg-slate-800/50 border border-white/10 p-4 space-y-3">
      <div className="text-white/90 font-semibold text-base">
        {questionText || "Задача"}
      </div>

      {contentMd && (
        <div className="text-white/70 text-sm whitespace-pre-wrap">
          {contentMd}
        </div>
      )}

      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o.key}
            className="flex items-center gap-3 text-white/90 text-sm"
          >
            <input
              type="radio"
              name={q.id}
              value={o.key}
              checked={answer === o.key}
              onChange={() => setAnswer(o.key)}
              className="accent-emerald-400"
            />
            <span>
              {o.key}) {o.text}
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={disabled || !answer}
          className="px-4 py-2 rounded-lg bg-emerald-500 disabled:bg-slate-600 text-black font-medium"
        >
          {submitting ? "Проверяю…" : "Ответить"}
        </button>

        {result && (
          <div
            className={`text-sm px-2 py-1 rounded ${
              result.correct ? "bg-emerald-600/30 text-emerald-300" : "bg-rose-700/30 text-rose-300"
            }`}
          >
            {result.correct ? "Верно" : "Неверно"} • Brier:{" "}
            {(result.brier ?? 0).toFixed(3)}
          </div>
        )}
      </div>
    </div>
  );
        }
{result?.explanation_md && (
  <div className="text-white/70 text-sm whitespace-pre-wrap mt-2">
    {result.explanation_md}
  </div>
)}
