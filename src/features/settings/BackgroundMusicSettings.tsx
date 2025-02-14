import { useState, useEffect, useRef, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import debounce from "@/utils/debounce";
import BackgroundMusics from "@/data/background-musics";
import { useTimer } from "@/context/TimerContext";

const BackgroundMusicSettings = () => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(BackgroundMusics[0].value);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const { isRunning } = useTimer();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEnableSound = (value: boolean) => {
    setIsMusicEnabled(value);
    chrome.storage.local.set({ isMusicEnabled: value });
    chrome.runtime.sendMessage({
      action: "toggle-music",
      isMusicEnabled: value,
      isRunning,
    });

    // Pause the audio if sound is disabled
    if (!value && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleSoundChange = (value: string) => {
    setIsMusicPlaying(true);
    setSelectedMusic(value);
    chrome.storage.local.set({ selectedMusic: value });
  };

  const handlePlay = () => {
    setIsMusicPlaying(false);
    const sound = new Audio(selectedMusic);
    sound.volume = musicVolume;
    sound.play();

    audioRef.current = sound;
    setIsMusicPlaying(true);
  };

  const handleStop = () => {
    setIsMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const debouncedSave = useCallback(
    debounce((value: number) => {
      chrome.storage.local.set({ musicVolume: value });
      chrome.runtime.sendMessage({
        action: "adjust-music-volume",
        musicVolume: value,
      });
    }, 500),
    []
  );

  const handleVolumeChange = (value: number) => {
    setMusicVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }

    debouncedSave(value);
  };

  useEffect(() => {
    chrome.storage.local
      .get(["selectedMusic", "isMusicEnabled", "musicVolume"])
      .then((data) => {
        setSelectedMusic((data?.selectedMusic as string) ?? "clock.mp3");
        setIsMusicEnabled((data?.isMusicEnabled as boolean) ?? false);
        setMusicVolume((data?.musicVolume as number) ?? 0.5);
      });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      handleStop();
    }

    if (isMusicEnabled && isMusicPlaying) {
      handlePlay();
    }

    return () => {
      if (audioRef.current) handleStop();
    };
  }, [selectedMusic, musicVolume, isMusicPlaying]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p>Enable Music</p>
        <Switch
          className={`data-[state=checked]:bg-primary-custom`}
          checked={isMusicEnabled}
          onCheckedChange={handleEnableSound}
          disabled
        />
      </div>

      <div className="flex items-center justify-between">
        <p>Select Music</p>
        <Select
          value={selectedMusic}
          onValueChange={handleSoundChange}
          // disabled={!isMusicEnabled || isRunning}
          disabled
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select a sound" />
          </SelectTrigger>
          <SelectContent>
            {BackgroundMusics.map((sound) => (
              <SelectItem key={sound.value} value={sound.value}>
                {sound.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isRunning && (
        <p className="text-[10px] text-center mx-auto text-red-500">
          Music cannot be changed while timer is running
        </p>
      )}

      <div className="flex items-center justify-between">
        <p>Volume</p>
        <div className="flex items-center gap-2">
          <input
            value={musicVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            type="range"
            min="0"
            max="1"
            step="0.1"
            className="accent-primary-custom"
            disabled
          />
          <p className="text-xs w-5">{musicVolume * 100}</p>
        </div>
      </div>

      <p className="text-xs text-center mx-auto mt-4 text-red-500">
        Background music soon to be added
      </p>
    </div>
  );
};

export default BackgroundMusicSettings;
