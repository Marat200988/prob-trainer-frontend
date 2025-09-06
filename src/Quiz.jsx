import React, { useEffect, useState } from 'react'
import { brierScore, todayKey } from './lib'
import { supabase } from './supabaseClient' // можно не использовать сразу

function Badge({ kind = 'default', children }) {
  const styles = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-50',
    good: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    bad: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  }
  return <span className={'px-2 py-0.5 rounded-full text-xs ' + styles[kind]}>{children}</span>
}

function QuestionCard({ q, onSubmit }) {
  const [choice, setChoice] = useState(null)
  const [num, setNum] = useState('')
  const [text, setText] = useState('')
  const [conf, setConf] = useState(70)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit() {
    if (done) return

    const userAnswer =
      q.type === 'mcq' ? choice : q.type === 'numeric' ? Number(num) : text

    // Проверка ответа через бэкенд (DeepSeek)
    const res = await fetch(import.meta.env.VITE_API_BASE + '/check-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, userAnswer }),
    })
    const data = await res.json() // { correct, explanation }

    const p = Math.min(Math.max(conf / 100, 0.5), 1)
    const bs = brierScore(p, data.correct ? 1 : 0)

    const payload = { ...data, conf: conf / 100, brier: bs }
    setResult(payload)
    setDone(true)
    onSubmit?.(payload)

    // === (опционально) запись прогресса в Supabase ===
    // try {
    //   const { data: u } = await supabase.auth.getUser()
    //   if (u?.user) {
    //     await supabase.from('progress').insert({
    //       user_id: u.user.id,
    //       date: todayKey(),
    //       question_id: q.id,
    //       section_id: q.section_id || 'unknown',
    //       correct: payload.correct,
    //       brier: payload.brier ?? 0,
    //     })
    //   }
    // } catch {}
  }

  return (
    <div className="space-y-3">
      <div className="text-base md:text-lg">{q.prompt}</div>

      {q.type === 'mcq' && (
        <div className="grid grid-cols-1 gap-2">
          {(q.options || []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={q.id}
                className="size-4"
                disabled={done}
                checked={choice === i}
                onChange={() => setChoice(i)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === 'numeric' && (
        <input
          type="number"
          step="any"
          className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          placeholder="Введи число"
          disabled={done}
          value={num}
          onChange={(e) => setNum(e.target.value)}
        />
      )}

      {q.type === 'short' && (
        <textarea
          className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          rows={2}
          placeholder="Короткий ответ"
          disabled={done}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">Уверенность:</span>
        <input
          type="range"
          min={50}
          max={100}
          value={conf}
          disabled={done}
          onChange={(e) => setConf(Number(e.target.value))}
          className="w-40"
        />
        <Badge kind="warn">{conf}%</Badge>
      </div>

      {!done ? (
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black"
        >
          Ответить
        </button>
      ) : (
        <div className="space-y-2">
          <div>
            {result?.correct ? (
              <Badge kind="good">Верно</Badge>
            ) : (
              <Badge kind="bad">Неверно</Badge>
            )}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">
            {result?.explanation}{' '}
            {q.lesson_id ? (
              <a className="underline" href={'#lesson-' + q.lesson_id}>
                → к теории
              </a>
            ) : null}
          </div>
          <div className="text-xs text-gray-500">Brier: {result?.brier?.toFixed(3)}</div>
        </div>
      )}
    </div>
  )
}

export default function Quiz({ sections }) {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_BASE || '') + '/gen-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sections: sections.map((s) => ({ id: s.id, title: s.title })),
            count: Math.max(6, sections.length),
          }),
        })
        const data = await res.json()
        setQuestions(data.questions || [])
      } catch {
        setQuestions([])
      }
    })()
  }, [sections.map((s) => s.id).join(',')])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg md:text-xl font-semibold mb-3">Тренировка (DeepSeek)</h2>
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
            <QuestionCard q={q} onSubmit={() => {}} />
          </div>
        ))}
      </div>
    </div>
  )
}
