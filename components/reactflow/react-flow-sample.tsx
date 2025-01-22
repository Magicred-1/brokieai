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
  MiniMap,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArrowRight, ArrowLeft, Rocket, Upload, TwitterIcon } from 'lucide-react'
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import SolanaIcon from '../solana-icon'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '../ui/textarea'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Twitter, LinkIcon } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import Confetti from 'react-confetti'

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

interface AgentDetails {
  name: string
  description: string
  image: string
  lore?: string // Add the 'lore' property
}

interface TokenDetails {
  name: string
  symbol: string
  initialBuyAmount: number
  twitter: string
  telegram: string
  website: string
}

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
  },
  {
    name: (
      <div className="flex items-center space-x-2">
        <span>Social Media Integration</span>
      </div>
    ),
    categories: [
      {
        name: "Social Platforms",
        items: [
          { id: 'tool-21', label: <><TwitterIcon className="w-4 h-4 mr-2" />Twitter</> },
          { id: 'tool-22', label: <><FaDiscord className="w-4 h-4 mr-2" />Discord</> },
          { id: 'tool-23', label: <><FaTelegram className="w-4 h-4 mr-2" />Telegram</> },
        ]
      }
    ]
  }
]

interface ToolboxCategory {
  name: React.ReactNode;
  categories: {
    name: string;
    items: { id: string; label: React.ReactNode }[];
  }[];
}

function Toolbox({
  isVisible,
  toggleVisibility,
  toolboxCategories,
}: {
  isVisible: boolean
  toggleVisibility: () => void
  toolboxCategories: ToolboxCategory[]
}) {
  return (
    <div
      className={`transition-all duration-300 ease-in-out h-full overflow-y-auto border-r border-gray-300 dark:border-gray-700 bg-blue-100 dark:bg-gray-900 ${
        isVisible ? "w-80 p-6" : "w-0 p-0"
      }`}
    >
      <button
        onClick={toggleVisibility}
        className={`absolute top-1/2 -translate-y-1/2 p-2 bg-[#0061DF] dark:bg-[#0061DF] rounded-full shadow-md cursor-pointer z-10 group ${
          isVisible ? "left-80" : "left-0"
        }`}
        aria-label={isVisible ? "Close Toolbox" : "Open Toolbox"}
      >
        {isVisible ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
        <span className="sr-only">{isVisible ? "Close Toolbox" : "Open Toolbox"}</span>
        <span className="absolute top-1/2 left-full ml-3 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isVisible ? "Close Toolbox" : "Open Toolbox"}
        </span>
      </button>

      {isVisible && (
        <>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Components</h4>
          {toolboxCategories.map((parentCategory, parentIndex) => (
            <div key={parentIndex} className="mb-8">
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">{parentCategory.name}</h4>
              <Accordion type="single" collapsible className="w-full">
                {parentCategory.categories.map((category, index) => (
                  <AccordionItem key={index} value={`item-${parentIndex}-${index}`}>
                    <AccordionTrigger className="text-md font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-2 space-y-3">
                        {category.items.map((node: { id: string; label: React.ReactNode | string }) => (
                          <div
                            key={node.id}
                            onDragStart={(event) => event.dataTransfer.setData("application/reactflow", node.id)}
                            draggable
                            className={`p-3 text-lg font-medium border border-gray-300 dark:border-gray-700 rounded-md cursor-grab text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200 ${
                              category.name === "Social Platforms" ? "opacity-50 cursor-not-allowed" : ""
                            }`}
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

export const DeployDialog = () => {
  const [step, setStep] = useState(1)
  const [agentDetails, setAgentDetails] = useState<AgentDetails>({ name: "", description: "", image: "", lore: "" })
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>({
    name: "",
    symbol: "",
    initialBuyAmount: 0.1,
    twitter: "",
    telegram: "",
    website: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [createToken, setCreateToken] = useState<boolean>(false) // State for token creation checkbox
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [agentData, setAgentData] = useState<any | null>(null) // To store agent data (name, image)
  const [tokenData, setTokenData] = useState<any | null>(null) // To store token data (address)

  const { user, primaryWallet, setShowAuthFlow } = useDynamicContext()

  const uploadToIPFS = async (file: File) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const imageUrl = URL.createObjectURL(file)
      // Need to implement IPFS upload here or not based on if we use Pump.fun for the deployment
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

  const handleDialogSubmit = async () => {
    if (!agentDetails.name || !primaryWallet?.address) {
      return
    }

    setLoading(true)

    try {
      // Step 1: Deploy Agent
      const agentResponse = await fetch("/api/eliza", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: agentDetails.name,
          description: agentDetails.description,
          walletAddress: primaryWallet.address,
        }),
      })

      const agentData = await agentResponse.json()
      console.log("Agent deployed:", agentData)
      setAgentData(agentData) // Store agent data for later use

      // Step 2: Create Token (if the user has selected the checkbox)
      if (createToken) {
        const tokenResponse = await fetch("/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...tokenDetails,
            agentId: agentData.id, // Assuming the agent API returns an ID
            walletAddress: primaryWallet.address,
          }),
        })

        const tokenData = await tokenResponse.json()
        console.log("Token created:", tokenData)
        setTokenData(tokenData) // Store token data for later use
      } else {
        setTokenData(null);
      }

      // Open the confirmation dialog after successful deployment
      setConfirmationOpen(true)
    } catch (error) {
      console.error("Deployment failed", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !primaryWallet) {
    return (
      <Button onClick={() => setShowAuthFlow(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
        Sign In to Deploy
      </Button>
    )
  }

  return (
    <Dialog open={confirmationOpen} onOpenChange={(open) => setConfirmationOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white" effect={"shineHover"}>
          <Rocket className="h-4 w-4 mr-2" />
          Deploy Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Agent Details" : "Token Details"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Provide information about your agent to deploy it."
              : "Create a token for your agent (optional)"}
          </DialogDescription>
        </DialogHeader>
        {step === 1 ? (
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl ?? undefined} alt="Agent Preview" />
                </Avatar>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1 text-xs hover:bg-secondary/80">
                    <Upload className="h-3 w-3" />
                    <span>Upload</span>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
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
                placeholder={
                  "- What does your agent do?\n- What are its capabilities?\n- How can users interact with it? \n Use a \" - \" for each point."
                }
                className="h-24"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lore">His EPIC Lore (Optional)</Label>
              <Textarea
                id="lore"
                value={agentDetails.lore}
                onChange={(e) => setAgentDetails({ ...agentDetails, lore: e.target.value })}
                placeholder={
                  "- What is his backstory?\n- What are his powers?\n- What is his purpose?"
                }
                className="h-24"
              />
            </div>

            {/* New Checkbox for Token Creation */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createToken"
                checked={createToken}
                onChange={(e) => setCreateToken(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="createToken">Create a token with this agent?</Label>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  id="tokenName"
                  maxLength={25}
                  value={tokenDetails.name}
                  onChange={(e) => setTokenDetails({ ...tokenDetails, name: e.target.value })}
                  placeholder="Enter token name"
                />
                <div className="text-right text-sm text-gray-500">{tokenDetails.name.length}/25</div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="symbol">Token Symbol</Label>
                <Input
                  id="symbol"
                  maxLength={10}
                  value={tokenDetails.symbol}
                  onChange={(e) => setTokenDetails({ ...tokenDetails, symbol: e.target.value })}
                  placeholder="Enter token symbol"
                />
                <div className="text-right text-sm text-gray-500">{tokenDetails.symbol.length}/10</div>
              </div>

              <div className="grid gap-2">
                <Label>Initial Dev Buy Amount (SOL)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[tokenDetails.initialBuyAmount]}
                    onValueChange={(value) => setTokenDetails({ ...tokenDetails, initialBuyAmount: value[0] })}
                    min={0.1}
                    max={10}
                    step={0.1}
                  />
                  <Input
                    type="number"
                    value={tokenDetails.initialBuyAmount}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, initialBuyAmount: parseFloat(e.target.value) })}
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="w-20"
                  >
                    <SolanaIcon className="h-6 w-6" />
                  </Input>
                  <SolanaIcon className="h-6 w-6" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="twitter">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="twitter"
                    value={tokenDetails.twitter}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, twitter: e.target.value })}
                    placeholder="Enter X link (Optional)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Telegram</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="telegram"
                    value={tokenDetails.telegram}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, website: e.target.value })}
                    placeholder="Enter website (Optional)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={tokenDetails.website}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, website: e.target.value })}
                    placeholder="Enter website (Optional)"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="mr-auto">
              Back
            </Button>
          )}
          <Button
            type="submit"
            effect={"shineHover"}
            onClick={step === 1 ? () => setStep(2) : handleDialogSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={loading}
          >
            {loading ? "Deploying..." : (
              step === 1 ? "Next" : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  {createToken ? "Deploy Agent 0.5 SOL" : "Deploy Agent 0.2 SOL"}
                  {!createToken && <SolanaIcon className="h-4 w-4 mr-2" />}
                </>
              )
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog */}
      {confirmationOpen && (
        <Dialog open={confirmationOpen} onOpenChange={(open) => setConfirmationOpen(open)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Deployment Successful!</DialogTitle>
            </DialogHeader>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
            />
            <div className="space-y-4 text-center">
              <img src={agentData?.image || "/default-agent-image.png"} alt="Agent" className="w-32 h-32 mx-auto rounded-full" />
              <p className="text-xl font-bold">{agentData?.name}</p>
              {tokenData && (
                <div>
                  <p className="text-md">Token Created:</p>
                  <p className="text-lg font-semibold">{tokenData?.address}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="default" onClick={() => setConfirmationOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}

export default function ImprovedReactFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isToolboxVisible, setIsToolboxVisible] = useState(true)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const reactFlowWrapper = event.currentTarget
      const reactFlowBounds = reactFlowWrapper.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")
      if (!type) return

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode = {
        id: `${type}-${+new Date()}`,
        type: "default",
        data: {
          label:
            toolboxCategories
              .flatMap((category) => category.categories.flatMap((subCategory) => subCategory.items.map((item) => ({ ...item, label: typeof item.label === 'string' ? item.label : '' }))))
              .find((node) => node.id === type)?.label ?? "Default Label",
        },
        position,
        className:
          "text-gray-800 bg-white dark:text-gray-100 dark:bg-gray-800 shadow-md rounded-lg p-4 border border-gray-200 dark:border-gray-700",
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes, toolboxCategories],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const toggleToolboxVisibility = () => {
    setIsToolboxVisible((prev) => !prev)
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        <Toolbox
          isVisible={isToolboxVisible}
          toggleVisibility={toggleToolboxVisibility}
          toolboxCategories={toolboxCategories}
        />
        <div className="react-flow flex-1 h-200vh relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Background gap={12} size={1} />
            <Controls className="bg-white text-black dark:bg-gray-800 shadow-md rounded-lg" />
            <MiniMap className="bg-white dark:bg-gray-800 shadow-md rounded-lg" />
            <Panel position="top-right" className="space-x-2">
              <DeployDialog />
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  )
}
