import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume, VolumeOff } from "lucide-react";

interface AudioPlayerProps {
  audioURL: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioURL }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  return (
    // Transparent blue background
    <div className="flex items-center space-x-2 border border-gray-200 rounded-xl p-2">
      <audio ref={audioRef} src={audioURL} />
      <button onClick={togglePlay} className="p-2 rounded-full">
        {isPlaying ? <Pause className="h-6 w-6 hover:text-blue-200" /> : <Play className="h-6 w-6 hover:text-blue-200" />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="w-24"
      />
      {
        volume > 0 ? <Volume className="h-6 w-6" /> : <VolumeOff className="h-6 w-6" />
      }
    </div>
  );
};

export default AudioPlayer;