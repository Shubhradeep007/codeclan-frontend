import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Toaster } from "react-hot-toast"

const spaceGrotesk = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] })
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeClan — The Sentient Terminal",
  description: "A high-fidelity environment for elite developers to share code snippets.",
  keywords: "code snippets, programming, developer community, code sharing",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} suppressHydrationWarning>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-container-highest)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              backdropFilter: 'blur(12px)',
            },
            success: { iconTheme: { primary: 'var(--secondary)', secondary: '#000' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  )
}
