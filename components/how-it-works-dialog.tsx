"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle, MessageSquare, Mic, Wallet, Code } from 'lucide-react'

export function HowItWorksDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-normal hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out">
          <HelpCircle className="mr-1.5 h-3 w-3" />
          How does it work?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How the Crypto AI Agent Creator Works</DialogTitle>
          <DialogDescription>
            Understand the key features of our platform
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <section className="flex items-start space-x-4">
            <Wallet className="h-8 w-8 mt-0.5 text-primary flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-base">Connect Your Solana Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Solana wallet to create, pay for, and deploy your AI agents. Our platform supports all Solana wallets, including Phantom, Sollet, and more.
              </p>
            </div>
          </section>
          <section className="flex items-start space-x-4">
            <Code className="h-8 w-8 mt-0.5 text-primary flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-base">No Code AI Agent Creation</h3>
              <p className="text-sm text-muted-foreground">
                Effortlessly create AI agents with no coding required. Customize functionality, integrate with Solana, Pump.fun ... etc
              </p>
            </div>
          </section>
          <section className="flex items-start space-x-4">
            <MessageSquare className="h-8 w-8 mt-0.5 text-primary flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-base">Deploy Your AI Agent</h3>
              <p className="text-sm text-muted-foreground">
                Once your agent is ready, deploy it seamlessly and start interacting with it immediately. Our platform handles the technical details for you.
              </p>
            </div>
          </section>
          <section className="flex items-start space-x-4">
            <Mic className="h-8 w-8 mt-0.5 text-primary flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-base">Talk to Your AI Agent</h3>
              <p className="text-sm text-muted-foreground">
                Use the microphone button to speak your queries. Our system converts speech to text and processes your questions in real-time, enabling smooth interaction with your AI agent.
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
