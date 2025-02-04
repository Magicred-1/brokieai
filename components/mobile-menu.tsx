"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { HowItWorksDialog } from './how-it-works-dialog'
import { BuyCryptoDialog } from './buy-crypto-dialog'
import { WalletDialog } from './wallet-dialog'
import { FaTelegram, FaTwitter } from "react-icons/fa"

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[240px] sm:w-[300px] flex flex-col h-full">
        <nav className="flex flex-col space-y-4 flex-grow">
          <HowItWorksDialog />
          <BuyCryptoDialog />
          <WalletDialog />
          {/* <ThemeToggle /> */}
        </nav>
        <div className="mt-auto pt-4 border-t flex flex-col items-center pb-4">
          <div className="flex space-x-4 mb-2">
            <a href="https://t.me/brokie_ai" target="_blank" rel="noopener noreferrer">
              <FaTelegram className="h-6 w-6 text-gray-400 hover:text-white transition" />
            </a>
            <a href="https://x.com/Brokie_AI" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="h-6 w-6 text-gray-400 hover:text-white transition" />
            </a>
          </div>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} BrookieAI. All rights reserved.</span>
        </div>
      </SheetContent>
    </Sheet>
  )
}
