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
      return rawOptions.map((t, i) => ({ key: letters[i] || `${i + 1}`, text: String(t ?? "") }));
    }
    if (typeof rawOptions === "object") {
      return Object.entries(rawOptions).map(([k, v]) => ({ key: String(k), text: String(v ?? "") }));
    }
    return [];
  }, [rawOptions]);
}

export default function QuestionCard({ q, onSubmit }) {
  // q: { id, section_id, title, question, content_md, options, type }
  const [answer, setAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {correct, correctAnswer, brier, explanation_md}

  const options = useNormalizedOptions(q?.options);
  const disabled = submitting || !!result || options.length === 0;

  const questionText =
    (q?.question && String(q.question)) ||
    (q?.title && String(q.title)) ||
    ""; // на всякий случай не роняемся

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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      {/* ТЕКСТ ВОПРОСА */}
      <div className="text-base font-medium text-white/90">
        {questionText || "Вопрос"}
      </div>

      {/* Доп. описание, если прислали content_md (покажем как обычный текст) */}
      {q?.content_md ? (
        <div className="text-sm text-white/70 whitespace-pre-wrap">
          {q.content_md}
        </div>
      ) : null}

      {/* ВАРИАНТЫ */}
      <div className="space-y-2">
        {options.length === 0 ? (
          <div className="text-sm text-red-300">
            ⚠️ Варианты ответа не пришли.
          </div>
        ) : (
          options.map(({ key, text }) => (
            <label
              key={key}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 border cursor-pointer ${
                answer === key ? "border-blue-400/70" : "border-white/10"
              }`}
            >
              <input
                type="radio"
                name={`opt-${q.id}`}
                className="accent-blue-400"
                disabled={disabled}
                checked={answer === key}
                onChange={() => setAnswer(key)}
              />
              <span className="text-sm text-white/90">
                <span className="font-semibold mr-1">{key}.</span> {text || "—"}
              </span>
            </label>
          ))
        )}
      </div>

      {/* СЛАЙДЕР УВЕРЕННОСТИ — если он у вас в этом компоненте, оставьте; иначе можно убрать */}
      {typeof q?.confidence !== "undefined" ? (
        <div className="text-xs text-white/60">Уверенность: {Math.round(q.confidence * 100)}%</div>
      ) : null}

      {/* КНОПКА */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={disabled || !answer}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            disabled || !answer
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-white text-black hover:bg-white/90"
          }`}
        >
          Ответить
        </button>

        {/* РЕЗУЛЬТАТ */}
        {result ? (
          <div className="text-sm">
            {result.correct ? (
              <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300">Верно</span>
            ) : (
              <span className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300">
                Неверно{result.correctAnswer ? ` (правильный: ${result.correctAnswer})` : ""}
              </span>
            )}
            {"  "}
            {typeof result.brier === "number" ? (
              <span className="ml-2 text-white/60">Brier: {result.brier.toFixed(3)}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ПОЯСНЕНИЕ */}
      {result?.explanation_md ? (
        <div className="mt-2 text-sm text-white/80 whitespace-pre-wrap">
          {result.explanation_md}
        </div>
      ) : null}
    </div>
  );
}
