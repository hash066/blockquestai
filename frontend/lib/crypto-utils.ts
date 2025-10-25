// Cryptographic utilities for BlockQuest Explorer

export async function hashPrompt(prompt: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback for environments without crypto.subtle
    let hash = 0
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(prompt)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  } catch (error) {
    console.error("Crypto API error:", error)
    // Fallback hash function
    let hash = 0
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }
}

export async function signMessage(message: string, privateKey: string): Promise<string> {
  // This is a placeholder - actual signing would use ethers.js or web3.js
  // In production, signing happens via wallet provider
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function verifyMerkleProof(leaf: string, proof: string[], root: string): boolean {
  let current = leaf
  for (const sibling of proof) {
    current = hashCombined(current, sibling)
  }
  return current === root
}

function hashCombined(a: string, b: string): string {
  // Simplified hash combination - in production use proper hashing
  const combined = a < b ? a + b : b + a
  return combined.substring(0, 64)
}
