import { Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import bs58 from "bs58";
import { z } from "zod";
import { createClient } from "@/utils/supabase";

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

const TokenSchema = z.object({
  name: z.string().min(2).max(25),
  symbol: z.string().min(2).max(10),
  description: z.string().max(500),
  twitter: z.string().url().optional(),
  telegram: z.string().url().optional(),
  website: z.string().url().optional(),
  imageData: z.string(),
  walletAddress: z.string(),
  agentID: z.string().uuid()
});

async function sendCreateTx(
  formData: FormData,
  apiKey: string
): Promise<TxResult> {
  try {
    const mintKeypair = Keypair.generate();

    // Store metadata on IPFS
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

export const POST = async (req: Request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const apiKey = process.env.PUMP_FUN_API_KEY;
    if (!apiKey) throw new Error("Missing Pump.fun API configuration");

    // Validate input
    const rawBody = await req.json();
    const validation = TokenSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400, headers }
      );
    }

    const { data } = validation;

    // Process image
    const imageBuffer = Buffer.from(data.imageData.split(',')[1], 'base64');
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    
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

    // Execute transaction with retry logic
    let txResult: TxResult = { success: false };
    let retries = 3;
    
    while (retries > 0) {
      txResult = await sendCreateTx(formData, apiKey);
      if (txResult.success) break;
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if (!txResult!.success) {
      throw new Error(txResult!.error || 'Token creation failed after retries');
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
      explorer_link: `https://pump.fun/coin/${txResult.tokenAddress}`
    });

    if (error) throw new Error('Failed to save token data');

    return NextResponse.json({
      success: true,
      tokenAddress: txResult.tokenAddress,
      transactionLink: txResult.transactionLink,
      explorerLink: `https://pump.fun/coin/${txResult.tokenAddress}`
    }, { headers });

  } catch (error) {
    console.error('Deployment Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500, headers }
    );
  }
};