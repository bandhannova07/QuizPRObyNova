type EmailParams = { to: string; subject: string; html: string; from?: string }

async function sendViaMock(p: EmailParams) {
  // eslint-disable-next-line no-console
  console.log('[EMAIL:MOCK]', { to: p.to, subject: p.subject })
}

async function sendViaSendgrid(p: EmailParams) {
  const key = process.env.SENDGRID_API_KEY
  if (!key) throw new Error('SENDGRID_API_KEY missing')
  const from = p.from || process.env.EMAIL_FROM || 'no-reply@example.com'
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: p.to }] }],
      from: { email: from },
      subject: p.subject,
      content: [{ type: 'text/html', value: p.html }],
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SendGrid failed: ${res.status} ${text}`)
  }
}

export async function sendEmail(p: EmailParams) {
  const provider = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase()
  if (provider === 'sendgrid') return sendViaSendgrid(p)
  return sendViaMock(p)
}
