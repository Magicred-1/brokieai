'use client'

import { useState, useEffect } from 'react'
import { X, Bot, Brain, Database, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

export default function AlphaDisclaimer() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenAIAgentDisclaimer')
    if (!hasSeenDisclaimer) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('hasSeenAIAgentDisclaimer', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div className="max-w-4xl w-full p-6 md:p-8 bg-white bg-opacity-10 rounded-xl shadow-xl text-white">
        <button 
          onClick={handleDismiss} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-8 w-8" />
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Image src="/andrew_smoking.gif" alt="Create new agent" width={60} height={60} />
          </div>
          <h2 className="text-2xl font-semibold text-center mb-4">Solana AI Agent: Alpha Version</h2>
        </div>
        <p className="text-sm text-center mb-6 max-w-3xl mx-auto">
          You’re diving into a powerful AI still in its alpha phase. Expect raw responses and rapid development. Here’s what you should know:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-start gap-4">
            <Bot className="h-8 w-8 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Experimental AI</h3>
              <p>Expect unpredictable responses. If you can’t handle it, this isn’t for you.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Brain className="h-8 w-8 text-purple-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Ongoing Development</h3>
              <p>We’re constantly improving. If you can’t keep up, step aside.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Database className="h-8 w-8 text-green-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Data Handling</h3>
              <p>Your data is safe, but be mindful of what you share.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MessageSquare className="h-8 w-8 text-yellow-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Feedback is Key</h3>
              <p>Your feedback will shape this AI. Report bugs and suggest improvements.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Button 
            onClick={handleDismiss}
            className="bg-blue-600 bg-opacity-90 hover:bg-blue-700 text-white border border-blue-600 border-opacity-90 transition-all duration-300 text-lg py-4 px-8 rounded-md shadow-md"
          >
            I Understand, Let's Go
          </Button>
        </div>
      </div>
    </div>
  )
}
