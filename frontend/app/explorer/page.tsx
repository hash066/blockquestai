"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AnchorExplorer } from "@/components/anchor-explorer"

export default function ExplorerPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    // If there's a search query in the URL, we could pass it to the AnchorExplorer component
    // For now, the component handles its own search state
    if (searchQuery) {
      console.log('Search query from URL:', searchQuery)
    }
  }, [searchQuery])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Anchor Explorer</h1>
          <p className="text-lg text-muted-foreground">Explore blockchain anchors and verify cryptographic proofs</p>
        </div>
        <AnchorExplorer />
      </div>
    </main>
  )
}
