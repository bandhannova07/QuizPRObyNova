import '../styles/globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'QuizPRO',
  description: 'Play quizzes and climb the leaderboard',
  metadataBase: new URL('https://app.placeholder-domain.com'),
  openGraph: { title: 'QuizPRO', description: 'Play quizzes and climb the leaderboard' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b bg-white">
          <nav className="container mx-auto flex items-center gap-4 p-4">
            <Link href="/">Home</Link>
            <Link href="/quiz">Play</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/admin">Admin</Link>
            <div className="ml-auto flex gap-3">
              <Link href="/signup">Sign up</Link>
              <Link href="/login">Log in</Link>
            </div>
          </nav>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="border-t p-4 text-center text-sm text-gray-500">© {new Date().getFullYear()} QuizPRO</footer>
      </body>
    </html>
  )
}
