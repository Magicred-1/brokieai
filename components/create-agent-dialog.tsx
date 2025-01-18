'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'

export function CreateAgentDialog() {
  const [agentName, setAgentName] = useState('')
  const [agentDescription, setAgentDescription] = useState('')

  const handleCreateAgent = () => {
    // Here you would typically handle the agent creation logic
    console.log('Creating agent:', { name: agentName, description: agentDescription })
    // Reset form and close dialog
    setAgentName('')
    setAgentDescription('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            Create New Agent</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Set up a new AI agent with a name and description. Click create when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-name" className="text-right">
              Name
            </Label>
            <Input
              id="agent-name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="agent-description"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateAgent}>Create Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

