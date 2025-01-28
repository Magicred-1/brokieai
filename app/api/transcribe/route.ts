import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';

export const dynamic = 'force-dynamic';

const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: '2024-07-01-preview',
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const audioFileAsFile = new File([audioFile], 'audio.wav', { type: audioFile.type });

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileAsFile,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
} 