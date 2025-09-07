import { useEffect, useState } from "react";
import QuestionCard from "./components/QuestionCard";
import { logInfo, logError, logDebug } from "./logger";

const API = import.meta.env.VITE_BACKEND_URL || "https://prob-trainer-backend.onrender.com";

export default function Quiz({ sections = [] }) {
  const [genId, setGenId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const body = { sections, count: 6, lang: "ru" };
        const res = await fetch(`${API}/gen-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        logInfo("fetch.gen-questions:status", { status: res.status });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        // ожидаем { genId, questions: [...] }
        setGenId(data.genId || null);
        setQuestions(Array.isArray(data.questions) ? data.questions : []);
        logDebug("questions", data);
      } catch (e) {
        logError("fetch.gen-questions:fail", { error: String(e) });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  async function submitAnswer(payload) {
    const res = await fetch(`${API}/check-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // {genId, qid, type, userAnswer}
    });
    logInfo("fetch.check-answer:status", { status: res.status });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json(); // {correct, correctAnswer, explanation_md, brier}
  }

  if (loading) return <div className="p-4">Загрузка…</div>;
  if (!questions.length) return (
    <div className="p-4 text-slate-300">
      Пока нет вопросов. Проверь переменные окружения и бэкенд.
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {questions.map((q) => (
        <QuestionCard key={q.id} q={q} genId={genId} onSubmit={submitAnswer} />
      ))}
    </div>
  );
}
