"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { HowItWorksDialog } from './how-it-works-dialog'
import { BuyCryptoDialog } from './buy-crypto-dialog'
import { WalletDialog } from './wallet-dialog'

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[240px] sm:w-[300px] flex flex-col">
        <nav className="flex flex-col space-y-4 flex-grow">
          <HowItWorksDialog />
          <BuyCryptoDialog />
          <WalletDialog />
          {/* <ThemeToggle /> */}
        </nav>
        <div className="text-xs text-muted-foreground mt-auto pt-4 border-t">
          © {new Date().getFullYear()} BrookieAI. All rights reserved.
        </div>
      </SheetContent>
    </Sheet>
  )
}

