import { createClient } from "@/utils/supabase";
import { Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { middleware } from "@/utils/auth/middleware";
import bs58 from "bs58";
import { Node } from "@xyflow/react";


enum NodeLabel {
  TOKEN_DEPLOY = "💰 Deploy Token",
  AGENT_CREATE = "🤖 Create Agent",
  CREATE_RADIUM_POOL = "🌊 Raydium Pool Create",
};

const prePrompt = {
  TOKEN_DEPLOY: "Deploy a new token named {{tokenName}} with symbol {{tokenSymbol}} and {{maxSupply}}. max supply.",
  CREATE_RADIUM_POOL: "Create a new Radium pool named {{poolName}} with {{poolSize}}.",
};


const verifyAgentExist = async (agentId: string) => {
    const response = await fetch(`${process.env.ELIZA_API_URL}/agents/${agentId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return false;
    }

    return true;

}

const callAgent = async (agentId: string, prompt: string, userAddress: string) => {
  const formData = new FormData()
  formData.append("text", prompt)
  formData.append("userId", userAddress)
  formData.append("roomId", `default-room-${agentId}`)
  formData.append("userName", "Anonymous User")

  const response = await fetch(`${process.env.ELIZA_API_URL}/${agentId}/message`, {
    method: 'POST',
    body: formData,
    // Automatically sets the correct Content-Type header for FormData
});

  console.log(response)

  if (!response.ok) {
    throw new Error("Failed to call agent")
  }

  console.log(response)

  return true;
}


type RequestData = {
  name: string;
  description: string;
  nodes: Node[];
  walletAddress: string;
};

function generate_characters(
  name: string,
  description: string,
  publicKey: string,
  privateKey: string,
  bio: string[],
  lore: string,
  style: { all: string[]; chat: string[]; post: string[] },
  topics: string[],
  knowledge: string[],
  adjectives: string[],
  postExamples: string[],
  messageExamples: { role: string; content: string }[]
) {
  return {
    id: uuidv4(),
    name: name,
    plugins: ['@elizaos/plugin-solana-agentkit', '@elizaos/plugin-web-search', '@elizaos/plugin-coinmarketcap'],
    clients: ['direct'],
    modelProvider: 'google',
    settings: {
      voice: { model: "en_US-hfc_female-medium" },
      secrets: {
        SOLANA_PRIVATE_KEY: privateKey,
        SOLANA_PUBLIC_KEY: publicKey,
      },
    },
    description: description,
    bio: bio,
    lore: lore ? [lore] : [],
    knowledge: knowledge,
    topics: topics,
    adjectives: adjectives,
    style: style,
    messageExamples: messageExamples,
    postExamples: postExamples,
  };
}

function generateSolanaWallet() {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const privateKey = bs58.encode(keypair.secretKey);
  return { publicKey, privateKey };
}

export const POST = async (req: Request) => {
  try {
    const middle = await middleware(req);
    if (middle === "401" || middle === "403") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAddress = middle;
    
    const requestData: RequestData = await req.json();
    const { name, description, nodes, walletAddress } = requestData;

    if (!userAddress || !walletAddress || (userAddress !== walletAddress)) {
      return NextResponse.json(
        { error: "Wallet Address is required" },
        { status: 400 }
      );
    }

    const requestData = await req.json();
    const { 
      name,
      description,
      bio = [],
      lore = '',
      style = { all: [], chat: [], post: [] },
      topics = [],
      knowledge = [],
      adjectives = [],
      postExamples = [],
      messageExamples = []
    } = requestData;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const { publicKey, privateKey } = generateSolanaWallet();
    const character = generate_characters(
      name,
      description,
      publicKey,
      privateKey,
      bio,
      lore,
      style,
      topics,
      knowledge,
      adjectives,
      postExamples,
      messageExamples
    );

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("configuration")
      .insert([
        {
          id: character.id,
          name: character.name,
          active: true,
          configuration: {
            plugins: character.plugins,
            clients: character.clients,
            modelProvider: character.modelProvider,
            settings: character.settings,
            description: character.description,
            bio: character.bio,
            lore: character.lore,
            knowledge: character.knowledge,
            topics: character.topics,
            adjectives: character.adjectives,
            style: character.style,
            messageExamples: character.messageExamples,
            postExamples: character.postExamples,
          },
          owner: userAddress,
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // check if the agent is created successfully
    let attempts = 0;
    const maxAttempts = 5;
    await new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
      attempts++;
      const agentExist = await verifyAgentExist(character.id);
      if (agentExist) {
        clearInterval(interval);
        console.log("Agent created successfully!");
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error("Failed to verify agent existence after multiple attempts.");
        reject(new Error("Failed to verify agent existence after multiple attempts."));
      }
      }, 5000); // = 5 seconds
    });

    // if agent created, call it with the nodes

    nodes.forEach(async (node) => {
      console.log("Node", node.data.label);
      if (node.data.label === NodeLabel.TOKEN_DEPLOY) {
        console.log("Deploying token", node.data);
        const prompt = prePrompt.TOKEN_DEPLOY
          .replace("{{tokenName}}", (node.data as { tokenName: string }).tokenName)
          .replace("{{tokenSymbol}}", (node.data as { tokenSymbol: string }).tokenSymbol)
          .replace("{{maxSupply}}", String(node.data.maxSupply));

        await callAgent(character.id, prompt, userAddress);
      } else if (node.data.label === NodeLabel.CREATE_RADIUM_POOL) {
        console.log("Creating Radium Pool", node.data);
        const prompt = prePrompt.CREATE_RADIUM_POOL
          .replace("{{poolName}}", (node.data as any).poolName)
          .replace("{{poolSize}}", (node.data as any).poolSize);

        await callAgent(character.id, prompt, userAddress);
      }
    });



    return NextResponse.json({
      message: "Agent created successfully!",
      data: data,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
};

export const GET = async () => {
  return NextResponse.json({ message: "Hello World!" });
};