"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, User } from "lucide-react"
import { LeadForm } from "@/components/lead-form"

let socket: Socket | null = null
let inactivityTimer: NodeJS.Timeout | null = null

export function SalesAssistant() {
  const [leadInfo, setLeadInfo] = useState({ email: "", companyName: "", submitted: false })
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [leadQualification, setLeadQualification] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const showCalendlyLink = leadQualification === "Hot lead" || leadQualification === "Very big potential customer"

  const appendMessage = (msg: any) => {
    setMessages((prev) => [...prev, msg])
  }

  const startInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(() => {
      if (leadInfo.submitted && messages.length > 1) {
        fetch("/api/save-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadInfo, messages }),
        })

        if (showCalendlyLink) {
          appendMessage({
            role: "assistant",
            content:
              'You seem interested! Let’s talk further —\n[Schedule a call](https://bookacallwith.us/now)',
          })
        }
      }
    }, 90_000)
  }

  const connectSocket = () => {
    socket = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
      transports: ["websocket"],
    })

    socket.on("connect", () => {
      socket?.emit("init", {sessionId:socket.id, leadInfo })

      appendMessage({
        role: "assistant",
        content:
          "Hi there! I'm the AI assistant. I'd be happy to discuss how our software development services can help your business. Could you tell me a bit about your company and what brings you here today?",
      })
    })

    socket.on("assistant_reply", (data) => {

        if (data.content.includes("LEAD_QUALIFICATION:")) {
          const match = data.content.match(/LEAD_QUALIFICATION:(.*?)(?:\n|$)/)
          if (match?.[1]) {
            setLeadQualification(match[1].trim())
          }
          data.content = data.content.replace(/LEAD_QUALIFICATION:.*?(?:\n|$)/, "")
        }
  

      appendMessage(data)
      startInactivityTimer()
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
    })
  }

  const handleSend = () => {
    if (!input.trim() || !socket?.connected) return

    const msg = { role: "user", content: input, sessionId:socket.id }
    appendMessage(msg)
    socket.emit("message", msg)
    setInput("")
    startInactivityTimer()
  }

  useEffect(() => {
    if (leadInfo.submitted && !socket) {
      connectSocket()
    }
    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [leadInfo.submitted])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-[70vh]">
      {!leadInfo.submitted ? (
        <LeadForm setLeadInfo={setLeadInfo} />
      ) : (
        <Card className="flex flex-col h-full">
          <CardHeader className="px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">AI Assistant</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <User size={18} />
                    </div>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full items-center space-x-2"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 min-h-10 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send size={18} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
