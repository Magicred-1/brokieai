"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import SolanaIcon from './solana-icon'
import CoinbasePaymentEmbed from './coinbase-embed'
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { WalletDialog } from './wallet-dialog'

export function BuyCryptoDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const { user, primaryWallet } = useDynamicContext()
    // Placeholder wallet address - in a real app, this would come from the user's connected wallet
    const walletAddress = user ? primaryWallet?.address : ""

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="glow-effect h-7 px-3 text-xs font-normal hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out shadow-sm hover:shadow-md hover:shadow-green-100/50 dark:hover:shadow-green-900/50">
            <SolanaIcon className="mr-1.5 h-3 w-3" />
            Buy Crypto
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle>Buy Crypto</DialogTitle>
            <DialogDescription>
                Purchase cryptocurrency using Coinbase.
            </DialogDescription>
            </DialogHeader>
            {
            walletAddress ? (
                <CoinbasePaymentEmbed walletAddress={walletAddress} />
            ) : (
                <>
                    <DialogDescription>
                        Connect your wallet first to buy crypto.
                    </DialogDescription>
                    <WalletDialog />
                </>
            )
            }
        </DialogContent>
        </Dialog>
    )
}

