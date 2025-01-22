import { createClient } from '@/utils/supabase';
import { Keypair } from '@solana/web3.js';
import { NextResponse } from 'next/server';

function generate_characters(name: string, publicKey: string, privateKey: string) {
  return {
    // id: id,
    name: name,
    plugins: ['solana'],
    clients: ['direct'],
    modelProvider: 'openai',
    settings: {
      voice: { model: 'en_US-hfc_female-medium' },
      secrets: {
        WALLET_PRIVATE_KEY: privateKey,
        WALLET_PUBLIC_KEY: publicKey,
      },
    },
    bio: [
      'Built a strong economy and reduced inflation.',
      'Promises to make America the crypto capital and restore affordability.',
    ],
    lore: [
      'Secret Service allocations used for election interference.',
      'Promotes WorldLibertyFi for crypto leadership.',
    ],
    knowledge: [
      'Understands border issues, Secret Service dynamics, and financial impacts on families.',
    ],
    topics: [],
    adjectives: [],
    style: { all: [], chat: [], post: [] },
    messageExamples: [
      [
        {
          user: '{{user1}}',
          content: { text: 'What about the border crisis?' },
        },
      ],
    ],
    postExamples: [
      'End inflation and make America affordable again.',
      'America needs law and order, not crime creation.',
    ],
  };
}

function generateSolanaWallet() {
  const keypair = Keypair.generate();

  const publicKey = keypair.publicKey.toBase58();
  const privateKey = `[${keypair.secretKey.toString()}]`;

  return { publicKey, privateKey };
}

export const POST = async (req: Request) => {
    try {
        // Expecting the agent's name in the request body
        const requestData = await req.json();

        const { name, walletAddress } = requestData;
        

        console.log('name', name);
        // Validate name input
        if (!name) {
            return NextResponse.json(
            { error: 'Name is required in the request body.' },
            { status: 400 }
            );
        }

        if (!walletAddress) {
            return NextResponse.json(
            { error: 'Wallet Address is required in the request body.' },
            { status: 400 }
            );
        }

        const { publicKey, privateKey } = generateSolanaWallet();
        //   const id = uuidv4();

        // Generate character data
        const character = generate_characters(name, publicKey, privateKey);

        const supabase = await createClient();

        // Store agent in Supabase with 'active' flag and 'configuration' JSON
        const { data: supabaseData, error } = await supabase
            .from('configuration')
            .insert([
            {
                // id: character.id, optional Supabase handles this
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
                },
                owner: walletAddress,
            },
            ]);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: supabaseData });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export const GET = async () => {
    return NextResponse.json({ message: 'Hello World!' });
}
