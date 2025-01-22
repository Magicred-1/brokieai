import { Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import bs58 from "bs58";
import fs from "fs/promises";
import FormData from "form-data";
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

async function sendCreateTx(
  formData: FormData,
  apiKey: string
): Promise<TxResult> {
  // Generate a random keypair for the token
  const mintKeypair = Keypair.generate();

  // Create IPFS metadata storage
  const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData as any,
  });

  const metadataResponseJSON = await metadataResponse.json();

  // Send the create transaction
  const response = await fetch(
    `https://pumpportal.fun/api/trade?api-key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri,
        } as TokenMetadata,
        mint: bs58.encode(mintKeypair.secretKey),
        denominatedInSol: "true",
        amount: 1, // Dev buy of 1 SOL
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      }),
    }
  );

  if (response.status === 200) {
    const data = await response.json();
    return {
      success: true,
      transactionLink: `https://solscan.io/tx/${data.signature}`,
      tokenAddress: mintKeypair.publicKey.toBase58(),
    };
  } else {
    const errorText = await response.text();
    return { success: false, error: errorText };
  }
}

export const POST = async (req: Request) => {
  try {
    const apiKey = process.env.PUMP_FUN_API_KEY ?? "";

    const {
      filePath,
      name,
      symbol,
      description,
      twitter,
      telegram,
      website,
      showName,
      walletAddress,
      agentID,
    } = await req.json();

    if (
      !filePath ||
      !name ||
      !symbol ||
      !description ||
      !twitter ||
      !telegram ||
      !website ||
      !showName ||
      !walletAddress ||
      !agentID
    ) {
      return NextResponse.json(
        { error: "Missing required fields in the request body." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API Key in the request body." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Prepare form data for IPFS metadata
    const formData = new FormData();
    const fileBuffer = await fs.readFile(filePath);
    const fileBlob = new Blob([fileBuffer]);
    formData.append("file", fileBlob);
    formData.append("name", name);
    formData.append("symbol", symbol);
    formData.append("description", description);
    formData.append("twitter", twitter);
    formData.append("telegram", telegram);
    formData.append("website", website);
    formData.append("showName", showName);

    const txResult = await sendCreateTx(formData, apiKey);

    if (txResult.success) {
      // Insert token address and other details into Supabase
      const { data, error } = await supabase.from("tokens").insert({
        name,
        symbol,
        description,
        twitter,
        telegram,
        website,
        agent_id: agentID,
        token_address: txResult.tokenAddress,
      });

      console.log(data);

      if (error) {
        return NextResponse.json(
          { error: "Failed to save token data to Supabase." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Transaction created successfully!",
        transactionLink: txResult.transactionLink,
        tokenAddress: txResult.tokenAddress,
      });
    } else {
      return NextResponse.json({ error: txResult.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
};
