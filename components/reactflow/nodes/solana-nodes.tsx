import { Handle, Position, NodeProps, Node, NodeTypes } from "@xyflow/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import SolanaIcon from "@/components/solana-icon";
// import SolanaIcon from '@/components/solana-icon';

export interface SolanaNodeData extends Node {
  [key: string]: unknown;
}

// After (correct)
export type SolanaNode = Node<SolanaNodeData>;
export type SolanaNodeProps = NodeProps<SolanaNodeData>;

// Token Management Nodes
export const TokenDeployNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">💎</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Token Name</Label>
        <Input placeholder="Enter token name" />
      </div>
      <div className="grid gap-2">
        <Label>Token Symbol</Label>
        <Input placeholder="Enter token symbol" />
      </div>
      <div className="grid gap-2">
        <Label>Total Supply</Label>
        <Input type="number" placeholder="1000000" />
      </div>
      <Button className="w-full">Deploy Token</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const TransferNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">📤</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Recipient Address</Label>
        <Input placeholder="Enter SOL address" />
      </div>
      <div className="grid gap-2">
        <Label>Amount</Label>
        <Input type="number" placeholder="0.0" />
      </div>
      <div className="grid gap-2">
        <Label>Token</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sol">SOL</SelectItem>
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="custom">Custom Token</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const BalanceNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">💰</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Wallet Address</Label>
        <Input placeholder="Enter wallet address" />
      </div>
      <div className="grid gap-2">
        <Label>Token</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sol">SOL</SelectItem>
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="all">All Tokens</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full">Check Balance</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

// NFT Operations Nodes
export const NFTCollectionNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">🎨</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Collection Name</Label>
        <Input placeholder="Enter collection name" />
      </div>
      <div className="grid gap-2">
        <Label>Symbol</Label>
        <Input placeholder="Collection symbol" />
      </div>
      <div className="grid gap-2">
        <Label>Royalty Percentage</Label>
        <Slider defaultValue={[5]} max={10} step={0.5} />
      </div>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const ZKAirdropNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">🎯</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Recipient Addresses</Label>
        <Textarea placeholder="Enter addresses (comma separated)" />
      </div>
      <div className="grid gap-2">
        <Label>Amount per Address</Label>
        <Input type="number" placeholder="0.0" />
      </div>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

// NFT Operations Nodes (continued)
export const NFTMintNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">🏷️</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Collection Address</Label>
        <Input placeholder="Enter collection address" />
      </div>
      <div className="grid gap-2">
        <Label>Recipient Address</Label>
        <Input placeholder="Enter recipient address" />
      </div>
      <div className="grid gap-2">
        <Label>Metadata JSON</Label>
        <Textarea placeholder="Paste metadata JSON" className="h-32" />
      </div>
      <Button className="w-full">Mint NFT</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const NFTListingNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">💫</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>NFT Address</Label>
        <Input placeholder="Enter NFT mint address" />
      </div>
      <div className="grid gap-2">
        <Label>Marketplace</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select marketplace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tensor">Tensor</SelectItem>
            <SelectItem value="magiceden">Magic Eden</SelectItem>
            <SelectItem value="hyperspace">Hyperspace</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Price (SOL)</Label>
        <Input type="number" placeholder="0.0" />
      </div>
      <Button className="w-full">List NFT</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const MetadataNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">📝</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>NFT Address</Label>
        <Input placeholder="Enter NFT mint address" />
      </div>
      <div className="grid gap-2">
        <Label>New Name</Label>
        <Input placeholder="Enter new name" />
      </div>
      <div className="grid gap-2">
        <Label>New Description</Label>
        <Textarea placeholder="Enter new description" />
      </div>
      <Button className="w-full">Update Metadata</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

const RoyaltyNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">👑</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Royalty Percentage</Label>
        <Slider defaultValue={[5]} max={10} step={0.5} />
      </div>
      <div className="grid gap-2">
        <Label>Payout Address</Label>
        <Input placeholder="Enter royalty payout address" />
      </div>
      <Button className="w-full">Update Royalties</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

// DeFi & Trading Nodes
export const JupiterSwapNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">🔄</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Input Token</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sol">SOL</SelectItem>
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="bonk">BONK</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Output Token</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sol">SOL</SelectItem>
            <SelectItem value="usdc">USDC</SelectItem>
            <SelectItem value="bonk">BONK</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Amount</Label>
        <Input type="number" placeholder="0.0" />
      </div>
      <Button className="w-full">Swap Tokens</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const RaydiumNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">🌊</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Token Pair</Label>
        <div className="flex gap-2">
          <Input placeholder="Base token" />
          <Input placeholder="Quote token" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Initial Liquidity</Label>
        <Input type="number" placeholder="0.0" />
      </div>
      <Button className="w-full">Create Pool</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const OrcaNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">🌀</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Token Pair</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select pair" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOL/USDC">SOL/USDC</SelectItem>
            <SelectItem value="BTC/USDC">BTC/USDC</SelectItem>
            <SelectItem value="ETH/USDC">ETH/USDC</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Trade Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select trade type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Amount</Label>
        <Input type="number" placeholder="0.0" />
      </div>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const LimitOrderNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">📊</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Token Pair</Label>
        <div className="flex gap-2">
          <Input placeholder="Base token" />
          <Input placeholder="Quote token" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Limit Price</Label>
        <Input type="number" placeholder="0.0" />
      </div>
      <div className="grid gap-2">
        <Label>Order Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select order type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GTC">Good Til Canceled</SelectItem>
            <SelectItem value="IOC">Immediate or Cancel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full">Place Order</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const OracleNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">📈</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Price Feed</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select feed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOL/USD">SOL/USD</SelectItem>
            <SelectItem value="BTC/USD">BTC/USD</SelectItem>
            <SelectItem value="ETH/USD">ETH/USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Current Price</Label>
        <Input disabled value="Fetching..." />
      </div>
      <Button className="w-full">Subscribe Feed</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const DriftNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">📑</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Position Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Leverage</Label>
        <Slider defaultValue={[5]} max={20} step={1} />
      </div>
      <div className="grid gap-2">
        <Label>Collateral (SOL)</Label>
        <Input type="number" placeholder="0.0" />
      </div>
      <Button className="w-full">Open Position</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

// Utility & Infrastructure Nodes
export const WorkTaskNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">⚒️</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Task Description</Label>
        <Textarea placeholder="Describe the task" />
      </div>
      <div className="grid gap-2">
        <Label>Assignee</Label>
        <Input placeholder="Enter worker's wallet address" />
      </div>
      <div className="grid gap-2">
        <Label>Reward (SOL)</Label>
        <Input type="number" placeholder="0.0" />
      </div>
      <Button className="w-full">Create Task</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const SNSNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">🔍</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Domain Name</Label>
        <Input placeholder="Enter domain name" />
      </div>
      <div className="grid gap-2">
        <Label>Action</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="register">Register</SelectItem>
            <SelectItem value="update">Update Records</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full">Execute</Button>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const StakingNode = ({ data, isConnectable }: SolanaNodeProps) => (
  <Card className="min-w-[300px] bg-white dark:bg-gray-800 shadow-lg">
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
    />
    <CardHeader>
      <CardTitle className="flex items-center text-sm font-medium">
        <span className="mr-2">⚡</span>
        {data.label as string}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid gap-2">
        <Label>Amount to Stake</Label>
        <Input type="number" placeholder="0.0" />
        <SolanaIcon className="w-6 h-6" />
      </div>
      <div className="grid gap-2">
        <Label>Validator</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select validator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
  </Card>
);

export const solanaNodeTypes = {
  tokenDeploy: TokenDeployNode,
  assetTransfer: TransferNode,
  balanceCheck: BalanceNode,
  staking: StakingNode,
  zkAirdrop: ZKAirdropNode,
  nftCollection: NFTCollectionNode,
  nftMint: NFTMintNode,
  nftListing: NFTListingNode,
  metadataUpdate: MetadataNode,
  royaltyUpdate: RoyaltyNode,
  jupiterSwap: JupiterSwapNode,
  raydium: RaydiumNode,
  orca: OrcaNode,
  limitOrder: LimitOrderNode,
  oracle: OracleNode,
  drift: DriftNode,
  workTask: WorkTaskNode,
  sns: SNSNode,
} satisfies NodeTypes;

export const createSolanaNode = (
  toolId: string,
  position: { x: number; y: number }
) => {
  const nodeConfig = {
    "tool-2": { type: "tokenDeploy", label: "💎 Deploy SPL Tokens" },
    "tool-3": { type: "assetTransfer", label: "📤 Transfer Assets" },
    "tool-4": { type: "balanceCheck", label: "💰 Check Balances" },
    "tool-5": { type: "staking", label: "🔒 Stake SOL" },
    "tool-6": { type: "zkAirdrop", label: "🎯 ZK Compressed Airdrop" },
    "tool-7": { type: "nftCollection", label: "🎨 Create NFT Collection" },
    "tool-8": { type: "nftMint", label: "🏷️ Mint and List NFTs" },
    "tool-9": { type: "nftListing", label: "💫 List NFT for Sale" },
    "tool-10": { type: "metadataUpdate", label: "📝 Manage NFT Metadata" },
    "tool-11": { type: "royaltyUpdate", label: "👑 Configure Royalties" },
    "tool-12": { type: "jupiterSwap", label: "🔄 Jupiter Token Swap" },
    "tool-13": { type: "raydium", label: "🌊 Raydium Pool Create" },
    "tool-14": { type: "orca", label: "🌀 Orca Whirlpool Trade" },
    "tool-15": { type: "limitOrder", label: "📊 Manifest Limit Orders" },
    "tool-16": { type: "oracle", label: "📈 Pyth Price Oracle" },
    "tool-17": { type: "drift", label: "📑 Drift Trading Tools" },
    "tool-18": { type: "workTask", label: "⚒️ Gib Work Tasks" },
    "tool-19": { type: "sns", label: "🔍 SNS Domain Tools" },
    "tool-20": { type: "staking", label: "⚡ Solayer Staking" },
  };

  const config = nodeConfig[toolId as keyof typeof nodeConfig];
  if (!config) throw new Error(`Invalid tool ID: ${toolId}`);

  return {
    id: `${toolId}-${Date.now()}`,
    type: config.type,
    position,
    data: {
      label: config.label,
      // Initialize other custom data properties if needed
    },
    draggable: true,
    selectable: true,
    deletable: true,
    connectable: true,
    style: {
      width: 300,
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    },
    className: "shadow-md rounded-lg dark:bg-gray-800 dark:border-gray-700",
  };
};
