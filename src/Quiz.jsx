// src/Quiz.jsx
import { useEffect, useState } from "react";
import QuestionCard from "./components/QuestionCard";
import { logInfo, logError, logDebug } from "./logger";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://prob-trainer-backend.onrender.com";

export default function Quiz({ sections = [] }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // грузим вопросы при маунте
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const body = {
          sections:
            sections.length > 0
              ? sections
              : [
                  { id: "bayes", title: "Байес и базовые частоты" },
                  { id: "ev", title: "Ожидаемое значение и полезность" },
                  { id: "tails", title: "Хвостовые риски" },
                ],
          count: 6,
        };

        logInfo("fetch.gen-questions:start", { url: `${API_URL}/gen-questions` });
        const res = await fetch(`${API_URL}/gen-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        logInfo("fetch.gen-questions:status", { status: res.status });
        if (!res.ok) {
          throw new Error(`API ${res.status}`);
        }

        const data = await res.json();
        logDebug("fetch.gen-questions:ok", { n: data?.questions?.length || 0 });

        // НЕ обрезаем поля — пробрасываем как есть
        if (!cancelled) setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      } catch (e) {
        logError("fetch.gen-questions:fail", { error: String(e) });
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sections]);

  async function handleSubmit({ qid, type = "mcq", userAnswer }) {
    try {
      const payload = { questionId: qid, type, userAnswer };
      logInfo("fetch.check-answer:start", {
        url: `${API_URL}/check-answer`,
        qid,
        type,
      });

      const res = await fetch(`${API_URL}/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      logInfo("fetch.check-answer:status", { status: res.status });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      logDebug("fetch.check-answer:ok", data);
      return data; // {correct, correctAnswer, brier, explanation_md}
    } catch (e) {
      logError("fetch.check-answer:fail", { error: String(e) });
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <div className="px-4 py-3 rounded-xl bg-slate-800/60">
        <div className="font-semibold">Тренировка (DeepSeek)</div>
        {loading && (
          <div className="text-sm text-white/60 mt-2">Загружаю вопросы…</div>
        )}
      </div>

      {questions.length === 0 && !loading && (
        <div className="px-4 py-3 rounded-xl bg-slate-800/60 text-white/70">
          Пока нет вопросов. Проверь переменные окружения и бэкенд.
        </div>
      )}

      {questions.map((q) => (
        // Передаём ВЕСЬ q
        <QuestionCard key={q.id} q={q} onSubmit={handleSubmit} />
      ))}
    </div>
  );
}
