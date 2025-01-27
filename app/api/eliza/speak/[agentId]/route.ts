import { NextRequest, NextResponse } from "next/server";

export const POST = async (
    req: NextRequest,
    context: { params: { agentId: string } }
) => {
    try {
        // Ensure it's a POST method
        if (req.method !== "POST") {
            return NextResponse.json(
                { error: "Method not allowed" },
                { status: 405 }
            );
        }

        // Parse the request body to get text
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        if (!context.params.agentId) {
            return NextResponse.json(
                { error: "Agent ID is required" },
                { status: 400 }
            );
        }

        const { agentId } = context.params;

        // Construct the external API URL with agentId in the path
        const elizaOSApiURL = `${process.env.ELIZA_API_URL}/${agentId}/speak`;

        // Prepare the data as application/x-www-form-urlencoded format
        const formData = new URLSearchParams({
            text: text,
        }).toString();

        // Call the external API
        const speechResponse = await fetch(elizaOSApiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        console.log("Speech response status:", speechResponse.status);

        if (!speechResponse.ok) {
            const errorText = await speechResponse.text();
            throw new Error(
                `External API error: ${speechResponse.status} - ${errorText}`
            );
        }

        // Get the audio buffer from the response
        const audioBuffer = await speechResponse.arrayBuffer();

        // Return the audio response
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
