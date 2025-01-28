/* eslint-disable @typescript-eslint/no-explicit-any */

import { useDynamicContext, getAuthToken } from "@dynamic-labs/sdk-react-core";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import { Slider } from "@radix-ui/react-slider";
import { X, Rocket, Upload, Twitter, LinkIcon, Loader2, Check, Wallet, Copy, Coins, ExternalLink, Key, Zap } from "lucide-react";
import { useState } from "react";
import Confetti from "react-confetti";
import Image from "next/image";
import { toast } from "sonner";
import SolanaIcon from "./solana-icon";
import { Button } from "./ui/button";
import { DialogHeader, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";

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
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
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
          messageExamples: agentDetails.messageExamples.map((example: string) => [{
            user: "{{user1}}",
            content: { text: example }
          }])
        }),
      });
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
        const tokenData = await tokenResponse.json();
        setTokenData(tokenData);
      }

      setDeploymentSuccess(true);
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
          <DialogContent className="relative overflow-hidden">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={800}
              gravity={0.15}
              wind={0.02}
              className="absolute inset-0 z-0"
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
                      src={agentData?.image || "/default-agent-image.png"}
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
                          View on Pump.fun
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
                    <Rocket className="h-5 w-5" />
                    Launch Dashboard
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