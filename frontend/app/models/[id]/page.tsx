import { ModelDetail } from "@/components/model-detail"

export default function ModelDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <ModelDetail modelId={params.id} />
      </div>
    </main>
  )
}
