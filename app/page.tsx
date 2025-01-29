"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Bot, Mic, Blocks, File } from 'lucide-react';
import { useRouter } from "next/navigation";
import { WalletDialog } from "@/components/wallet-dialog";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import SolanaIcon from "@/components/solana-icon";
import PumpFunIcon from "@/components/pumfun-icon";
import { Github } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

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
            <Image src="/andrew_smoking.gif" alt="BrokieAI Logo" width={50} height={50} />
            <span className="font-bold text-xl">BrokieAI</span>
          </div>
          <div className="flex space-x-2">
            <Button
              effect={"shineHover"}
              variant="outline"
              className="hidden md:block border-[#2683C0] text-[#2683C0] hover:bg-[#2683C0] hover:text-white"
              onClick={() => router.push('/create')}
            >
              Create Agent
            </Button>
            <WalletDialog />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center bg-[#2683C0]/10 rounded-full px-4 py-1.5 mb-8">
                <span className="text-[#2683C0] text-sm font-medium">🚀 1-CLICK DEPLOYMENT</span>
              </div>
              <motion.h1 
                className="text-2xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#2683C0] to-[#1f6a9a] text-transparent bg-clip-text"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Zapier meets AI Agents on Solana
              </motion.h1>
              <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0">
                <span className="font-semibold text-[#2683C0]">Zero Coding, Full Control</span> – 
                Turn ideas into DeFAI automated income streams on <SolanaIcon className="h-6 w-6 inline-block" /> Solana. No tech skills required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                <Button 
                  className="bg-[#2683C0] hover:bg-[#1f6a9a] text-white px-8 py-6 text-lg"
                  effect={"shineHover"}
                  onClick={() => router.push('/create')}
                >
                  Start Building Free Now →
                </Button>
                <Button 
                  className="bg-transparent border-[#2683C0] text-[#2683C0] px-8 py-6 text-lg"
                  variant={"outline"}
                  effect={"shineHover"}
                  onClick={() => router.push('https://docs.google.com/presentation/d/1YIHT_81daPjMBrGXQ1N7Lf9v0L1jQksX_vtzVS6WnvE/edit?usp=sharing')}
                >
                  See our Deck →
                </Button>
                <div className="text-center mt-4 sm:mt-0">
                  <p className="text-sm text-gray-400">Deploy your first agent in 60 seconds</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-full h-[500px] flex items-center justify-center">
                <Spline
                  scene="https://prod.spline.design/tAhlLZYFoD9Oj7n0/scene.splinecode" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-[#020817] to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8">
            Why Choose BrokieAI?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                Icon: Blocks, 
                title: "Build in 60 Seconds", 
                description: "Drag, drop, deploy - Solana's speed meets our simplicity. Go live faster than a meme coin rallies." 
              },
              { 
                Icon: Mic, 
                title: "Talk to Your AI",
                description: "Voice commands or chat to manage your agents. No more coding, just convo."
              },
              { 
                Icon: Bot, 
                title: "No-Code ≠ No Power", 
                description: "Customize your AI agent's features, strategies, and profit-sharing. Your rules, your rewards."
              },
              { 
                Icon: PumpFunIcon, 
                title: "Deploy on Pump.fun",
                description: "Instantly launch on the Solana DEX with 1-click and start monetizing your AI agents."
              },
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

      {/* Social Proof */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="max-w-2xl mx-auto">
            <p className="text-xl italic text-gray-300 mb-4">
              &quot;BrokieAI let me launch a trading bot in under a minute. It&apos;s like having a Wall Street quant on autopilot - but for Solana degens.&quot;
            </p>
            <cite className="text-[#2683C0] font-medium">– @LordMiles, DeFi Strategist</cite>
          </blockquote>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 md:py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">From Idea to Automation in 60 Seconds</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Create & Monetize AI Agents with Voice Commands</h3>
              <Card className="bg-gray-800 shadow-md">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mic className="h-5 w-5 text-[#2683C0]" />
                    <p className="text-gray-300">&quot;Buy 0.2 each week of SOL&quot;</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-[#2683C0]" />
                    <p className="text-gray-300">AI: &quot;Got it. I&apos;ll execute that strategy&quot;</p>
                  </div>
                  <Button
                    className="w-full bg-[#2683C0] hover:bg-[#1f6a9a] text-white shadow-md"
                    effect={"shineHover"}
                    onClick={() => router.push('/create')}
                  >
                    Start Earning Now
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="relative">
              <div className="aspect-video relative bg-black rounded-lg overflow-hidden shadow-md">
              <HeroVideoDialog
                videoSrc="#"
                thumbnailSrc="/preview_video.png"
                animationStyle="from-center"
              />
              </div>
            </div>
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
            Join the Future of <br />
            Automated Income Streams
          </motion.h2>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              className="bg-[#2683C0] hover:bg-[#1f6a9a] text-white px-8 py-6 text-lg"
              onClick={() => router.push('/create')}
            >
              Launch Your First Agent Now
            </Button>
          </motion.div>
        </div>
      </section>

    <footer className="border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BrokieAI. All rights reserved.</p>
          <p className="mt-2 text-sm">Build/Deploy/Monetize in <span className="text-[#2683C0]">＜1m</span></p>
          <p className="mt-2 text-sm">Made with ❤️ on <SolanaIcon className="h-6 w-6 inline-block" /> Solana during <span className="text-[#2683C0]"><a href="https://www.fundraiser.com/hackathon">fundraiser.com AI Hackathon</a></span></p>

          <div className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
              <Button
                effect={"shineHover"}
                variant="outline"
                className="flex items-center justify-center mx-auto border-gray-400 text-gray-400 hover:bg-gray-700 hover:text-white"
                onClick={() => window.open("https://github.com/Magicred-1/brokieai", "_blank")}
              >
                <Github className="h-6 w-6 mr-2" />
                GitHub
              </Button>
              <Button
                effect={"shineHover"}
                variant="outline"
                className="flex items-center justify-center mx-auto border-gray-400 text-gray-400 hover:bg-gray-700 hover:text-white"
                onClick={() => window.open("https://docs.google.com/presentation/d/1YIHT_81daPjMBrGXQ1N7Lf9v0L1jQksX_vtzVS6WnvE/edit?usp=sharing", "_blank")}
              >
                <File className="h-6 w-6 mr-2" />
                Pitch Deck
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>

    </motion.div>
  )
}
