import { createClient } from "@/utils/supabase";
import { Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

function generate_characters(
  name: string,
  description: string,
  publicKey: string,
  privateKey: string
) {
  return {
    id: uuidv4(),
    name: name,
    plugins: ["@elizaos/plugin-solana", "@elizaos/plugin-web-search"],
    clients: ["direct"],
    modelProvider: "openai",
    settings: {
      voice: { model: "en_US-hfc_female-medium" },
      secrets: {
        WALLET_PRIVATE_KEY: privateKey,
        WALLET_PUBLIC_KEY: publicKey,
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
  const privateKey = `[${keypair.secretKey.toString()}]`;

  return { publicKey, privateKey };
}

const DYNAMIC_ID = process.env.DYNAMIC_PROJECT_ID;

const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${DYNAMIC_ID}/.well-known/jwks`;

export const POST = async (req: Request) => {
  try {
    // Expecting the agent's name in the request body
    const encodedJwt = req.headers
      .get("Authorization")
      ?.split(" ")[1]
      .replace(/"/g, "");

    const client = new JwksClient({
      jwksUri: jwksUrl,
      rateLimit: true,
      cache: true,
      cacheMaxEntries: 5, // Maximum number of cached keys
      cacheMaxAge: 600000, // Cache duration in milliseconds (10 minutes in this case))}
    });

    const signingKey = await client.getSigningKey();
    const pubKey = signingKey.getPublicKey();

    if (!encodedJwt) {
      return NextResponse.json(
        { error: "Authorization token is missing" },
        { status: 401 }
      );
    }

    try {
      jwt.verify(encodedJwt, pubKey, {
        ignoreExpiration: false,
      }) as JwtPayload;
    } catch (error) {
      return NextResponse.json({ error: error }, { status: 401 });
    }

    const decodedToken = jwt.decode(encodedJwt) as JwtPayload;
    // TODO : create type for decodedToken
    const userAddress = decodedToken.verified_credentials.address; // extract the user's wallet address from the JWT

    if (decodedToken.scopes.includes("requiresAdditionalAuth")) {
      // Either reject or handle the scopes appropriately.
      // `requiresAdditionalAuth` is the scope used to indicate that JWT requires additional verification such as MFA.
      return NextResponse.json({ error: "Non Authorized" }, { status: 401 });
    }

    const requestData = await req.json();
    const { name, description } = requestData;

    console.log("Request Data:", requestData); // Log incoming data to debug

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

    console.log("Generated Character:", character); // Log the character data to ensure it includes all fields

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
