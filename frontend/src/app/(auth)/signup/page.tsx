'use client'
import { useState } from 'react'
import { API_URL } from '@/lib/api'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function resendVerification() {
    if (!email) { setMsg('Enter your email first.'); return }
    setLoading(true); setMsg('')
    try {
      const res = await fetch(`${API_URL}/auth/request-verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to send verification email')
      setMsg('If the email exists and is unverified, a verification email has been sent.')
    } catch (e: any) {
      setMsg(e.message)
    } finally { setLoading(false) }
  }

  return (
    <form className="max-w-sm space-y-3" onSubmit={(e)=>e.preventDefault()}>
      <h1 className="text-xl font-semibold">Sign up</h1>
      <input className="w-full rounded border p-2" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" placeholder="Country (ISO2)" value={country} onChange={e=>setCountry(e.target.value)} />
      <input type="password" className="w-full rounded border p-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="rounded bg-blue-600 px-4 py-2 text-white">Create account</button>
      <div className="text-sm">
        <button type="button" onClick={resendVerification} disabled={loading} className="text-blue-700 underline">
          {loading ? 'Sending…' : 'Resend verification email'}
        </button>
      </div>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </form>
  )
}
