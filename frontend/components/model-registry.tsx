"use client"

import { useState, useEffect } from "react"
import type { Model } from "@/lib/types"
import { ModelCard } from "@/components/model-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useDemo } from "@/lib/demo-context"

export function ModelRegistry() {
  const [models, setModels] = useState<Model[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { isDemoMode } = useDemo()

  useEffect(() => {
    // Simulate loading models
    const mockModels: Model[] = [
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "Advanced language model with improved reasoning and code generation",
        creator: "OpenAI",
        trustScore: 9.8,
        totalCommits: 15234,
        verified: true,
        createdAt: Date.now() - 86400000 * 30,
      },
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        description: "Most capable Claude model with enhanced reasoning abilities",
        creator: "Anthropic",
        trustScore: 9.7,
        totalCommits: 12456,
        verified: true,
        createdAt: Date.now() - 86400000 * 25,
      },
      {
        id: "llama-2-70b",
        name: "Llama 2 70B",
        description: "Open-source large language model with strong performance",
        creator: "Meta",
        trustScore: 9.2,
        totalCommits: 8934,
        verified: true,
        createdAt: Date.now() - 86400000 * 20,
      },
      {
        id: "mistral-large",
        name: "Mistral Large",
        description: "High-performance model optimized for efficiency",
        creator: "Mistral AI",
        trustScore: 8.9,
        totalCommits: 5678,
        verified: true,
        createdAt: Date.now() - 86400000 * 15,
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        description: "Multimodal model with strong reasoning capabilities",
        creator: "Google",
        trustScore: 9.5,
        totalCommits: 11234,
        verified: true,
        createdAt: Date.now() - 86400000 * 10,
      },
      {
        id: "custom-model-1",
        name: "Custom Fine-tuned Model",
        description: "Community-trained model for specialized tasks",
        creator: "BlockQuest Community",
        trustScore: 7.2,
        totalCommits: 234,
        verified: false,
        createdAt: Date.now() - 86400000 * 5,
      },
    ]

    setTimeout(() => {
      setModels(mockModels)
      setIsLoading(false)
    }, 500)
  }, [])

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (isDemoMode) {
        // For demo, just add to the list
        const newModel: Model = {
          id: formData.name.toLowerCase().replace(/\s+/g, '-'),
          name: formData.name,
          description: formData.description,
          creator: "User",
          trustScore: 5.0,
          totalCommits: 0,
          verified: false,
          createdAt: Date.now(),
        }
        setModels((prev) => [newModel, ...prev])
      } else {
        // For production, use API
        await apiClient.registerModel({
          name: formData.name,
          description: formData.description,
        })
      }
      setIsModalOpen(false)
      setFormData({ name: "", description: "" })
      toast({
        title: "Success",
        description: "Model registered successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register model",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Models</CardTitle>
          <CardDescription>Find AI models by name, creator, or description</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-input border-border"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Models</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredModels.length} model{filteredModels.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          Register New Model
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-muted rounded" />
                  <div className="h-12 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredModels.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No models found matching your search</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Model</DialogTitle>
            <DialogDescription>
              Add a new AI model to the BlockQuest registry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Model Name</label>
              <Input
                name="name"
                placeholder="e.g., My Custom Model"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                name="description"
                placeholder="Describe your model's capabilities and use cases..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="bg-input border-border"
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Registering..." : "Register Model"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
