/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, Copy, Mic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import VoiceWave from "@/components/voice-wave"
import debounce from "lodash/debounce"
import { toast } from "sonner"
import { AgentSelector } from "./chat-agent-selector"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
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
  //const [isFullScreen, setIsFullScreen] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const [, setVolume] = useState(0)
  const [isLoading] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>()
  const [agents, setAgents] = useState<Agent[]>([])
  const { user, primaryWallet } = useDynamicContext()
  const userAddress = primaryWallet?.address ?? ""
  const chatWindowRef = useRef<HTMLDivElement>(null)

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

  const [textInput, setTextInput] = useState("")

  // useEffect(() => {
  //   if (!isOpen) {
  //     setIsFullScreen(false)
  //   }
  // }, [isOpen])

  useEffect(() => {
    if (!userAddress) return

    fetch("/api/eliza/list/" + userAddress)
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length > 0) {
          setSelectedAgent(data.data[0])
          setAgents(data.data)
        }
      })
      .catch((error) => console.error("Error fetching agents:", error))
  }, [userAddress])

  const handleAgentChange = (agent: Agent) => {
    setSelectedAgent(agent)
  }

  const onCopy = () => {
    if (!selectedAgent) return;
    navigator.clipboard.writeText(selectedAgent.tokenAddress ?? "")
    toast.success("Address copied to clipboard.")
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

    recognition.onstart = () => setIsMicActive(true)

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

      if (finalTranscript) {
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: finalTranscript.trim(),
            timestamp: new Date().toLocaleTimeString(),
          },
        ])
      }

      if (interimTranscript) {
        setMessages((prev) => {
          const updatedMessages = [...prev]
          const lastMessage = updatedMessages[updatedMessages.length - 1]

          if (lastMessage?.role === "user") {
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: interimTranscript.trim(),
            }
          }

          return updatedMessages
        })
      }
    }, 300)

    recognition.onerror = (event: any) => {
      if (event.error === "network") {
        toast.error("Network error: Check your internet connection.")
      } else {
        toast.error(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      if (isMicActive) {
        try {
          recognition.start()
        } catch (error) {
          console.error("Speech recognition failed to restart:", error)
        }
      }
    }

    return recognition
  }

  const startSpeechRecognition = async () => {
    try {
      const recognition = initializeSpeechRecognition()
      if (!recognition) return

      const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()

      let microphone
      try {
        microphone = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (error) {
        console.error("Error accessing microphone:", error)
        toast.error("Failed to access microphone. Please check your permissions.")
        return
      }

      const microphoneStream = audioContext.createMediaStreamSource(microphone)
      microphoneStream.connect(analyser)

      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray)
        const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const normalizedVolume = Math.min(1, averageVolume / 256)
        setVolume(normalizedVolume)
      }

      const volumeInterval = setInterval(updateVolume, 100)

      recognitionRef.current = recognition
      recognition.start()

      recognition.onend = () => {
        clearInterval(volumeInterval)
        microphone.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      toast.error("Failed to start speech recognition.")
    }
  }

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsMicActive(false)
    setVolume(0)
  }

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => () => stopSpeechRecognition(), [])

  const toggleMic = () => {
    if (isMicActive) {
      stopSpeechRecognition()
    } else {
      startSpeechRecognition()
    }
  }

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (textInput.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: textInput.trim(),
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
      setTextInput("")
    }
  }

  const renderContent = () => {
    if (!userAddress) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-center text-gray-500 text-lg">
            Please connect your wallet to start chatting with your agents.
          </p>
        </div>
      )
    }

    if (agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-center text-gray-500 text-lg">No agents found. Create your first agent to get started!</p>
        </div>
      )
    }

    return (
      <div
        style={{ transition: "height 0.3s ease-in-out" }}
        className="flex-1 overflow-y-auto space-y-4 px-4 pb-4"
        ref={chatWindowRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-start" : "justify-end"} space-x-4 p-4`}
          >
            <div className={`flex ${message.role === "user" ? "flex-row" : "flex-row-reverse"} items-start space-x-4`}>
              <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
              <div className={`flex flex-col ${message.role === "user" ? "items-start" : "items-end"}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {message.role === "user" ? user?.username : selectedAgent?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>
                <p
                  className={`text-sm leading-relaxed mt-1 p-2 rounded-lg ${
                    message.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}
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
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            className="bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:from-blue-600 hover:to-teal-500 transition-all duration-300 rounded-l-full pr-4 pl-3 h-12"
          >
            <ArrowLeft className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Chat with your Agents</span>
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full transition-all duration-300 ease-in-out md:max-w-[600px] lg:max-w-[800px]"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl">Chat with {selectedAgent?.name}
                {
                  selectedAgent?.tokenAddress  ? <Button variant={"secondary"} onClick={onCopy}><Copy /> Copy Address</Button> : null
                }
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4">
              <AgentSelector
                agents={agents}
                selectedAgent={selectedAgent ?? { id: "", name: "Create your first agent to get started", tokenAddress: "" } as Agent}
                onAgentChange={handleAgentChange}
              />
            </div>

            {renderContent()}

            <div className="sticky bottom-0 bg-background border-t">
              <div className="p-6">
                <form onSubmit={handleTextSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow p-2 border rounded-md"
                  />
                  <Button type="submit" disabled={isLoading || !userAddress}>
                    Send
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          animate={{
                            scale: isMicActive ? 1 : [1, 1.1, 1],
                            opacity: isMicActive ? 1 : [1, 0.7, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                        >
                          <Button
                            type="button"
                            onClick={toggleMic}
                            disabled={isLoading || !userAddress}
                            className={`rounded-full p-2 ${
                              isMicActive
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                : "bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
                            }`}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {isLoading ? (
                                <motion.div
                                  key="loading"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </motion.div>
                              ) : isMicActive ? (
                                <motion.div
                                  key="voice-wave"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <VoiceWave isActive={true} />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="mic-icon"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Mic className="h-6 w-8 text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMicActive ? "Click to stop using microphone" : "Click to start use microphone"}</p>
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

