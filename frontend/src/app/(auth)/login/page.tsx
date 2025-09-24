'use client'
import { useState } from 'react'
import { API_URL } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState<'idle'|'reset'|'verify'>('idle')

  async function requestPasswordReset() {
    if (!email) { setMsg('Enter your email first.'); return }
    setLoading('reset'); setMsg('')
    try {
      const res = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to send reset link')
      setMsg('If the email exists, a reset link has been sent.')
    } catch (e: any) {
      setMsg(e.message)
    } finally { setLoading('idle') }
  }

  async function resendVerification() {
    if (!email) { setMsg('Enter your email first.'); return }
    setLoading('verify'); setMsg('')
    try {
      const res = await fetch(`${API_URL}/auth/request-verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to send verification email')
      setMsg('If the email exists and is unverified, a verification email has been sent.')
    } catch (e: any) {
      setMsg(e.message)
    } finally { setLoading('idle') }
  }

  return (
    <form className="max-w-sm space-y-3" onSubmit={(e)=>{e.preventDefault()}}>
      <h1 className="text-xl font-semibold">Log in</h1>
      <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="w-full rounded border p-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="rounded bg-blue-600 px-4 py-2 text-white">Log in</button>
      <div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={requestPasswordReset} disabled={loading==='reset'} className="text-blue-700 underline">
          {loading==='reset' ? 'Sending…' : 'Forgot password?'}
        </button>
        <span className="text-gray-400">|</span>
        <button type="button" onClick={resendVerification} disabled={loading==='verify'} className="text-blue-700 underline">
          {loading==='verify' ? 'Sending…' : 'Resend verification email'}
        </button>
      </div>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </form>
  )
}
