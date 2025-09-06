import { useMemo, useState } from "react";

/**
 * Универсальная нормализация вариантов:
 * - принимает объект {"A":"...","B":"..."} или массив ["...","..."]
 * - возвращает [{key:"A", text:"..."}, ...]
 */
function useNormalizedOptions(rawOptions) {
  return useMemo(() => {
    if (!rawOptions) return [];
    // Массив строк
    if (Array.isArray(rawOptions)) {
      const letters = ["A", "B", "C", "D", "E", "F", "G"];
      return rawOptions.map((t, i) => ({
        key: letters[i] || `${i + 1}`,
        text: String(t ?? ""),
      }));
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

/**
 * Карточка вопроса
 * props:
 *  - q: { id, section_id, title, question, content_md, options, type }
 *  - onSubmit: async ({ qid, type, userAnswer, confidence }) => {correct, correctAnswer, explanation_md, brier}
 */
export default function QuestionCard({ q, onSubmit }) {
  const [answer, setAnswer] = useState(null);
  const [confidence, setConfidence] = useState(0.7); // 70%
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {correct, correctAnswer, brier, explanation_md}

  const options = useNormalizedOptions(q?.options);
  const disabled = submitting || !q || options.length === 0;

  // Текст вопроса: берём question → content_md → title (на всякий случай)
  const questionText =
    (q?.question && String(q.question)) ||
    (q?.content_md && String(q.content_md)) ||
    (q?.content && String(q.content)) ||
    (q?.title && String(q.title)) ||
    "";

  async function handleSubmit() {
    if (disabled) return;
    if (!answer) return; // ничего не выбрано
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        qid: q.id,
        type: q.type || "mcq",
        userAnswer: answer,           // ⚠️ ОБЯЗАТЕЛЬНО
        confidence: Math.round(confidence * 100), // в процентах, если бек ждёт %
      };
      const res = await onSubmit?.(payload);
      setResult(res || null);
    } catch (e) {
      console.error("question.submit:error", e);
      setResult({ error: e?.message || "Ошибка отправки" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-3">
      {/* Заголовок (секция) */}
      {q?.section_title && (
        <div className="text-xs uppercase tracking-wide text-white/60">
          {q.section_title}
        </div>
      )}

      {/* Тайтл вопроса */}
      {q?.title && (
        <h3 className="text-lg font-semibold text-white/90">
          {q.title}
        </h3>
      )}

      {/* Текст вопроса */}
      {questionText && (
        <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
          {questionText}
        </p>
      )}

      {/* Варианты */}
      <div className="mt-2 space-y-2">
        {options.map((opt) => (
          <label
            key={opt.key}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer border ${
              answer === opt.key
                ? "border-emerald-400/60 bg-emerald-400/10"
                : "border-white/10 hover:bg-white/5"
            }`}
          >
            <input
              type="radio"
              name={`q-${q.id}`}
              className="h-4 w-4 accent-emerald-500"
              checked={answer === opt.key}
              onChange={() => setAnswer(opt.key)}
              disabled={submitting}
            />
            <span className="text-sm text-white/90">
              <span className="font-semibold mr-1">{opt.key})</span>
              {opt.text}
            </span>
          </label>
        ))}
      </div>

      {/* Уверенность */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-sm text-white/70">Уверенность:</span>
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.01}
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-full"
            disabled={submitting}
          />
          <span className="text-xs rounded-md bg-white/10 px-2 py-1 text-white/80">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Кнопка */}
      <div className="pt-1">
        <button
          onClick={handleSubmit}
          disabled={disabled || !answer}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            disabled || !answer
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-emerald-500/90 hover:bg-emerald-500 text-white"
          }`}
        >
          {submitting ? "Отправка..." : "Ответить"}
        </button>
      </div>

      {/* Результат */}
      {result && (
        <div className="pt-2 space-y-2">
          {result.error && (
            <div className="text-sm text-rose-300/90">
              Ошибка: {String(result.error)}
            </div>
          )}

          {typeof result.correct === "boolean" && (
            <div
              className={`inline-block rounded-lg px-2.5 py-1 text-sm ${
                result.correct
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-rose-400/15 text-rose-300"
              }`}
            >
              {result.correct ? "Верно" : "Неверно"}
              {typeof result.brier === "number" && (
                <span className="ml-2 opacity-80">
                  • Brier: {result.brier.toFixed(3)}
                </span>
              )}
            </div>
          )}

          {result.correctAnswer && (
            <div className="text-sm text-white/80">
              Правильный ответ:{" "}
              <span className="font-semibold">{String(result.correctAnswer)}</span>
            </div>
          )}

          {result.explanation_md && (
            <div className="text-sm text-white/80 whitespace-pre-wrap">
              {result.explanation_md}
            </div>
          )}
        </div>
      )}
    </div>
  );
          }
