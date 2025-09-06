import React from 'react'
export default function Curriculum({ sections }){
  return (<div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
    <h2 className="text-lg md:text-xl font-semibold mb-3">Обучение</h2>
    <div className="space-y-3">
      {sections.map(sec => (<details key={sec.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
        <summary className="cursor-pointer font-medium">{sec.title}</summary>
        <div className="text-sm text-gray-600 dark:text-gray-300">{sec.description}</div>
        <div className="mt-3 space-y-2">
          {(sec.lessons||[]).map(les => (<article id={'lesson-'+les.id} key={les.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold mb-2">{les.title}</h3>
            <pre className="whitespace-pre-wrap text-sm">{les.content_md}</pre>
          </article>))}
        </div>
      </details>))}
    </div>
  </div>)}
