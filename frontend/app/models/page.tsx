import { ModelRegistry } from "@/components/model-registry"

export default function ModelsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Model Registry</h1>
          <p className="text-lg text-muted-foreground">
            Discover and explore verified AI models in the BlockQuest ecosystem
          </p>
        </div>
        <ModelRegistry />
      </div>
    </main>
  )
}
