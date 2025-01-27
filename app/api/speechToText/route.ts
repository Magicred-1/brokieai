import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const base64Audio = body.audio;

    if (!base64Audio) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(base64Audio, "base64");

    // OpenAI expects a file-like object, including a name
    const audioFile = new File([audioBuffer], "audio.wav", { type: "audio/wav" });

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("Error processing audio:", error);

    // Provide more informative error responses if possible
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "Failed to process audio. Please try again.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
