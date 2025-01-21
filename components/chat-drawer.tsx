/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowLeft, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceWave from "@/components/voice-wave";
import debounce from "lodash/debounce";
import { toast } from "sonner";
import { AgentSelector } from "./chat-agent-selector";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  AgentName: string;
}

interface Agent {
  id: string;
  name: string;
}

export function ChatDrawer({
  isOpen,
  onToggle,
  AgentName = "Adam",
}: ChatDrawerProps) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [, setVolume] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>();
  const [agents, setAgents] = useState<Agent[]>([]);

  const { user, primaryWallet } = useDynamicContext();

  const userAddress = primaryWallet?.address ?? "";

  useEffect(() => {
    if (!userAddress) return;

    fetch("/api/eliza/list/" + userAddress)
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length > 0) {
          setSelectedAgent(data.data[0]);
          setAgents(data.data);
        }
      })
      .catch((error) => console.error("Error fetching agents:", error));
  }, [userAddress]);

  const handleAgentChange = (agent: { id: string; name: string }) => {
    setSelectedAgent(agent);
  };

  const chatWindowRef = useRef<HTMLDivElement>(null);

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

  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported on this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsMicActive(true);

    recognition.onresult = debounce((event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
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
        ]);
      }

      if (interimTranscript) {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];

          if (lastMessage?.role === "user") {
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: interimTranscript.trim(),
            };
          }

          return updatedMessages;
        });
      }
    }, 300);

    recognition.onerror = (event: any) => {
      if (event.error === "network") {
        toast.error("Network error: Check your internet connection.");
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isMicActive) {
        try {
          recognition.start();
        } catch (error) {
          console.error("Speech recognition failed to restart:", error);
        }
      }
    };

    return recognition;
  };

  const startSpeechRecognition = async () => {
    try {
      const recognition = initializeSpeechRecognition();
      if (!recognition) return;

      const audioContext = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();

      let microphone;
      try {
        microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast.error(
          "Failed to access microphone. Please check your permissions."
        );
        return;
      }

      const microphoneStream = audioContext.createMediaStreamSource(microphone);
      microphoneStream.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const averageVolume =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedVolume = Math.min(1, averageVolume / 256);
        setVolume(normalizedVolume);
      };

      const volumeInterval = setInterval(updateVolume, 100);

      recognitionRef.current = recognition;
      recognition.start();

      recognition.onend = () => {
        clearInterval(volumeInterval);
        microphone
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      };
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Failed to start speech recognition.");
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsMicActive(false);
    setVolume(0);
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => () => stopSpeechRecognition(), []);

  const toggleMic = () => {
    if (isMicActive) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const renderContent = () => {
    if (!userAddress) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-center text-gray-500">Please connect your wallet to start chatting with your agents.</p>
        </div>
      );
    }

    if (agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-center text-gray-500">No agents found. Create your first agent to get started!</p>
        </div>
      );
    }

    return (
      <div
        className="flex-1 overflow-y-auto mt-4 space-y-4 px-2"
        ref={chatWindowRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className="flex space-x-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm"
          >
            <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {message.role === "user" ? user?.username : selectedAgent?.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {message.timestamp}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
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
        className="w-[300px] sm:w-[400px] h-full flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Choose an AI Agent</SheetTitle>
        </SheetHeader>
        <AgentSelector
          agents={agents}
          selectedAgent={selectedAgent ?? { id: "", name: "Create your first agent to get started" }}
          onAgentChange={handleAgentChange}
        />
        {renderContent()}
        <div className="sticky bottom-4 left-0 right-0 flex justify-center">
        <Button
  size="lg"
  className={`rounded-full px-6 py-6 text-sm font-medium shadow-lg text-white transition-all duration-300 ease-in-out ${
    isMicActive
      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
      : "bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
    }`}
      onClick={toggleMic}
      disabled={isLoading || !userAddress} // Disable if loading or not connected
    >
    <div className="flex items-center space-x-2">
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : isMicActive ? (
          <motion.div
            key="voice-wave"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VoiceWave isActive={false} />
          </motion.div>
        ) : (
          <motion.div
            key="mic-icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Mic className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
      <span>
        {isLoading
          ? "Initializing..."
          : isMicActive
          ? ""
          : "Click to turn on Microphone"}
      </span>
    </div>
    </Button>

        </div>
      </SheetContent>
    </Sheet>
  );
}
