"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ArrowRight, Home, Book, Zap, Coins, BarChart } from 'lucide-react'
import { motion } from 'framer-motion'

const menuItems = [
  { id: 1, title: "Home", icon: Home },
  { id: 2, title: "Learn", icon: Book },
  { id: 3, title: "Explore", icon: Zap },
  { id: 4, title: "Tokenomics", icon: Coins },
  { id: 5, title: "Analytics", icon: BarChart },
]

export function MenuDrawer() {
  return (
      <Sheet>
        <SheetTrigger asChild>
          <motion.div
            className="fixed left-0 top-1/2 -translate-y-1/2 z-50 overflow-hidden"
            initial={{ width: '48px' }}
            whileHover={{ width: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="ghost" 
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:from-blue-600 hover:to-teal-500 transition-all duration-300 rounded-r-full pl-3 pr-4 h-12"
            >
              <ArrowRight className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">Menu</span>
            </Button>
          </motion.div>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>Open Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-8 space-y-6">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-left text-lg"
              >
                <item.icon className="mr-4 h-5 w-5" />
                {item.title}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
  )
}
