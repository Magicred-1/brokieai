import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import VoiceWave from "./voice-wave";

interface HoldToSpeakProps {
  onTranscription: (text: string) => void;
  onRelease: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  agentId: string;
}

export function HoldToSpeak({ onTranscription, onRelease, isLoading = false, isDisabled = false, agentId }: HoldToSpeakProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  const startRecording = useCallback(async () => {
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

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check your permissions.');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);

        onTranscription(audioURL);

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        resolve();
      };

      mediaRecorder.stop();
    });
  }, [onTranscription]);

  const handleMouseLeave = useCallback(() => {
    if (isRecording) {
      stopRecording();
      onRelease();
    }
  }, [isRecording, stopRecording, onRelease]);

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
      onMouseLeave={handleMouseLeave}
      disabled={isLoading || isDisabled}
    >
      <div className="flex items-center space-x-2">
        <span>{isRecording ? '' : 'Hold to Speak'}</span>
        {isRecording && <VoiceWave isActive={true} />}
      </div>
    </Button>
  );
}