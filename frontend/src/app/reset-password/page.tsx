'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { API_URL } from '@/lib/api'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing token in URL')
    }
  }, [token])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters')
      setStatus('error')
      return
    }
    if (password !== confirm) {
      setMessage('Passwords do not match')
      setStatus('error')
      return
    }
    setStatus('submitting')
    setMessage('')
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to reset password')
      setStatus('success')
      setMessage('Password updated. You can now log in.')
    } catch (e: any) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Reset Password</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="password" className="w-full rounded border p-2" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input type="password" className="w-full rounded border p-2" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        <button disabled={status==='submitting'} className="rounded bg-blue-600 px-4 py-2 text-white">
          {status==='submitting' ? 'Updating…' : 'Update password'}
        </button>
      </form>
      {message && (
        <p className={status==='error' ? 'text-red-600' : 'text-green-700'}>{message}</p>
      )}
    </div>
  )
}
