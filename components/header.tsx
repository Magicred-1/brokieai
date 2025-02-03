"use client"

import Image from 'next/image'
// import { MenuDrawer } from './menu-drawer'
import { HowItWorksDialog } from './how-it-works-dialog'
import { BuyCryptoDialog } from './buy-crypto-dialog'
import { WalletDialog } from './wallet-dialog'
import { MobileMenu } from './mobile-menu'
// import { CreateAgentDialog } from './create-agent-dialog'
import { ChatDrawer } from './chat-drawer'
import Link from 'next/link'
import { FaTelegram, FaTwitter } from 'react-icons/fa'

interface HeaderProps {
  readonly isRightDrawerOpen: boolean;
  readonly onToggleRightDrawer: () => void;
  
}

export function Header({ isRightDrawerOpen, onToggleRightDrawer }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between transition-colors duration-300">
      <div className='flex items-center space-x-2'>
        <div className="flex items-center space-x-2">
        <Link href="/" className='flex items-center space-x-2'>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <Image src="/andrew_smoking.gif" alt="BrookieAI Icon" width={60} height={60} />
          </div>
            <h1 className="text-xl font-bold">BrokieAI</h1>
        </Link>
        </div>
        {/* <div className="flex items-center space-x-2">
          <CreateAgentDialog />
        </div> */}
      </div>
      
      <div className="hidden md:flex items-center space-x-2">
        <HowItWorksDialog />
        <BuyCryptoDialog />
        <WalletDialog />
        <a href="https://t.me/brokie_ai" target="_blank" rel="noopener noreferrer">
          <FaTelegram className="h-6 w-6 text-gray-400 hover:text-white transition" />
        </a>
        <a href="https://x.com/Brokie_AI" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="h-6 w-6 text-gray-400 hover:text-white transition" />
        </a>
      </div>
{/* 
      <MenuDrawer /> */}
      <ChatDrawer isOpen={isRightDrawerOpen} onToggle={onToggleRightDrawer} AgentName={'Adam'} />

      <MobileMenu />
    </header>
  )
}

