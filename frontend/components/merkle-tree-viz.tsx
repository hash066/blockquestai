"use client"

import { useEffect, useRef } from "react"

interface MerkleTreeVizProps {
  proof: string[]
  leafHash: string
}

export function MerkleTreeViz({ proof, leafHash }: MerkleTreeVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const nodeRadius = 25
    const levelHeight = 80

    // Clear canvas
    ctx.fillStyle = "rgba(15, 23, 42, 1)"
    ctx.fillRect(0, 0, width, height)

    // Draw nodes
    const levels = Math.ceil(Math.log2(proof.length + 1))
    const nodeWidth = width / (proof.length + 2)

    // Draw leaf node
    ctx.fillStyle = "rgba(139, 92, 246, 0.8)"
    ctx.beginPath()
    ctx.arc(width / 2, height - 40, nodeRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.font = "10px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Leaf", width / 2, height - 40)

    // Draw proof nodes
    for (let i = 0; i < proof.length; i++) {
      const x = (i + 1) * nodeWidth
      const y = height - 40 - (i + 1) * levelHeight

      ctx.fillStyle = "rgba(96, 165, 250, 0.6)"
      ctx.beginPath()
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = "rgba(139, 92, 246, 0.4)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(width / 2, height - 40)
      ctx.lineTo(x, y)
      ctx.stroke()

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.font = "9px monospace"
      ctx.fillText(`P${i}`, x, y)
    }

    // Draw root node
    if (proof.length > 0) {
      const rootX = width / 2
      const rootY = 40

      ctx.fillStyle = "rgba(34, 197, 94, 0.8)"
      ctx.beginPath()
      ctx.arc(rootX, rootY, nodeRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.font = "10px monospace"
      ctx.fillText("Root", rootX, rootY)
    }
  }, [proof])

  return <canvas ref={canvasRef} width={600} height={400} className="w-full border border-border rounded-lg" />
}
