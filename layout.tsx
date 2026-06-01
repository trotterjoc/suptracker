import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VitaTrack - Supplement Tracker',
  description: 'Track your daily supplements',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
