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
  useNodes,
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
  // ArrowUpRight,
  // PartyPopper,
  Check,
  Copy,
  // Link,
  Loader2,
  X,
  Coins,
  ExternalLink,
  Key,
  Wallet,
  Zap,
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Slider } from "@/components/ui/slider";
import Confetti from "react-confetti";
import {
  createSolanaNode,
  // SolanaNodeData,
  solanaNodeTypes,
  // TokenDeployNode,
} from "./nodes/solana-nodes";
import Image from 'next/image';
import { useDynamicContext, getAuthToken } from "@dynamic-labs/sdk-react-core";
import { toast } from "sonner";
import PumpFunIcon from "../pumfun-icon";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { 
      label: "🤖 My AI Agent",
      // description: "Starter agent with basic capabilities"
    },
    position: { x: 250, y: 25 },
    className: "bg-blue-100 dark:bg-blue-900",
    deletable: false
  },
  {
    id: "2",
    type: "tokenDeploy",
    data: {
      label: "💰 Deploy Token",
      tokenName: "AGENT-TOKEN",
      tokenSymbol: "AGT",
      supply: "1000000",
      decimals: "6",
      // description: "Initial token deployment for agent economy"
    },
    position: { x: 250, y: 150 },
  },
  {
    id: "3",
    type: "raydium",
    data: {
      label: "🌊 Raydium Pool Create",
      // description: "Create a new liquidity pool on Raydium"
    },
    position: { x: 250, y: 600 },
  },
  {
    id: "4",
    type: "output",
    data: { 
      label: "🚀 Launch Ready!",
      // description: "Agent deployment configuration complete"
    },
    position: { x: 250, y: 1200 },
    className: "bg-blue-100 dark:bg-blue-900",
    deletable: false
  },
];

const initialEdges: any[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true },
];

interface AgentDetails {
  postExamples: string[];
  messageExamples: any;
  name: string;
  description: string;
  image: string;
  lore?: string;
  adjectives?: string[];
  bio?: string[];
  style?: {
    all?: string[];
    chat?: string[];
    post?: string[];
  };
  topics?: string[];
  knowledge?: string[];
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
    postExamples: [],
    messageExamples: [],
    name: "",
    description: "",
    image: "",
    bio: [],
    lore: "",
    adjectives: [],
    style: { all: [], chat: [], post: [] },
    topics: [],
    knowledge: [],
  } as AgentDetails);
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
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  // List field states
  const [bioInput, setBioInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [loreInput, setLoreInput] = useState('');
  const [styleAllInput, setStyleAllInput] = useState('');
  const [styleChatInput, setStyleChatInput] = useState('');
  const [stylePostInput, setStylePostInput] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [knowledgeInput, setKnowledgeInput] = useState('');
  const [adjectivesInput, setAdjectivesInput] = useState('');
  const [postExamplesInput, setPostExamplesInput] = useState('');
  const [messageExamplesInput, setMessageExamplesInput] = useState('');

  const { user, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const nodes = useNodes();

  const uploadToIPFS = async (file: File) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const imageUrl = URL.createObjectURL(file);
      setAgentDetails(prev => ({ ...prev, image: imageUrl }));
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

  const createFieldSection = (
    label: string,
    state: string[],
    input: string,
    setInput: (value: string) => void,
    setState: (value: string[]) => void,
    placeholder?: string
  ) => (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {state.length} items added
        </span>
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              setState([...state, input.trim()]);
              setInput('');
            }
          }}
        />
        <Button
          size="sm"
          onClick={() => {
            if (input.trim()) {
              setState([...state, input.trim()]);
              setInput('');
            }
          }}
          disabled={!input.trim()}
        >
          Add
        </Button>
      </div>
      {state.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {state.map((item, index) => (
            <div
              key={index}
              className="px-2 py-1 bg-background rounded-md text-sm flex items-center gap-2"
            >
              <span>- {item}</span>
              <button
                type="button"
                onClick={() => setState(state.filter((_, i) => i !== index))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleDialogSubmit = async () => {
    if (!agentDetails.name || !primaryWallet?.address) return;
  
    setLoading(true);
    try {
      const token = getAuthToken();
      const agentResponse = await fetch("/api/eliza", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...agentDetails,
          walletAddress: primaryWallet.address,
          nodes: nodes,
          messageExamples: agentDetails.messageExamples.map((example: string) => ({
            user: "{{user1}}",
            content: { text: example }
          })),
        }),
      });
  
      if (!agentResponse.ok) {
        throw new Error('Agent creation failed');
      }
  
      const agentData = await agentResponse.json();
      setAgentData(agentData);
  
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
  
        if (!tokenResponse.ok) {
          throw new Error('Token deployment failed');
        }
  
        const tokenData = await tokenResponse.json();
        setTokenData(tokenData);
      }
  
      setDeploymentSuccess(true);
      setConfirmationOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Deployment failed", error);
      toast.error("Deployment failed. Please try again.");
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

      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className="absolute w-64 h-1 bg-gray-200 rounded-full">
                <div
                  className={`h-full bg-blue-500 rounded-full transition-all duration-300 ${
                    step === 2 ? "w-full" : "w-1/2"
                  }`}
                />
              </div>
              <div className="flex justify-between relative z-10 w-64">
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
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {step === 1 ? (
            <div className="space-y-6 pb-4">
              <div className="grid gap-4 md:grid-cols-[140px_1fr] items-start">
                <div className="space-y-2">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 mx-auto border-2 border-dashed border-gray-300">
                      <AvatarImage src={previewUrl ?? undefined} />
                      <AvatarFallback className="bg-muted">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="image-upload"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50 rounded-full"
                    >
                      <span className="text-white text-sm text-center px-2">
                        {previewUrl ? 'Change' : 'Upload'} Image
                      </span>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </Label>
                  </div>
                  {loading && (
                    <div className="text-center text-sm text-muted-foreground">
                      Uploading image...
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name *</Label>
                    <Input
                      id="name"
                      value={agentDetails.name}
                      onChange={(e) => setAgentDetails({ ...agentDetails, name: e.target.value })}
                      placeholder="Enter agent name"
                      className="h-12 text-lg"
                    />
                  </div>

                  {createFieldSection(
                    "Description Points",
                    agentDetails.description?.split('\n').filter(Boolean) ?? [],
                    descriptionInput,
                    setDescriptionInput,
                    (items) => setAgentDetails({ ...agentDetails, description: items.join('\n') }),
                    "Add a description point (e.g., 'Expert in AI technology')"
                  )}
                </div>
              </div>

              {createFieldSection(
                "Bio Points", 
                agentDetails.bio ?? [],
                bioInput,
                setBioInput,
                (bio) => setAgentDetails({ ...agentDetails, bio }),
                "Add a bio point (e.g., 'PhD in Computer Science')"
              )}

              {createFieldSection(
                "EPIC Lore", 
                agentDetails.lore ? [agentDetails.lore] : [],
                loreInput,
                setLoreInput,
                ([lore]) => setAgentDetails({ ...agentDetails, lore: lore || "" }),
                "Add epic lore for your agent"
              )}

              <div className="p-4 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium block mb-4">
                  Style Guidelines
                </Label>
                <div className="space-y-4">
                  {createFieldSection(
                    "General Style",
                    agentDetails.style?.all ?? [],
                    styleAllInput,
                    setStyleAllInput,
                    (all) => setAgentDetails({ ...agentDetails, style: { ...agentDetails.style, all } })
                  )}
                  {createFieldSection(
                    "Chat Style",
                    agentDetails.style?.chat ?? [],
                    styleChatInput,
                    setStyleChatInput,
                    (chat) => setAgentDetails({ ...agentDetails, style: { ...agentDetails.style, chat } })
                  )}
                  {createFieldSection(
                    "Post Style",
                    agentDetails.style?.post ?? [],
                    stylePostInput,
                    setStylePostInput,
                    (post) => setAgentDetails({ ...agentDetails, style: { ...agentDetails.style, post } })
                  )}
                </div>
              </div>

              {createFieldSection(
                "Topics", 
                agentDetails.topics ?? [],
                topicsInput,
                setTopicsInput,
                (topics) => setAgentDetails({ ...agentDetails, topics })
              )}

              {createFieldSection(
                "Knowledge", 
                agentDetails.knowledge ?? [],
                knowledgeInput,
                setKnowledgeInput,
                (knowledge) => setAgentDetails({ ...agentDetails, knowledge })
              )}

              {createFieldSection(
                "Adjectives", 
                agentDetails.adjectives ?? [],
                adjectivesInput,
                setAdjectivesInput,
                (adjectives) => setAgentDetails({ ...agentDetails, adjectives })
              )}

              {createFieldSection(
                "Post Examples", 
                agentDetails.postExamples ?? [],
                postExamplesInput,
                setPostExamplesInput,
                (postExamples) => setAgentDetails({ ...agentDetails, postExamples })
              )}

              {createFieldSection(
                "Message Examples", 
                agentDetails.messageExamples ?? [],
                messageExamplesInput,
                setMessageExamplesInput,
                (messageExamples) => setAgentDetails({ ...agentDetails, messageExamples })
              )}

              <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                <input
                  type="checkbox"
                  id="createToken"
                  checked={createToken}
                  onChange={(e) => setCreateToken(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-blue-500"
                />
                <Label htmlFor="createToken" className="flex-1">
                  Create a token with this agent on Pump.fun?
                </Label>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name *</Label>
                  <Input
                    id="tokenName"
                    maxLength={25}
                    value={tokenDetails.name}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, name: e.target.value })}
                    placeholder="Enter token name"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Max 25 characters</span>
                    <span>{tokenDetails.name.length}/25</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol *</Label>
                  <Input
                    id="symbol"
                    maxLength={10}
                    value={tokenDetails.symbol}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, symbol: e.target.value })}
                    placeholder="Enter token symbol"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Max 10 characters</span>
                    <span>{tokenDetails.symbol.length}/10</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Initial Dev Buy Amount (SOL)</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Min: 0.1 SOL</span>
                      <span>Max: 10 SOL</span>
                    </div>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">X (Twitter)</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="twitter"
                      value={tokenDetails.twitter}
                      onChange={(e) => setTokenDetails({ ...tokenDetails, twitter: e.target.value })}
                      placeholder="https://twitter.com/yourhandle"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telegram"
                      value={tokenDetails.telegram}
                      onChange={(e) => setTokenDetails({ ...tokenDetails, telegram: e.target.value })}
                      placeholder="https://t.me/yourchannel"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={tokenDetails.website}
                      onChange={(e) => setTokenDetails({ ...tokenDetails, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deploying...
              </div>
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

        {deploymentSuccess && (
          <DialogContent>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={800}
              gravity={0.15}
              wind={0.02}
              className="text-blue-500"
            />

            <div className="flex flex-col items-center space-y-6">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 text-center animate-fade-in-up">
                  <span className="animate-bounce inline-block mr-2">🎉</span>
                  Success! {agentData?.name} is Live!
                </DialogTitle>
                <DialogDescription className="text-center text-muted-foreground mt-2">
                  Your AI agent is now deployed on the Solana blockchain
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 w-full">
                <div className="relative mx-auto">
                  <div className="relative w-36 h-36 mx-auto animate-pop-in">
                    <Image
                      src={agentData?.image || imageFile ? URL.createObjectURL(imageFile) : "/images/agent-placeholder.png"}
                      alt="Agent"
                      fill
                      className="rounded-full border-[3px] border-white/20 shadow-2xl"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="absolute -bottom-2 right-2 bg-green-500 p-2 rounded-full border-2 border-white shadow-md">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                {tokenData && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl space-y-3 border border-white/10 shadow-xl animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-400" />
                        <span className="font-semibold">Token Address</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(tokenData.address)
                          toast.success('Address copied!')
                        }}
                        className="border-white/20 hover:bg-white/5"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <code className="block text-sm font-mono break-all p-3 bg-black/20 rounded-lg text-green-400/90 hover:text-green-300 transition-colors">
                      {tokenData.address}
                    </code>
                    
                    <div className="pt-3 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-black/20 rounded-lg">
                        <Coins className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Initial Supply</p>
                          <p className="font-semibold">{tokenDetails.initialBuyAmount} SOL</p>
                        </div>
                      </div>
                      
                      <Button
                        asChild
                        variant="outline"
                        className="border-white/20 hover:bg-white/5 h-full"
                      >
                        <a
                          href={`https://pump.fun/coin/${tokenData.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Return to Dashboard
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">Token Address</span>
                    </div>
                    <p className="text-muted-foreground font-mono truncate">
                      {tokenData?.walletAddress}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">Pre-funded</span>
                    </div>
                    <p className="text-muted-foreground">
                      {createToken ? "0.5 SOL" : "0.2 SOL"}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="w-full">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <a
                    href={`https://pump.fun/coin/${tokenData?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <PumpFunIcon className="h-5 w-5" />
                    View on Pump.fun
                  </a>
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </DialogContent>
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
        className="react-flow flex-1 h-full relative"
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
          className="bg-gray-50 dark:bg-gray-900 animate-fade-in"
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
