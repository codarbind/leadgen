import { SalesAssistant } from "@/components/sales-assistant"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Sales Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Chat with our AI assistant to learn how we can help your business
          </p>
        </div>
        <SalesAssistant />
      </div>
    </main>
  )
}
