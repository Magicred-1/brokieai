/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

type Props = {
    params: Promise<{
    agentId: string;
    }>;
};
    
export const POST = async (req: Request, { params }: Props) =>{
    const { agentId } = await params;

    try {
    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Parse FormData from the request
    const formData = await req.formData();

    const text = formData.get("text");
    const userId = formData.get("userId");
    const userName = formData.get("userName");
    const audio = formData.get("audio");

    if (!text && !audio) {
        return NextResponse.json(
        { error: "Text or audio is required" },
        { status: 400 }
        );
    }

    // Construct the external API URL
    const elizaOSApiURL = `${process.env.ELIZA_API_URL}/${agentId}/speak`;

    // Prepare the data for the external API call
    const encodedData = new URLSearchParams();
    if (text) {
        encodedData.append("text", text as string);
    }
    encodedData.append("userId", userId as string);
    // encodedData.append("roomId", roomId as string);
    encodedData.append("userName", userName as string);

    // Send data to the external API
    const speechResponse = await fetch(elizaOSApiURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodedData,
    });

    if (!speechResponse.ok) {
        const errorText = await speechResponse.text();
        throw new Error(`External API error: ${speechResponse.status} - ${errorText}`);
    }

    const audioBuffer = await speechResponse.arrayBuffer();

    return new NextResponse(Buffer.from(audioBuffer), {
        headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        },
    });
    } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
        {
        error: "Error generating speech",
        details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
    );
    }
};
