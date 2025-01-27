import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

type Props = {
    params: Promise<{
      agentId: string;
    }>;
  };
export const POST = async (req: Request, { params }: Props) =>{
    const { agentId } = context.params;
    const elizaUrl = process.env.ELIZA_API_URL;

    if (!elizaUrl) {
        return NextResponse.json(
            { error: 'ELIZA_API_URL environment variable not configured' },
            { status: 500 }
        );
    }

    try {
        // Parse the incoming request body
        const formData = await req.formData();
        const roomId = formData.get('roomId') || `default-room-${agentId}`;
        const userId = formData.get('userId') || 'user';
        const userName = formData.get('userName') || '';
        const name = formData.get('name') || '';
        const text = formData.get('text');

        if (!text) {
            return NextResponse.json([]);
        }

        // Process the file if uploaded
        const file = formData.get('file') as File | null;
        const attachments: any[] = [];

        if (file) {
            const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
            await fs.mkdir(uploadsDir, { recursive: true });
            const filePath = path.join(uploadsDir, file.name);
            await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

            attachments.push({
                id: uuidv4(),
                url: filePath,
                title: file.name,
                source: 'direct',
                description: `Uploaded file: ${file.name}`,
                text: '',
                contentType: file.type,
            });
        }

        // Create a new FormData object to forward to the ELIZA API
        const forwardFormData = new FormData();
        forwardFormData.append('roomId', roomId);
        forwardFormData.append('userId', userId);
        forwardFormData.append('userName', userName);
        forwardFormData.append('name', name);
        forwardFormData.append('text', text);

        if (file) {
            forwardFormData.append('file', file);
        }

        // Forward the message to the ELIZA API
        const response = await fetch(`${elizaUrl}/${agentId}/message`, {
            method: 'POST',
            body: forwardFormData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ELIZA API error: ${error}`);
        }

        // Parse and return the ELIZA API response
        const responseData = await response.json();
        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error processing message:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};
