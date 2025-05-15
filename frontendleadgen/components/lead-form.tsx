"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface LeadFormProps {
  setLeadInfo: React.Dispatch<
    React.SetStateAction<{
      email: string
      companyName: string
      submitted: boolean
    }>
  >
}

export function LeadForm({ setLeadInfo }: LeadFormProps) {
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email || !companyName) {
      setError("Please fill in all fields")
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setLeadInfo({
      email,
      companyName,
      submitted: true,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              placeholder="Your Company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Start Conversation
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
