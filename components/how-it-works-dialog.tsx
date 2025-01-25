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
import { HelpCircle, Mic, Wallet, Code } from 'lucide-react'

export function HowItWorksDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-normal hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out">
          <HelpCircle className="mr-1.5 h-3 w-3" />
          How does it work?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-4xl">
        <DialogHeader>     
          <DialogTitle>How the Crypto AI Agent Creator Works</DialogTitle>
          <DialogDescription>
            Simple 4-step process to create and deploy your AI-powered token
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
          <section className="flex flex-row md:flex-col items-start md:items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-foreground bg-opacity-10">
              <Wallet className="h-8 w-8 md:mx-auto text-primary flex-shrink-0" />
              <div className="space-y-1 md:text-center">
                <h3 className="font-medium text-base">1. Connect Solana Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Start by connecting your Phantom, Solflare, or any Solana-compatible wallet.
                </p>
              </div>
            </div>
          </section>
          <section className="flex flex-row md:flex-col items-start md:items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-foreground bg-opacity-10">
              <Code className="h-8 w-8 md:mx-auto text-primary flex-shrink-0" />
              <div className="space-y-1 md:text-center">
                <h3 className="font-medium text-base">2. Create Your AI Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Use our no-code interface to configure your AI agent's behavior.
                </p>
              </div>
            </div>
          </section>
          <section className="flex flex-row md:flex-col items-start md:items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-foreground bg-opacity-10">
              <Wallet className="h-8 w-8 md:mx-auto text-primary flex-shrink-0" />
              <div className="space-y-1 md:text-center">
                <h3 className="font-medium text-base">3. Fund & Deploy Token</h3>
                <p className="text-sm text-muted-foreground">
                  Deposit SOL and deploy your token contract directly to the Solana blockchain.
                </p>
              </div>
            </div>
          </section>
          <section className="flex flex-row md:flex-col items-start md:items-center gap-4">
          <div className="p-3 rounded-lg bg-primary-foreground bg-opacity-10">
            <Mic className="h-8 w-8 md:mx-auto text-primary flex-shrink-0" />
            <div className="space-y-1 md:text-center">
              <h3 className="font-medium text-base">4. Interact with AI Agent</h3>
              <p className="text-sm text-muted-foreground">
                Use voice or text commands to manage your token and access AI-powered analytics.
              </p>
            </div>
          </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}