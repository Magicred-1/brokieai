"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Sparkles, Bot, Mic, Wallet, Blocks, Cpu } from 'lucide-react'
import { useRouter } from "next/navigation";
import { WalletDialog } from "@/components/wallet-dialog";
import { useState } from "react";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import SolanaIcon from "@/components/solana-icon";


export default function LandingPage() {
  const router = useRouter()

  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <motion.div 
      className="min-h-screen bg-[#020817] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/andrew_smoking.gif" alt="BrookieAI Logo" width={50} height={50} />
            <span className="font-bold text-xl">BrookieAI</span>
          </div>
          <div className="flex space-x-2">
            <Button
              effect={"shineHover"}
              variant="outline"
              className="hidden md:block border-[#2683C0] text-[#2683C0] hover:bg-[#2683C0] hover:text-white"
              onClick={() => {
                router.push('/create');
              }}
            >
              Create Agent
            </Button>
            <WalletDialog />
          </div>
        </div>
      </header>


      {/* Hero Section */}
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center bg-[#2683C0]/10 rounded-full px-4 py-1.5 mb-8">
                <span className="text-[#2683C0] text-sm font-medium">🎙️ NO-CODE AI AGENTS</span>
              </div>
              <motion.h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#2683C0] to-[#1f6a9a] text-transparent bg-clip-text"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Create Voice-Enabled
                <br />
                Solana AI Agents
              </motion.h1>
              <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0">
                Build, deploy, and monetize AI agents on <SolanaIcon className="h-6 w-6 inline-block" /> Solana without writing code.
                Just speak, configure, and launch your autonomous AI agents.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button className="bg-[#2683C0] hover:bg-[#1f6a9a] text-white px-8 py-6 text-lg"
                  effect={"shineHover"}
                  onClick={
                    () => {
                      router.push('/create')
                    }
                  }
                >
                  Start Building
                </Button>
                <Button
                  variant="outline"
                  className="border-[#2683C0] text-[#2683C0] hover:bg-[#2683C0] hover:text-white px-8 py-6 text-lg"
                  onClick={() => setIsVideoOpen(true)} // Correctly toggle the dialog state
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              {/* Placeholder for Spline scene */}
              <div className="w-full h-[500px] flex items-center justify-center">
              <Spline
                  scene="https://prod.spline.design/tAhlLZYFoD9Oj7n0/scene.splinecode" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HeroVideoDialog */}
      <HeroVideoDialog
        videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
        thumbnailSrc="/demo-thumbnail.jpg"
        animationStyle="from-center"
        className="hidden" // Use your custom styling if needed
        isOpen={isVideoOpen} // Correctly connect state
        onClose={() => setIsVideoOpen(false)} // Update state to close dialog
      />

      {/* Features Grid */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-[#020817] to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12">
            Create AI Agents with No-Code 🚀
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { Icon: Blocks, title: "No-Code Interface", description: "Create AI agents without writing a single line of code. Just speak and configure." },
              { Icon: Mic, title: "Voice Commands", description: "Configure your AI agents using natural language voice commands. No coding required." },
              { Icon: Wallet, title: "Solana Integration", description: "Deploy agents directly to Solana blockchain with built-in wallet and token management." },
              { Icon: Cpu, title: "AI Capabilities", description: "Leverage advanced AI models for natural language processing and autonomous decision-making." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 bg-[#2683C0]/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.Icon className="h-6 w-6 text-[#2683C0]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 md:py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Create an Agent in Minutes</h2>
              <Card className="bg-gray-800">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mic className="h-5 w-5 text-[#2683C0]" />
                    <p className="text-gray-300">&quot;Create a trading bot that monitors SOL price&quot;</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-[#2683C0]" />
                    <p className="text-gray-300">Configuring trading parameters...</p>
                  </div>
                  <Button className="w-full bg-[#2683C0] hover:bg-[#1f6a9a] text-white"
                    effect={"shineHover"}
                    onClick={
                      () => {
                        router.push('/create')
                      }
                    }
                  >
                    Deploy Agent
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gray-800">
              <CardContent className="p-6">
                <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg"
                    alt="AI Agent Interface Demo"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Agents" },
              { value: "$2M+", label: "Total Volume" },
              { value: "50ms", label: "Response Time" },
              { value: "24/7", label: "Uptime" },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-3xl md:text-4xl font-bold text-[#2683C0]">{stat.value}</h3>
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-[#020817] to-[#041325]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { Icon: Mic, title: "1. Speak", text: "Describe your agent's functionality using natural language voice commands" },
              { Icon: Blocks, title: "2. Configure", text: "Fine-tune parameters and set up integrations through our intuitive interface" },
              { Icon: Sparkles, title: "3. Launch", text: "Deploy your agent to Solana and start monitoring its performance" },
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="h-16 w-16 rounded-full bg-[#2683C0]/10 flex items-center justify-center mx-auto mb-6">
                  <step.Icon className="h-8 w-8 text-[#2683C0]" />
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-t from-[#2683C0]/20 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Ready to Build Your
            <br />
            AI Agent?
          </motion.h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Join the future of decentralized AI. Create your first voice-enabled
            Solana AI agent today and revolutionize your workflow.
          </p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button className="bg-[#2683C0] hover:bg-[#1f6a9a] text-white px-8 py-6 text-lg"
              onClick={
                () => {
                  router.push('/create')
                }
              }
            >
              Start Building For Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BrookieAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

