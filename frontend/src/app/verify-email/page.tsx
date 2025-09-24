'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { API_URL } from '@/lib/api'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function run() {
      if (!token) return
      setStatus('loading')
      try {
        const res = await fetch(`${API_URL}/auth/verify?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Verification failed')
        setStatus('success')
        setMessage('Your email has been verified. You can now log in.')
      } catch (e: any) {
        setStatus('error')
        setMessage(e.message)
      }
    }
    run()
  }, [token])

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Email Verification</h1>
      {!token && <p className="text-red-600">Missing token.</p>}
      {status === 'loading' && <p>Verifying your email…</p>}
      {status === 'success' && <p className="text-green-700">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
    </div>
  )
}
