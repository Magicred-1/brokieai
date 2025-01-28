import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, Copy, Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AgentSelector } from "@/components/chat-agent-selector";
import { getAuthToken, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoldToSpeak } from "@/components/hold-to-speak";
import { Skeleton } from "./ui/skeleton";
import AudioPlayer from "./audio-player";

interface Message {
  role: string;
  content: string;
  timestamp: string;
  audioURL?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  AgentName: string;
}

interface Agent {
  id: string;
  name: string;
  walletAddress?: string;
}

export function ChatDrawer({ isOpen, onToggle }: ChatDrawerProps) {
  const [isResponding, setIsResponding] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const { user, primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address ?? "";
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState("");
  const isLoggedIn = useIsLoggedIn();

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
  ]);

  useEffect(() => {
    if (!userAddress) return;
    const token = getAuthToken();
    fetch(`/api/eliza/list/${userAddress}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length > 0) {
          setSelectedAgent(data.data[0]);
          setAgents(data.data);
        }
      })
      .catch((error) => console.error("Error fetching agents:", error));
  }, [userAddress]);

  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
  }, [messages, isResponding]);

  const sendMessage = useCallback(
    async (content: string, returnVoice = false) => {
      if (!userAddress) {
        toast.error("User not identified. Please log in and try again.");
        return;
      }
  
      if (!selectedAgent?.id) {
        toast.error("No agent selected. Please select an agent and try again.");
        return;
      }
  
      try {
        const formData = new FormData();
        formData.append("userId", userAddress);
        // formData.append("roomId", `default-room-${selectedAgent.id}`);
        formData.append("userName", user?.username ?? "Anonymous User");
  
        if (content.trim()) {
          formData.append("text", content.trim());
        }
  
        // Determine the endpoint based on the value of returnVoice
        const endpoint = returnVoice
          ? `/api/eliza/speak/${selectedAgent.id}`
          : `/api/eliza/message/${selectedAgent.id}`;
  
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }
  
        const contentType = response.headers.get("Content-Type");
  
        if (contentType && contentType.includes("application/json")) {
          const responseData = await response.json();
  
          const assistantMessages: Message[] = Array.isArray(responseData)
            ? responseData.map((msg) => ({
                role: "assistant",
                content: msg.text || "No response text",
                timestamp: new Date().toLocaleTimeString(),
                audioURL: msg.audioURL || undefined,
              }))
            : [
                {
                  role: "assistant",
                  content: responseData.text || "No response text",
                  timestamp: new Date().toLocaleTimeString(),
                  audioURL: responseData.audioURL || undefined,
                },
              ];
  
          setMessages((prev) => [...prev, ...assistantMessages]);
  
          assistantMessages.forEach((msg) => {
            if (msg.audioURL) {
              const audio = new Audio(msg.audioURL);
              audio.play().catch((error) => {
                console.error("Failed to autoplay audio:", error);
              });
            }
          });
        } else if (contentType && contentType.includes("audio")) {
          const blob = await response.blob();
          const audioURL = URL.createObjectURL(blob);
  
          const assistantMessage: Message = {
            role: "assistant",
            content: "Audio message",
            timestamp: new Date().toLocaleTimeString(),
            audioURL: audioURL,
          };
  
          setMessages((prev) => [...prev, assistantMessage]);
  
          const audio = new Audio(audioURL);
          audio.play().catch((error) => {
            console.error("Failed to autoplay audio:", error);
          });
        } else {
          console.error("Unexpected response content type:", contentType);
          toast.error("Received an unexpected response from the server.");
        }
      } catch (error) {
        console.error("API Error:", error);
        toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
      } finally {
        setIsResponding(false);
      }
    },
    [selectedAgent, userAddress, user?.username]
  );
  
  

  const handleSendMessage = async () => {
    const messageContent = textInput.trim();

    if (!messageContent) {
      toast.error("Message cannot be empty.");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTextInput("");
    setIsResponding(true);

    await sendMessage(messageContent, false);
  };

  const handleVoiceMessage = async (audioURL: string) => {
    const userMessage: Message = {
      role: "user",
      content: "Audio message",
      timestamp: new Date().toLocaleTimeString(),
      audioURL: audioURL,
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setIsResponding(true);
  
    try {
      // Fetch the audio file from the provided URL
      const audioBlob = await (await fetch(audioURL)).blob();
      const audioFile = new File([audioBlob], "audio.webm", { type: "audio/webm" });
  
      // Convert the audio to text using the textToSpeech API
      const formDataForVoice = new FormData();
      formDataForVoice.append("audio", audioFile);
  
      const transcriptionResponse = await fetch("/api/textToSpeech", {
        method: "POST",
        body: formDataForVoice,
      });
  
      if (!transcriptionResponse.ok) {
        console.error("Failed to transcribe audio:", transcriptionResponse.statusText);
        setIsResponding(false);
        return;
      }
  
      const transcriptionData = await transcriptionResponse.json();
      const text = transcriptionData.text;
  
      await sendMessage(text, true);
    } catch (error) {
      console.error("Error processing voice message:", error);
      toast.error("Failed to process voice message.");
    } finally {
      setIsResponding(false);
    }
  };

  const LoadingDots = () => (
    <div className="flex space-x-1">
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );

  const renderContent = () => {
    if (!userAddress)
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-center text-gray-500 text-lg">
            Please connect your wallet to start chatting with your agents.
          </p>
        </div>
      );
  
    if (agents.length === 0)
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-center text-gray-500 text-lg">No agents found. Create your first agent to get started!</p>
        </div>
      );
  
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
                <div className="flex items-center gap-2">
                  {message.audioURL ? (
                    <AudioPlayer audioURL={message.audioURL} />
                  ) : (
                    <p
                      className={`text-sm mt-1 p-2 rounded-lg ${
                        message.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.content}
                    </p>
                  )}
                </div>
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
    );
  };

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
          <SheetHeader className="px-4 py-3 md:px-6 md:py-4">
            <div className="flex flex-col gap-y-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                {selectedAgent ? (
                  <SheetTitle className="text-xl md:text-2xl truncate">
                    {selectedAgent.name || "Unnamed Agent"}
                  </SheetTitle>
                ) : (
                  <Skeleton className="h-7 w-[160px] md:h-8 md:w-[200px]" />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAgent ? (
                  selectedAgent.walletAddress ? (
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                if (selectedAgent?.walletAddress) {
                                  navigator.clipboard.writeText(selectedAgent.walletAddress);
                                  toast.success("Address copied to clipboard!");
                                }
                              }}
                              className="w-full sm:w-auto justify-start"
                            >
                              <Copy className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {selectedAgent.walletAddress ? "Copy Address" : "No Address"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="max-w-[200px] text-center">
                              {selectedAgent.walletAddress
                                ? "Copy agent contract address"
                                : "No contract address available"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                toast.info("Redirecting to agent funding interface...");
                              }}
                              className="w-full sm:w-auto flex items-center justify-center"
                            >
                              <span className="sm:hidden">💰</span>
                              <span className="text-center">Fund Agent</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center" className="mx-auto sm:mx-0">
                            <p className="max-w-[200px] text-center">
                              {selectedAgent.walletAddress
                                ? "Send funds to this agent"
                                : "Funding unavailable"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground px-2 py-1.5 w-full text-center sm:text-left">
                      No contract address available
                    </div>
                  )
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Skeleton className="h-9 w-full sm:w-[128px]" />
                    <Skeleton className="h-9 w-full sm:w-[110px]" />
                  </div>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4">
              <AgentSelector
                agents={agents}
                selectedAgent={selectedAgent || { id: "", name: "Select Agent", walletAddress: "" }}
                onAgentChange={setSelectedAgent}
              />
            </div>

            {renderContent()}

            <div className="sticky bottom-0 bg-background border-t">
              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
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
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-blue-500 to-teal-400 text-white"
                    type="submit"
                    disabled={!userAddress || isResponding}
                  >
                    <Send className="h-6 w-6 text-white" />
                    Send
                  </Button>
                </form>
                <div className="mt-4 flex justify-center">
                  <HoldToSpeak
                    onTranscription={(text) => handleVoiceMessage(text)}
                    onRelease={() => setIsResponding(false)}
                    isLoading={isResponding}
                    isDisabled={!isLoggedIn || !selectedAgent}
                    agentId={selectedAgent?.id ?? ""}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}