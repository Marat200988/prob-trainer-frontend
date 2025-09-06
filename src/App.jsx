import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Topbar from './Topbar.jsx'
import Auth from './Auth.jsx'
import Quiz from './Quiz.jsx'
import Curriculum from './Curriculum.jsx'
import LogPanel from './LogPanel.jsx'

export default function App(){
  const [session,setSession]=useState(null)
  const [theme,setTheme]=useState(()=>localStorage.getItem('theme')||'dark')
  const [sections,setSections]=useState([
    { id:'bayes', title:'Байес и базовые частоты', description:'PPV/NPV, base rate', lessons:[{id:'bayes-1', title:'Интуиция Байеса', content_md:'Теорема Байеса в интуитивной форме...'}] },
    { id:'ev', title:'Ожидаемое значение и полезность', description:'EV, дисперсия, Kelly', lessons:[{id:'ev-1', title:'Expected Value', content_md:'EV = sum p_i * x_i ...'}] },
    { id:'tails', title:'Хвостовые риски', description:'Fat tails, Black Swans', lessons:[{id:'tails-1', title:'Fat tails', content_md:'Тяжёлые хвосты распределений ...'}] },
  ])

  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark'); localStorage.setItem('theme', theme) },[theme])
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e,s)=>setSession(s))
    return ()=>listener.subscription.unsubscribe()
  },[])

  if(!session){
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Topbar theme={theme} setTheme={setTheme} />
      <div className="max-w-md mx-auto p-6"><Auth/></div>
    </div>)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Topbar theme={theme} setTheme={setTheme} onLogout={()=>supabase.auth.signOut()} />
      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <Quiz sections={sections} />
        <Curriculum sections={sections} />
      </main>
      <LogPanel />
    </div>
  )
}
