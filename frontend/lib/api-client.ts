// API client for BlockQuest Explorer backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7001"

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Commits
  async registerCommit(data: {
    promptHash: string
    signature: string
    modelId: string
    prompt: string
    address: string
  }) {
    return this.request("/api/commit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getCommit(commitId: string) {
    return this.request(`/api/commits/${commitId}`)
  }

  async getUserCommits(address: string) {
    return this.request(`/api/commits?user=${address}`)
  }

  // Proofs
  async getProof(commitId: string) {
    return this.request(`/proofs/${commitId}`)
  }

  async verifyProof(data: { commitId: string; proof: string[] }) {
    return this.request("/proofs/verify", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Models
  async getModels() {
    return this.request("/models")
  }

  async getModel(modelId: string) {
    return this.request(`/models/${modelId}`)
  }

  async registerModel(data: { name: string; description: string }) {
    return this.request("/models", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Challenges
  async getChallenge(challengeId: string) {
    return this.request(`/challenges/${challengeId}`)
  }

  async resolveChallenge(challengeId: string, data: { resolved: boolean }) {
    return this.request(`/challenges/${challengeId}/resolve`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Anchors
  async getAnchors(commitId?: string) {
    const query = commitId ? `?commitId=${commitId}` : ""
    return this.request(`/anchors${query}`)
  }

  async createAnchor(data: { commitId: string; blockNumber: number; transactionHash: string }) {
    return this.request("/anchors", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Stakes
  async createStake(data: {
    commitId: string
    amount: string
    prediction: string
    address: string
  }) {
    return this.request("/stakes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getUserStakes(address: string) {
    return this.request(`/stakes?user=${address}`)
  }

  // Challenges
  async createChallenge(data: {
    commitId: string
    stakeAmount: string
    reason: string
  }) {
    return this.request("/challenges", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getUserChallenges(address: string) {
    return this.request(`/challenges?user=${address}`)
  }

  async respondToChallenge(challengeId: string, data: { response: string }) {
    return this.request(`/challenges/${challengeId}/respond`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // User Profile
  async getUserProfile(address: string) {
    return this.request(`/users/${address}`)
  }

  async updateUserProfile(address: string, data: { username?: string }) {
    return this.request(`/users/${address}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
