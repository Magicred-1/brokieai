/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/token/deploy/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { z } from "zod";
import { createClient } from "@/utils/supabase";

export const dynamic = 'force-dynamic';

interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
}

interface TxResult {
  success: boolean;
  transactionLink?: string;
  tokenAddress?: string;
  error?: string;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];

const TokenSchema = z.object({
  name: z.string().min(2).max(25),
  symbol: z.string().min(2).max(10),
  description: z.string().max(500),
  twitter: z.string().url().optional(),
  telegram: z.string().url().optional(),
  website: z.string().url().optional(),
  imageData: z.string().refine((val) => {
    const [data] = val.split(',');
    const size = Buffer.from(data || '', 'base64').length;
    return size <= MAX_IMAGE_SIZE;
  }, 'Image too large (max 2MB)'),
  walletAddress: z.string(),
  agentID: z.string().uuid()
});

async function verifyWalletOwnership(walletAddress: string, agentId: string) {
  const supabase = createClient();
  const { data, error } = await (await supabase).from('agents').select('user_id').eq('id', agentId).single();

  if (error || !data) return false;

  const { data: walletData } = await (await supabase)
    .from('wallets')
    .select()
    .eq('address', walletAddress)
    .eq('user_id', data.user_id)
    .single();

  return !!walletData;
}

async function sendCreateTx(formData: FormData, apiKey: string): Promise<TxResult> {
  try {
    const mintKeypair = Keypair.generate();

    // IPFS Metadata upload
    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData as any,
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      throw new Error(`IPFS upload failed: ${errorText}`);
    }

    const metadata = await metadataResponse.json();

    // Create token transaction
    const response = await fetch(
      `https://pumpportal.fun/api/trade?api-key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          tokenMetadata: {
            name: metadata.metadata.name,
            symbol: metadata.metadata.symbol,
            uri: metadata.metadataUri,
          } as TokenMetadata,
          mint: bs58.encode(mintKeypair.secretKey),
          denominatedInSol: "true",
          amount: 1,
          slippage: 10,
          priorityFee: 0.0005,
          pool: "pump",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        transactionLink: `https://solscan.io/tx/${data.signature}`,
        tokenAddress: mintKeypair.publicKey.toBase58(),
      };
    }

    const errorText = await response.text();
    return { success: false, error: errorText };
  } catch (error) {
    return { 
      success: false,
      error: error instanceof Error ? error.message : "Unknown transaction error"
    };
  }
}

export const OPTIONS = async () => {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const POST = async (req: NextRequest) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

    // Environment validation
    const apiKey = process.env.PUMP_FUN_API_KEY;
    if (!apiKey) throw new Error("Missing Pump.fun API configuration");

    // Request validation
    const rawBody = await req.json();
    const validation = TokenSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400, headers }
      );
    }

    const { data } = validation;

    // Wallet authorization check
    const ownsWallet = await verifyWalletOwnership(data.walletAddress, data.agentID);
    if (!ownsWallet) {
      return NextResponse.json(
        { error: "Wallet not authorized for this agent" },
        { status: 403, headers }
      );
    }

    // Image processing
    const [header, base64Data] = data.imageData.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    
    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Invalid image format. Only PNG and JPEG are allowed." },
        { status: 400, headers }
      );
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([imageBuffer], { type: mimeType });
    
    const formData = new FormData();
    formData.append('file', imageBlob, 'token-image.png');
    formData.append('name', data.name);
    formData.append('symbol', data.symbol);
    formData.append('description', data.description);
    formData.append('showName', 'true');

    // Optional fields
    if (data.twitter) formData.append('twitter', data.twitter);
    if (data.telegram) formData.append('telegram', data.telegram);
    if (data.website) formData.append('website', data.website);

    // Transaction execution with retries
    let txResult: TxResult = { success: false };
    let retries = 3;
    
    while (retries > 0) {
      txResult = await sendCreateTx(formData, apiKey);
      if (txResult.success) break;
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if (!txResult.success) {
      throw new Error(txResult.error || 'Token creation failed after retries');
    }

    // Save to Supabase
    const supabase = await createClient();
    const { error } = await supabase.from('tokens').insert({
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website,
      agent_id: data.agentID,
      token_address: txResult.tokenAddress,
      transaction_link: txResult.transactionLink,
      wallet_address: data.walletAddress,
      explorer_link: `https://pump.fun/coin/${txResult.tokenAddress}`,
      status: 'pending'
    });

    if (error) throw new Error('Failed to save token data');

    return NextResponse.json({
      success: true,
      tokenAddress: txResult.tokenAddress,
      transactionLink: txResult.transactionLink,
      explorerLink: `https://pump.fun/coin/${txResult.tokenAddress}`
    }, { headers });
};