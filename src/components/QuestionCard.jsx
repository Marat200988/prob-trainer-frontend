import { useMemo, useState } from "react";

/** Надёжная нормализация вариантов (любые форматы → [{key,text}]) */
function useNormalizedOptions(rawOptions) {
  return useMemo(() => {
    if (!rawOptions) return [];

    const toText = (v) => {
      if (typeof v === "string" || typeof v === "number") return String(v);
      if (v && typeof v === "object") {
        const cand =
          v.text ?? v.label ?? v.value ?? v.content ?? v.title ?? v.name;
        return typeof cand === "string" || typeof cand === "number"
          ? String(cand)
          : JSON.stringify(v);
      }
      return String(v ?? "");
    };

    const letters = ["A","B","C","D","E","F","G","H","I"];

    if (Array.isArray(rawOptions)) {
      return rawOptions.map((opt, i) => {
        if (opt && typeof opt === "object") {
          const key = opt.key ?? opt.id ?? letters[i] ?? String(i + 1);
          return { key: String(key), text: toText(opt.text ?? opt) };
        }
        return { key: letters[i] ?? String(i + 1), text: toText(opt) };
      });
    }

    if (typeof rawOptions === "object") {
      return Object.entries(rawOptions).map(([k, v]) => ({
        key: String(k),
        text: toText(v),
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
  const content = q?.contentMd ?? q?.content_md ?? q?.content ?? "";
  const questionText =
    (q?.question && String(q.question)) ||
    (q?.title && String(q.title)) ||
    "";

  async function handleSubmit() {
    if (!answer || !onSubmit) return;
    setSubmitting(true);
    try {
      const res = await onSubmit({
        qid: q.id,
        type: q.type ?? "mcq",
        userAnswer: answer,
        // если у вас есть слайдер уверенности — передавайте его числом [0..1]
        confidence: typeof q.confidence === "number" ? q.confidence : undefined,
      });
      setResult(res || null);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-slate-800/40 p-4 shadow">
      {!!q?.title && <h3 className="text-lg font-semibold mb-1">{q.title}</h3>}
      {!!questionText && (
        <p className="mb-2 whitespace-pre-wrap leading-relaxed">{questionText}</p>
      )}
      {!!content && (
        <p className="mb-4 whitespace-pre-wrap leading-relaxed opacity-90">{content}</p>
      )}

      <div className="space-y-2 mb-3">
        {options.map((o) => (
          <label key={o.key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`q-${q.id}`}
              value={o.key}
              checked={answer === o.key}
              onChange={() => setAnswer(o.key)}
            />
            <span className="select-none">{o.key}) {o.text}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!answer || submitting}
        className="px-4 py-2 rounded-xl bg-emerald-600 disabled:opacity-50"
      >
        Ответить
      </button>

      {result?.correct === true && (
        <div className="mt-3 inline-block rounded-xl bg-emerald-700/40 px-3 py-1">
          Верно{typeof result.brier === "number" ? ` • Brier: ${result.brier.toFixed(3)}` : ""}
        </div>
      )}
      {result?.correct === false && (
        <div className="mt-3 inline-block rounded-xl bg-rose-700/40 px-3 py-1">
          Неверно{typeof result.brier === "number" ? ` • Brier: ${result.brier.toFixed(3)}` : ""}
        </div>
      )}

      {result?.explanation_md && (
        <div className="mt-3 whitespace-pre-wrap opacity-90">{result.explanation_md}</div>
      )}
      {result?.error && (
        <div className="mt-3 text-rose-400 whitespace-pre-wrap">{result.error}</div>
      )}
    </div>
  );
      }
