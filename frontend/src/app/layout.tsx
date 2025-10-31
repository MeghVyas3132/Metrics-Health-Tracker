'use client'

import { ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>HealthTrack — Service Monitoring</title>
        <meta name="description" content="Monitor your services and APIs in real-time" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}
