/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, Copy, Mic } from "lucide-react"
import { motion } from "framer-motion"
import VoiceWave from "@/components/voice-wave"
import debounce from "lodash/debounce"
import { toast } from "sonner"
import { AgentSelector } from "@/components/chat-agent-selector"
import { getAuthToken, useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  role: string
  content: string
  timestamp: string
}

interface ChatDrawerProps {
  isOpen: boolean
  onToggle: () => void
  AgentName: string
}

interface Agent {
  id: string
  name: string
  tokenAddress?: string
}

export function ChatDrawer({ isOpen, onToggle }: ChatDrawerProps) {
  const [isMicActive, setIsMicActive] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>()
  const [agents, setAgents] = useState<Agent[]>([])
  const { user, primaryWallet } = useDynamicContext()
  const userAddress = primaryWallet?.address ?? ""
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const [textInput, setTextInput] = useState("")

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "user",
      content: "Hello!",
      timestamp: "10:15 AM",
    },
    {
      role: "assistant",
      content: "Hi there! How can I assist you today?",
      timestamp: "10:16 AM",
    },
  ])

  const LoadingDots = () => (
    <div className="flex space-x-1">
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
      />
    </div>
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        toast.error("Message cannot be empty.")
        return
      }

      if (!selectedAgent?.id) {
        toast.error("No agent selected. Please select an agent and try again.")
        return
      }

      if (!userAddress) {
        toast.error("User not identified. Please log in and try again.")
        return
      }

      const userMessage: Message = {
        role: "user",
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setTextInput("")
      setIsResponding(true)

      try {
        const formData = new FormData()
        formData.append("text", content.trim())
        formData.append("userId", userAddress)
        formData.append("roomId", `default-room-${selectedAgent.id}`)
        formData.append("userName", user?.username ?? "Anonymous User")

        const response = await fetch(`/api/eliza/message/${selectedAgent.id}`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        const responseData = await response.json()

        const assistantMessages: Message[] = Array.isArray(responseData)
          ? responseData.map((msg) => ({
              role: "assistant",
              content: msg.text || "No response text",
              timestamp: new Date().toLocaleTimeString(),
            }))
          : [
              {
                role: "assistant",
                content: responseData.text || "No response text",
                timestamp: new Date().toLocaleTimeString(),
              },
            ]

        setMessages((prev) => [...prev, ...assistantMessages])
      } catch (error) {
        console.error("API Error:", error)
        toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsResponding(false)
      }
    },
    [selectedAgent, userAddress, user?.username],
  )

  const handleSubmit = (content: string) => {
    sendMessage(content)
    setTextInput("")
  }

  const onFund = () => {
    if (!selectedAgent?.tokenAddress) {
      toast.error("No agent address available.")
      return
    }
    // For demonstration - replace with actual funding logic
    toast.info("Redirecting to agent funding interface...")
    // Add your funding logic here (e.g., wallet transaction)
  }

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported on this browser.")
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = debounce((event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (interimTranscript) setTextInput(interimTranscript.trim())
      if (finalTranscript) handleSubmit(finalTranscript.trim())
    }, 300)

    recognition.onerror = (event: any) => {
      toast.error(`Speech recognition error: ${event.error}`)
      stopSpeechRecognition()
    }

    recognition.onend = () => {
      if (isMicActive) recognition.start()
    }

    return recognition
  }

  const startSpeechRecognition = async () => {
    const recognition = initializeSpeechRecognition()
    if (!recognition) return

    try {
      recognitionRef.current = recognition
      recognition.start()
      setIsMicActive(true)
    } catch (error) {
      toast.error("Failed to start speech recognition.")
      console.error("Speech recognition error:", error)
    }
  }

  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsMicActive(false)
  }
  

  useEffect(() => {
    if (!userAddress) return
    const token = getAuthToken();
    fetch(`/api/eliza/list/${userAddress}`, {
      headers: {  
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // add jwt token
      },
    })  .then((response) => response.json())
      .then((data) => {
        if (data.data.length > 0) {
          setSelectedAgent(data.data[0])
          setAgents(data.data)
        }
      })
      .catch((error) => console.error("Error fetching agents:", error))
  }, [userAddress])

  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight)
  }, [messages, isResponding])

  const toggleMic = () => (isMicActive ? stopSpeechRecognition() : startSpeechRecognition())

  const onCopy = () => {
    if (!selectedAgent?.tokenAddress) return
    navigator.clipboard.writeText(selectedAgent.tokenAddress)
    toast.success("Address copied to clipboard.")
  }

  const renderContent = () => {
    if (!userAddress)
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-center text-gray-500 text-lg">
            Please connect your wallet to start chatting with your agents.
          </p>
        </div>
      )

    if (agents.length === 0)
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-center text-gray-500 text-lg">No agents found. Create your first agent to get started!</p>
        </div>
      )

    return (
      <div className="flex-1 overflow-y-auto space-y-4 px-4 pb-4" ref={chatWindowRef}>
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-start" : "justify-end"} p-4`}>
            <div className={`flex ${message.role === "user" ? "flex-row" : "flex-row-reverse"} items-start gap-4`}>
              <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
              <div className={`flex flex-col ${message.role === "user" ? "items-start" : "items-end"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {message.role === "user" ? user?.username : selectedAgent?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>
                <p
                  className={`text-sm mt-1 p-2 rounded-lg ${
                    message.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isResponding && (
          <div className="flex justify-start p-4">
            <div className="flex flex-row items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedAgent?.name}</span>
                </div>
                <div className="text-sm mt-1 p-2 rounded-lg bg-gray-100 text-gray-900">
                  <LoadingDots />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetTrigger asChild>
        <motion.div
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 overflow-hidden"
          initial={{ width: "48px" }}
          whileHover={{ width: "auto" }}
        >
          <Button
            variant="ghost"
            className="bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:from-blue-600 hover:to-teal-500 rounded-l-full pr-4 pl-3 h-12"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="whitespace-nowrap">Chat with your Agents</span>
          </Button>
        </motion.div>
      </SheetTrigger>

      <SheetContent side="right" className="w-full md:max-w-[600px] lg:max-w-[800px]">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl">{selectedAgent?.name}</SheetTitle>
              <div className="flex gap-2">
                {selectedAgent?.tokenAddress && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="secondary" onClick={onCopy}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Address
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy agent contract address</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="secondary" onClick={onFund}>
                            💰 Fund Agent
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send funds to this agent</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>
          </SheetHeader>
        

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4">
              <AgentSelector
                agents={agents}
                selectedAgent={selectedAgent || { id: "", name: "Select Agent", tokenAddress: "" }}
                onAgentChange={setSelectedAgent}
              />
            </div>

            {renderContent()}

            <div className="sticky bottom-0 bg-background border-t">
              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(textInput)
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow p-2 border rounded-md"
                  />
                  <Button type="submit" disabled={!userAddress || isResponding}>
                    Send
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          onClick={toggleMic}
                          disabled={!userAddress || isResponding}
                          className={`rounded-full p-2 ${
                            isMicActive
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                              : "bg-gradient-to-r from-blue-500 to-teal-400"
                          }`}
                        >
                          {isMicActive ? <VoiceWave isActive /> : <Mic className="h-6 w-6 text-white" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMicActive ? "Stop recording" : "Start recording"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </form>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

