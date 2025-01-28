import { createClient } from "@/utils/supabase";
import { Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { middleware } from "@/utils/auth/middleware";
import bs58 from "bs58";

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
    if (!userAddress) {
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