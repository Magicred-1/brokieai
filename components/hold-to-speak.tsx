import { useState, useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VoiceWave from './voice-wave';

interface HoldToSpeakProps {
  onTranscription: (text: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function HoldToSpeak({ onTranscription, isLoading = false, isDisabled = false }: HoldToSpeakProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (isDisabled || isLoading) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check your permissions.');
    }
  }, [isDisabled, isLoading]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    const mediaRecorder = mediaRecorderRef.current;
    mediaRecorder.stop();
    setIsRecording(false);

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      onTranscription(data.text);
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio. Please try again.');
    }
  }, [onTranscription]);

  return (
    <Button
      size="lg"
      className={`rounded-full px-6 py-6 text-sm font-medium shadow-lg transition-all duration-300 ease-in-out ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600'
          : isDisabled || isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={isRecording ? stopRecording : undefined}
      disabled={isLoading || isDisabled}
    >
      <div className="flex items-center space-x-2">
        <Mic className={`h-5 w-5 text-white ${isRecording ? 'hidden' : ''}`} />
        {isRecording && <VoiceWave isActive={true} />}
        <span>{isRecording ? '' : 'Hold to Speak'}</span>
      </div>
    </Button>
  );
}
