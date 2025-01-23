/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useState } from "react";
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
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowRight,
  ArrowLeft,
  Rocket,
  Upload,
  TwitterIcon,
  Twitter,
  LinkIcon,
  ArrowUpRight,
  Wallet,
  PartyPopper,
} from "lucide-react";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import SolanaIcon from "../solana-icon";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Slider } from "@/components/ui/slider";
import Confetti from "react-confetti";
import {
  createSolanaNode,
  // SolanaNodeData,
  solanaNodeTypes,
  // TokenDeployNode,
} from "./nodes/solana-nodes";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "🤖 My AI Agent" },
    position: { x: 250, y: 25 },
    className: "text-gray-800 bg-white dark:text-gray-100 dark:bg-gray-800",
  },
];

const initialEdges: any[] = [];

interface AgentDetails {
  name: string;
  description: string;
  image: string;
  lore?: string; // Add the 'lore' property
}

interface TokenDetails {
  name: string;
  symbol: string;
  initialBuyAmount: number;
  twitter: string;
  telegram: string;
  website: string;
}

const toolboxCategories = [
  {
    name: (
      <div className="flex items-center space-x-2">
        <SolanaIcon className="w-5 h-5" />
        <span>Solana</span>
      </div>
    ),
    categories: [
      {
        name: "Token Management",
        items: [
          { id: "tool-2", label: "💎 Deploy SPL Tokens" },
          { id: "tool-3", label: "📤 Transfer Assets" },
          { id: "tool-4", label: "💰 Check Balances" },
          { id: "tool-5", label: "🔒 Stake SOL" },
        ],
      },
      {
        name: "NFT Operations",
        items: [
          { id: "tool-6", label: "🎯 ZK Compressed Airdrop" },
          { id: "tool-7", label: "🎨 Create NFT Collection" },
          { id: "tool-8", label: "🏷️ Mint and List NFTs" },
          { id: "tool-9", label: "💫 List NFT for Sale" },
          { id: "tool-10", label: "📝 Manage NFT Metadata" },
          { id: "tool-11", label: "👑 Configure Royalties" },
        ],
      },
      {
        name: "DeFi & Trading",
        items: [
          { id: "tool-12", label: "🔄 Jupiter Token Swap" },
          { id: "tool-13", label: "🌊 Raydium Pool Create" },
          { id: "tool-14", label: "🌀 Orca Whirlpool Trade" },
          { id: "tool-15", label: "📊 Manifest Limit Orders" },
          { id: "tool-16", label: "📈 Pyth Price Oracle" },
          { id: "tool-17", label: "📑 Drift Trading Tools" },
        ],
      },
      {
        name: "Utility & Infrastructure",
        items: [
          { id: "tool-18", label: "⚒️ Gib Work Tasks" },
          { id: "tool-19", label: "🔍 SNS Domain Tools" },
          { id: "tool-20", label: "⚡ Solayer Staking" },
        ],
      },
    ],
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
          {
            id: "tool-21",
            label: (
              <>
                <TwitterIcon className="w-4 h-4 mr-2" />
                Twitter
              </>
            ),
          },
          {
            id: "tool-22",
            label: (
              <>
                <FaDiscord className="w-4 h-4 mr-2" />
                Discord
              </>
            ),
          },
          {
            id: "tool-23",
            label: (
              <>
                <FaTelegram className="w-4 h-4 mr-2" />
                Telegram
              </>
            ),
          },
        ],
      },
    ],
  },
];

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
  isVisible: boolean;
  toggleVisibility: () => void;
  toolboxCategories: ToolboxCategory[];
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
        <span className="sr-only">
          {isVisible ? "Close Toolbox" : "Open Toolbox"}
        </span>
        <span className="absolute top-1/2 left-full ml-3 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isVisible ? "Close Toolbox" : "Open Toolbox"}
        </span>
      </button>

      {isVisible && (
        <>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
            Components
          </h4>
          {toolboxCategories.map((parentCategory, parentIndex) => (
            <div key={parentIndex} className="mb-8">
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {parentCategory.name}
              </h4>
              <Accordion type="single" collapsible className="w-full">
                {parentCategory.categories.map((category, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${parentIndex}-${index}`}
                  >
                    <AccordionTrigger className="text-md font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-2 space-y-3">
                        {category.items.map(
                          (node: {
                            id: string;
                            label: React.ReactNode | string;
                          }) => (
                            <div
                              key={node.id}
                              onDragStart={(event) =>
                                event.dataTransfer.setData(
                                  "application/reactflow",
                                  node.id
                                )
                              }
                              draggable
                              className={`p-3 text-lg font-medium border border-gray-300 dark:border-gray-700 rounded-md cursor-grab text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200 ${
                                category.name === "Social Platforms"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {node.label}
                            </div>
                          )
                        )}
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
  );
}

export const DeployDialog = () => {
  const [step, setStep] = useState(1);
  const [agentDetails, setAgentDetails] = useState<AgentDetails>({
    name: "",
    description: "",
    image: "",
    lore: "",
  });
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>({
    name: "",
    symbol: "",
    initialBuyAmount: 0.1,
    twitter: "",
    telegram: "",
    website: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createToken, setCreateToken] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  const { user, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const uploadToIPFS = async (file: File) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const imageUrl = URL.createObjectURL(file);
      setAgentDetails((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
      uploadToIPFS(file);
    }
  };

  const handleDialogSubmit = async () => {
    if (!agentDetails.name || !primaryWallet?.address) return;

    setLoading(true);
    try {
      // Deploy Agent
      const agentResponse = await fetch("/api/eliza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentDetails.name,
          description: agentDetails.description,
          walletAddress: primaryWallet.address,
        }),
      });
      const agentData = await agentResponse.json();
      setAgentData(agentData);

      // Create Token if selected
      if (createToken) {
        const tokenResponse = await fetch("/api/token/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...tokenDetails,
            agentId: agentData.id,
            walletAddress: primaryWallet.address,
          }),
        });
        const tokenData = await tokenResponse.json();
        setTokenData(tokenData);
      }

      setConfirmationOpen(true);
    } catch (error) {
      console.error("Deployment failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !primaryWallet) {
    return (
      <Button
        onClick={() => setShowAuthFlow(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Sign In to Deploy
      </Button>
    );
  }

  return (
    <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Rocket className="h-4 w-4 mr-2" />
          Deploy Agent
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
  <div className="mb-6">
    <div className="flex items-center justify-center">
      {/* Progress line */}
      <div className="absolute w-64 h-1 bg-gray-200 rounded-full"> {/* Increased width */}
        <div 
          className={`h-full bg-blue-500 rounded-full transition-all duration-300 ${
            step === 2 ? "w-full" : "w-1/2"
          }`}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between relative z-10 w-64"> {/* Match progress bar width */}
        {[1, 2].map((num) => (
          <div key={num} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                ${
                  step === num 
                    ? "bg-blue-500 text-white ring-4 ring-blue-200" 
                    : "bg-gray-100 text-gray-400"
                }`}
            >
              <span className="font-semibold">{num}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  
  <DialogTitle className="text-xl font-bold text-center">
    {step === 1 ? "Agent Details" : "Token Details"}
  </DialogTitle>
  
  <DialogDescription className="mt-2 text-gray-600 text-center">
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
                  <AvatarImage
                    src={previewUrl ?? undefined}
                    alt="Agent Preview"
                  />
                  <AvatarFallback>CZ</AvatarFallback>
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
                  onChange={(e) =>
                    setAgentDetails({ ...agentDetails, name: e.target.value })
                  }
                  placeholder="Enter agent name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={agentDetails.description}
                onChange={(e) =>
                  setAgentDetails({
                    ...agentDetails,
                    description: e.target.value,
                  })
                }
                placeholder={
                  '- What does your agent do?\n- What are its capabilities?\n- How can users interact with it? \n Use a " - " for each point.'
                }
                className="h-24"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lore">His EPIC Lore (Optional)</Label>
              <Textarea
                id="lore"
                value={agentDetails.lore}
                onChange={(e) =>
                  setAgentDetails({ ...agentDetails, lore: e.target.value })
                }
                placeholder={
                  "- What is his backstory?\n- What are his powers?\n- What is his purpose?"
                }
                className="h-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createToken"
                checked={createToken}
                onChange={(e) => setCreateToken(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="createToken">
                Create a token with this agent?
              </Label>
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
                  onChange={(e) =>
                    setTokenDetails({ ...tokenDetails, name: e.target.value })
                  }
                  placeholder="Enter token name"
                />
                <div className="text-right text-sm text-gray-500">
                  {tokenDetails.name.length}/25
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="symbol">Token Symbol</Label>
                <Input
                  id="symbol"
                  maxLength={10}
                  value={tokenDetails.symbol}
                  onChange={(e) =>
                    setTokenDetails({ ...tokenDetails, symbol: e.target.value })
                  }
                  placeholder="Enter token symbol"
                />
                <div className="text-right text-sm text-gray-500">
                  {tokenDetails.symbol.length}/10
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Initial Dev Buy Amount (SOL)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[tokenDetails.initialBuyAmount]}
                    onValueChange={(value) =>
                      setTokenDetails({
                        ...tokenDetails,
                        initialBuyAmount: value[0],
                      })
                    }
                    min={0.1}
                    max={10}
                    step={0.1}
                  />
                  <Input
                    type="number"
                    value={tokenDetails.initialBuyAmount}
                    onChange={(e) =>
                      setTokenDetails({
                        ...tokenDetails,
                        initialBuyAmount: parseFloat(e.target.value),
                      })
                    }
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="w-20"
                  />
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
                    onChange={(e) =>
                      setTokenDetails({
                        ...tokenDetails,
                        twitter: e.target.value,
                      })
                    }
                    placeholder="Enter X link (Optional)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telegram">Telegram</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="telegram"
                    value={tokenDetails.telegram}
                    onChange={(e) =>
                      setTokenDetails({
                        ...tokenDetails,
                        telegram: e.target.value,
                      })
                    }
                    placeholder="Enter Telegram link (Optional)"
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
                    onChange={(e) =>
                      setTokenDetails({
                        ...tokenDetails,
                        website: e.target.value,
                      })
                    }
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="mr-auto"
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            onClick={step === 1 ? () => setStep(2) : handleDialogSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={loading}
          >
            {loading ? (
              "Deploying..."
            ) : step === 1 ? (
              "Next"
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                {createToken ? "Deploy Agent 0.5 SOL" : "Deploy Agent 0.2 SOL"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog */}
      {confirmationOpen && (
        <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
          <DialogContent className="sm:max-w-[425px] relative overflow-hidden">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
              className="absolute inset-0 z-0"
            />
            
            <div className="relative z-10 space-y-6 text-center">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  🎉 Congrats! You just deployed {agentData?.name}!
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <img
                  src={agentData?.image || "/default-agent-image.png"}
                  alt="Agent"
                  className="w-32 h-32 mx-auto rounded-full border-4 border-yellow-400 shadow-lg"
                />
                
                {tokenData && (
                  <div className="bg-secondary p-4 rounded-lg space-y-2">
                    <p className="font-medium">Token Created:</p>
                    <p className="text-sm font-mono break-words text-green-400">
                      {tokenData?.address}
                    </p>
                    <Button
                      asChild
                      variant="link"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <a
                        href={`https://pump.fun/coin/${tokenData?.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1"
                      >
                        View on Pump.fun
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <SolanaIcon className="h-4 w-4" />
                      <span>Initial Supply: {tokenDetails.initialBuyAmount} SOL</span>
                    </div>
                  </div>
                )}

                <div className="bg-secondary p-4 rounded-lg">
                  <p className="font-medium">Transaction Details</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm">
                      Deployed from: {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">
                    Total cost: {createToken ? "0.5 SOL" : "0.2 SOL"}
                  </p>
                </div>
              </div>

              <DialogFooter className="sm:justify-center">
                <Button
                  variant="default"
                  onClick={() => setConfirmationOpen(false)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <PartyPopper className="mr-2 h-4 w-4" />
                  Start Using {agentData?.name}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};


type KeyValue = {
  key: string;
  value: string | number | boolean;
};

export type BlockNode = {
  id: string | number;
  keyValueList: KeyValue[];
};

// Flow.tsx component
function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isToolboxVisible, setIsToolboxVisible] = useState(true);
  const reactFlowInstance = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Handle social media platform restrictions
      const isSocialMedia = ["tool-21", "tool-22", "tool-23"].includes(type);
      if (isSocialMedia) {
        alert("Social media integrations coming soon!");
        return;
      }

      const newNode = createSolanaNode(type, position);
      if (newNode) {
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const toggleToolboxVisibility = () => setIsToolboxVisible(!isToolboxVisible);

  return (
    <div className="flex h-screen">
      <Toolbox
        isVisible={isToolboxVisible}
        toggleVisibility={toggleToolboxVisibility}
        toolboxCategories={toolboxCategories}
      />
      <div
        className="react-flow flex-1 h-[200vh] relative"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={solanaNodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background gap={12} size={1} />
          <Controls className="bg-white dark:bg-gray-800 shadow-md rounded-lg" />
          <MiniMap className="bg-white dark:bg-gray-800 shadow-md rounded-lg" />
          <Panel position="top-right" className="space-x-2">
            <DeployDialog />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

// FlowWithProvider.tsx component (main export)
export default function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
