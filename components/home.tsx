'use client'

import { useState } from 'react'
import Disclaimer from '@/components/disclaimer'
import Footer from '@/components/footer'
import { Header } from '@/components/header'
import ImprovedReactFlow from '@/components/reactflow/react-flow-sample'

export default function Home() {
    const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false)

    const toggleRightDrawer = () => setIsRightDrawerOpen(!isRightDrawerOpen)

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
            <Header isRightDrawerOpen={isRightDrawerOpen} onToggleRightDrawer={toggleRightDrawer} />
            {/* React Flow component here */}
            <ImprovedReactFlow />
            <Disclaimer />
            <Footer />
        </div>
    )
}

