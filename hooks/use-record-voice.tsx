import { useEffect, useState, useRef } from "react";
import { blobToBase64 } from "@/utils/blobToBase64";

export const useRecordVoice = () => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      chunksRef.current = []; // Reset chunks
      mediaRecorderRef.current.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const getText = async (base64data: string) => {
    try {
      const response = await fetch("/api/speechToText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64data }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transcription");
      }

      const { text } = await response.json();
      setText(text);
      console.log("Transcript from Whisper:", text);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        const base64Audio = await blobToBase64(audioBlob);
        getText(base64Audio); // Send audio for transcription
      };

      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error("Error initializing media recorder:", error);
    }
  };

  useEffect(() => {
    initializeMediaRecorder();
  }, []);

  return { recording, startRecording, stopRecording, text };
};
