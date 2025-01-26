import { createClient } from "@/utils/supabase";
import { Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { JwksClient } from "jwks-rsa";
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
  privateKey: string
) {
  return {
    id: uuidv4(),
    name: name,
    plugins: ['@elizaos/plugin-solana-agentkit', '@elizaos/plugin-web-search', '@elizaos/plugin-coinmarketcap'],
    clients: ['direct'],
    modelProvider: 'openai',

    settings: {
      voice: { model: "en_US-hfc_female-medium" },
      secrets: {
        SOLANA_PRIVATE_KEY: privateKey,
        SOLANA_PUBLIC_KEY: publicKey,
      },
    },
    bio: [description],
    lore: [
      "Secret Service allocations used for election interference.",
      "Promotes WorldLibertyFi for crypto leadership.",
    ],
    knowledge: [
      "Understands border issues, Secret Service dynamics, and financial impacts on families.",
    ],
    topics: [], // Ensure topics are included if needed
    adjectives: [], // Ensure adjectives are included if needed
    style: { all: [], chat: [], post: [] }, // Ensure style is included if needed
    messageExamples: [
      [
        {
          user: "{{user1}}",
          content: { text: "What about the border crisis?" },
        },
      ],
    ],
    postExamples: [
      "End inflation and make America affordable again.",
      "America needs law and order, not crime creation.",
    ],
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
    // middle function logic (JWT verification)
    // not the best practice to have this logic in the route but for simplicity and fast prototyping
    const middle = await middleware(req);

    if (middle === "401") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token." },
        { status: 401 }
      );
    }

    if (middle === "403") {
      return NextResponse.json(
        { error: "Forbidden: Requires additional authentication." },
        { status: 403 }
      );
    }

    const userAddress = middle;
    const requestData: RequestData = await req.json();
    const { name, description, nodes, walletAddress } = requestData;

    if (!userAddress || !walletAddress || (userAddress !== walletAddress)) {
      return NextResponse.json(
        { error: "Wallet Address is required in the request body." },
        { status: 400 }
      );
    }

    // Validate name and walletAddress input
    if (!name) {
      return NextResponse.json(
        { error: "Name is required in the request body." },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Description is required in the request body." },
        { status: 400 }
      );
    }

    if (!userAddress) {
      return NextResponse.json(
        { error: "Wallet Address is required in the request body." },
        { status: 400 }
      );
    }

    const { publicKey, privateKey } = generateSolanaWallet();

    // Generate character data
    const character = generate_characters(
      name,
      description,
      publicKey,
      privateKey
    );

    // console.log("Generated Character:", character); // Log the character data to ensure it includes all fields

    const supabase = await createClient();

    // Store agent in Supabase with 'active' flag and 'configuration' JSON
    const { data: supabaseData, error } = await supabase
      .from("configuration")
      .insert([
        {
          id: character.id,
          name: character.name,
          active: true, // Setting the agent as active
          configuration: {
            plugins: character.plugins,
            clients: character.clients,
            modelProvider: character.modelProvider,
            settings: character.settings,
            bio: character.bio,
            lore: character.lore,
            knowledge: character.knowledge,
            topics: character.topics, // Ensure topics are included
            adjectives: character.adjectives, // Ensure adjectives are included
            style: character.style, // Ensure style is included
            messageExamples: character.messageExamples, // Ensure message examples are included
            postExamples: character.postExamples, // Ensure post examples are included
          },
          owner: userAddress,
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
      data: supabaseData,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
};

export const GET = async () => {
  return NextResponse.json({ message: "Hello World!" });
};
