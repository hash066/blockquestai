"use client"

import Link from "next/link"
import { useWallet } from "@/src/contexts/WalletContext"
import { useDemo } from "@/lib/demo-context"
import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import ConnectWalletButton from "@/src/components/ConnectWalletButton"
import NetworkIndicator from "@/src/components/NetworkIndicator"

export function Header() {
  const { isDemoMode } = useDemo()
  const { isDark, toggleDarkMode } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
            BQ
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:inline">BlockQuest Explorer</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
            Home
          </Link>
          <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition">
            Register
          </Link>
          <Link href="/verify" className="text-sm text-muted-foreground hover:text-foreground transition">
            Verify
          </Link>
          <Link href="/models" className="text-sm text-muted-foreground hover:text-foreground transition">
            Models
          </Link>
          <Link href="/staking" className="text-sm text-muted-foreground hover:text-foreground transition">
            Stake
          </Link>
          <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition">
            History
          </Link>
          <Link href="/explorer" className="text-sm text-muted-foreground hover:text-foreground transition">
            Explorer
          </Link>
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition">
            Settings
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <NetworkIndicator />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-card transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {isDemoMode && (
            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-xs font-medium text-blue-400">
              Demo Mode
            </div>
          )}

          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
