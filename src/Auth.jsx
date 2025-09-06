import React, { useState } from 'react'
import { supabase } from './supabaseClient'
import { logger } from './logger.js'

export default function Auth(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [mode,setMode]=useState('signin')
  const [err,setErr]=useState(null)
  const [loading,setLoading]=useState(false)

  async function submit(e){
    e.preventDefault()
    setErr(null); setLoading(true)
    try{
      if(mode === 'signup'){
        const { error } = await supabase.auth.signUp({ email, password })
        if(error) throw error
        logger.info('auth.signup:ok', { email })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
        logger.info('auth.signin:ok', { email })
      }
    }catch(e){
      setErr(e.message)
      logger.error('auth.error', { error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold">{mode === 'signup' ? 'Регистрация' : 'Вход'}</h2>
      <input className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <div className="text-red-500 text-sm">{err}</div>}
      <div className="flex items-center gap-2">
        <button disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">
          {loading ? '...' : (mode === 'signup' ? 'Зарегистрироваться' : 'Войти')}
        </button>
        <button type="button" className="text-sm underline" onClick={()=>setMode(mode==='signup'?'signin':'signup')}>
          {mode === 'signup' ? 'У меня уже есть аккаунт' : 'Создать аккаунт'}
        </button>
      </div>
    </form>
  )
}
