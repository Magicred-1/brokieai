/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArrowRight, ArrowLeft, Rocket, Upload } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import SolanaIcon from '../solana-icon'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Button } from '../ui/button'
import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: '🤖 My AI Agent' },
    position: { x: 250, y: 25 },
    className: 'text-gray-800 bg-white dark:text-gray-100 dark:bg-gray-800',
  },
]

const initialEdges: any[] = []

const toolboxCategories = [
  {
    name: (
      <div className="flex items-center space-x-2">
        <SolanaIcon className='w-5 h-5' />
        <span>Solana</span>
      </div>
    ),
    categories: [
      {
        name: "Token Management",
        items: [
          { id: 'tool-2', label: '💎 Deploy SPL Tokens' },
          { id: 'tool-3', label: '📤 Transfer Assets' },
          { id: 'tool-4', label: '💰 Check Balances' },
          { id: 'tool-5', label: '🔒 Stake SOL' },
        ]
      },
      {
        name: "NFT Operations",
        items: [
          { id: 'tool-6', label: '🎯 ZK Compressed Airdrop' },
          { id: 'tool-7', label: '🎨 Create NFT Collection' },
          { id: 'tool-8', label: '🏷️ Mint and List NFTs' },
          { id: 'tool-9', label: '💫 List NFT for Sale' },
          { id: 'tool-10', label: '📝 Manage NFT Metadata' },
          { id: 'tool-11', label: '👑 Configure Royalties' },
        ]
      },
      {
        name: "DeFi & Trading",
        items: [
          { id: 'tool-12', label: '🔄 Jupiter Token Swap' },
          { id: 'tool-13', label: '🌊 Raydium Pool Create' },
          { id: 'tool-14', label: '🌀 Orca Whirlpool Trade' },
          { id: 'tool-15', label: '📊 Manifest Limit Orders' },
          { id: 'tool-16', label: '📈 Pyth Price Oracle' },
          { id: 'tool-17', label: '📑 Drift Trading Tools' },
        ]
      },
      {
        name: "Utility & Infrastructure",
        items: [
          { id: 'tool-18', label: '⚒️ Gib Work Tasks' },
          { id: 'tool-19', label: '🔍 SNS Domain Tools' },
          { id: 'tool-20', label: '⚡ Solayer Staking' },
        ]
      }
    ]
  }
]

interface ToolboxCategory {
  name: React.ReactNode;
  categories: {
    name: string;
    items: { id: string; label: string }[];
  }[];
}

function Toolbox({ isVisible, toggleVisibility, toolboxCategories } : { isVisible: boolean, toggleVisibility: () => void, toolboxCategories: ToolboxCategory[] }) {
  return (
    <div
      className={`transition-width duration-300 ease-in-out h-full overflow-y-auto border-r border-gray-300 dark:border-gray-700 ${
        isVisible ? 'w-72 p-4' : 'w-0 p-0'
      }`}
    >
      <button
        onClick={toggleVisibility}
        className={`absolute top-1/2 -translate-y-1/2 p-2 bg-gray-300 dark:bg-gray-700 rounded shadow-md cursor-pointer z-10 group ${
          isVisible ? 'left-72' : 'left-0'
        }`}
      >
        {isVisible ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
        <span className="absolute top-1/2 left-full ml-2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isVisible ? 'Close Toolbox' : 'Open Toolbox'}
        </span>
      </button>

      {isVisible && (
        <>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Components</h4>
          {toolboxCategories.map((parentCategory, parentIndex) => (
            <div key={parentIndex}>
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                {parentCategory.name}
              </h4>
              <Accordion type="single" collapsible className="w-full">
                {parentCategory.categories.map((category, index) => (
                  <AccordionItem key={index} value={`item-${parentIndex}-${index}`}>
                    <AccordionTrigger className="text-md font-medium text-gray-700 dark:text-gray-300">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-2">
                        {category.items.map((node) => (
                          <div
                            key={node.id}
                            onDragStart={(event) => event.dataTransfer.setData('application/reactflow', node.id)}
                            draggable
                            className="p-2 my-2 border border-gray-300 dark:border-gray-700 rounded cursor-grab text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                          >
                            {node.label}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </>
      )}
    </div>
  )
}


const DeployDialog = () => {
  const [agentDetails, setAgentDetails] = useState({ name: "", description: "", image: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { user, primaryWallet, setShowAuthFlow } = useDynamicContext()

  const uploadToIPFS = async (file: File) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const imageUrl = URL.createObjectURL(file)
      setImageUrl(imageUrl)
      setAgentDetails((prevState) => ({ ...prevState, image: imageUrl }))
    } catch (error) {
      console.error("Image upload failed", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      uploadToIPFS(file)
    }
  }

  const handleDialogSubmit = () => {
    console.log("Agent Details:", agentDetails)
    // Further deployment logic can go here
  }

  if (!user || !primaryWallet) {
    return (
      <Button onClick={() => setShowAuthFlow(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
        Sign In to Deploy
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white" effect={"shineHover"}>
          <Rocket className="h-4 w-4" />
          Deploy Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Agent Details</DialogTitle>
          <DialogDescription>Provide information about your agent to deploy it.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || undefined} alt="Agent Preview" />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1 text-xs hover:bg-secondary/80">
                  <Upload className="h-3 w-3" />
                  <span>Upload</span>
                </div>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={agentDetails.name}
                onChange={(e) => setAgentDetails({ ...agentDetails, name: e.target.value })}
                placeholder="Enter agent name"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={agentDetails.description}
              onChange={(e) => setAgentDetails({ ...agentDetails, description: e.target.value })}
              placeholder="Describe your agent's capabilities"
              className="h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleDialogSubmit} disabled={loading}>
            {loading ? "Uploading..." : "Deploy Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MyReactFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [isToolboxVisible, setIsToolboxVisible] = useState(true)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault()
      const reactFlowWrapper = event.target.closest('.react-flow')
      const reactFlowBounds = reactFlowWrapper.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode = {
        id: `${type}-${+new Date()}`,
        type: 'default',
        data: { label: toolboxCategories.flatMap(category => category.categories.flatMap(subCategory => subCategory.items)).find((node) => node.id === type)?.label ?? 'Default Label' },
        position,
        className: 'text-gray-800 bg-white dark:text-gray-100 dark:bg-gray-800',
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes]
  )

  const onDragOver = useCallback((event: any) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const toggleToolboxVisibility = () => {
    setIsToolboxVisible((prev) => !prev)
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-[90vh]">
        <Toolbox isVisible={isToolboxVisible} toggleVisibility={toggleToolboxVisibility} toolboxCategories={toolboxCategories} />
        <div
          className="react-flow flex-1 h-full relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="absolute top-4 right-4 z-10">
            <DeployDialog />
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            colorMode='dark'
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Background gap={12} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  )
}
