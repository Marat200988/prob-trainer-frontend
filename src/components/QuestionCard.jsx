import { useMemo, useState } from "react";

/**
 * Универсальная нормализация вариантов:
 * - поддерживает объект вида {A:"...",B:"..."}
 * - поддерживает массив строк ["...","..."]
 * - возвращает [{key:"A", text:"..."}, ...]
 */
function useNormalizedOptions(rawOptions) {
  return useMemo(() => {
    if (!rawOptions) return [];

    if (Array.isArray(rawOptions)) {
      const letters = ["A", "B", "C", "D", "E", "F", "G"];
      return rawOptions.map((t, i) => ({
        key: letters[i] || `${i + 1}`,
        text: String(t ?? ""),
      }));
    }

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
  // Q: { id, section_id, title, question, content_md, options, type }
  const [answer, setAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {correct, correctAnswer, brier, explanation_md}

  const options = useNormalizedOptions(q?.options);
  const disabled = submitting || !result || options.length === 0;

  const content = q.content_md ?? q.contentMd ?? q.content ?? "";

  const questionText =
    (q?.question && String(q.question)) ||
    (q?.title && String(q.title)) ||
    "";

  async function handleSubmit() {
    if (disabled) return;
    if (!answer) return; // ничего не выбрано
    setSubmitting(true);
    try {
      const res = await onSubmit?.({
        qid: q.id,
        type: q.type || "mcq",
        userAnswer: answer,
      });
      setResult(res || null);
    } catch (e) {
      console.error("submit error", e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 bg-slate-800 rounded-xl mb-4 shadow-md">
      <div className="mb-3 font-semibold text-base md:text-lg">
        {questionText}
      </div>
      <div className="text-sm md:text-base whitespace-pre-wrap mb-3">
        {content || (
          <span className="text-white/50">Текст вопроса не получен</span>
        )}
      </div>

      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.key}
            className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
              answer === opt.key
                ? "bg-slate-600 text-white"
                : "bg-slate-700 text-gray-200"
            }`}
          >
            <input
              type="radio"
              name={`q-${q.id}`}
              value={opt.key}
              checked={answer === opt.key}
              onChange={() => setAnswer(opt.key)}
              className="hidden"
            />
            <span className="font-bold">{opt.key}.</span>
            <span>{opt.text}</span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center space-x-4">
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={`px-4 py-2 rounded ${
            disabled
              ? "bg-slate-600 text-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Ответить
        </button>
      </div>

      {result && (
        <div className="mt-3 p-3 rounded bg-slate-700">
          {result.correct ? (
            <div className="text-green-400 font-bold">Верно</div>
          ) : (
            <div className="text-red-400 font-bold">Неверно</div>
          )}
          {result.explanation_md && (
            <div className="mt-2 whitespace-pre-wrap text-sm">
              {result.explanation_md}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
