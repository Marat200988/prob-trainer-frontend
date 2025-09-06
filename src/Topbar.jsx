import React from 'react'
export default function Topbar({ theme, setTheme, onLogout }){
  return (<header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur sticky top-0 z-10">
    <div className="max-w-5xl mx-auto p-3 flex items-center justify-between">
      <div className="font-bold">Вероятностный тренажёр</div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'🌙':'☀️'}</button>
        {onLogout && <button className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black" onClick={onLogout}>Выход</button>}
      </div>
    </div>
  </header>)}
