"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/src/contexts/WalletContext"
import { DemoProvider } from "@/lib/demo-context"
import { ThemeProvider } from "@/lib/theme-context"
import { useState, useEffect } from "react"
import "./globals.css"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <ThemeProvider>
        <WalletProvider>
          <DemoProvider>
            <Header />
            {children}
          </DemoProvider>
        </WalletProvider>
      </ThemeProvider>
      <Toaster />
      <Analytics />
    </>
  )
}

export default ClientLayout
