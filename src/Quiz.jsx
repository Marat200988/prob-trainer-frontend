import { useEffect, useState } from "react";
import QuestionCard from "./components/QuestionCard";
import { logInfo, logError, logDebug } from "./logger";

export default function Quiz({ sections = [] }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Ожидаем, что вопросы приходит внешний код/или запросом.
    // Если у вас уже есть генерация в этом файле — оставьте её.
  }, []);

  async function handleCheckAnswer({ qid, type, userAnswer }) {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/check-answer`;
      logInfo("fetch.check-answer:start", { url, qid, type });
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qid, type, userAnswer }),
      });
      logInfo("fetch.check-answer:status", { status: resp.status });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        logError("fetch.check-answer:fail", { error: data?.error || `HTTP ${resp.status}` });
        throw new Error(data?.error || `HTTP ${resp.status}`);
      }
      logDebug("fetch.check-answer:ok", data);
      return data; // {correct, correctAnswer, explanation_md, brier}
    } catch (e) {
      logError("check-answer:error", { error: String(e) });
      return { correct: false, explanation_md: "Ошибка проверки ответа.", brier: null };
    }
  }

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-4 text-white/70">
          Пока нет вопросов. Проверь генерацию или загрузку вопросов.
        </div>
      ) : (
        questions.map((q) => (
          <QuestionCard key={q.id} q={q} onSubmit={handleCheckAnswer} />
        ))
      )}
    </div>
  );
}
