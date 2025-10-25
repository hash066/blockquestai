"use client"

import { useEffect, useState } from "react"

interface ServiceStatus {
  name: string
  status: "online" | "offline"
}

export function SystemStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Registrar API", status: "offline" },
    { name: "Web3.Storage", status: "offline" },
    { name: "Anchor Contract", status: "offline" },
    { name: "Sequencer", status: "offline" },
  ])

  useEffect(() => {
    // Simulate checking service status
    const checkServices = async () => {
      // In production, this would call actual health check endpoints
      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          status: Math.random() > 0.5 ? "online" : "offline",
        })),
      )
    }

    checkServices()
    const interval = setInterval(checkServices, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-8">System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${service.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{service.name}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    service.status === "online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {service.status === "online" ? "✓" : "✕"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
