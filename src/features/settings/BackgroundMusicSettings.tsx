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
    setSelectedMusic(value);
    chrome.storage.local.set({ selectedMusic: value });
  };

  const handlePlay = () => {
    const sound = new Audio(selectedMusic);
    sound.volume = musicVolume;
    sound.play();

    audioRef.current = sound;
  };

  const handleStop = () => {
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
    debouncedSave(value);
  };

  useEffect(() => {
    chrome.storage.local
      .get(["selectedMusic", "isMusicEnabled", "musicVolume"])
      .then((data) => {
        setSelectedMusic(
          (data?.selectedMusic as string) ?? BackgroundMusics[0].value
        );
        setIsMusicEnabled((data?.isMusicEnabled as boolean) ?? false);
        setMusicVolume((data?.musicVolume as number) ?? 0.5);
      });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      handleStop();
    }

    if (isMusicEnabled) {
      handlePlay();
    }

    return () => {
      if (audioRef.current) handleStop();
    };
  }, [selectedMusic, musicVolume, isMusicEnabled]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p>Enable Music</p>
        <Switch
          className={`data-[state=checked]:bg-primary-custom`}
          checked={isMusicEnabled}
          onCheckedChange={handleEnableSound}
        />
      </div>

      <div className="flex items-center justify-between">
        <p>Select Music</p>
        <Select
          value={selectedMusic}
          onValueChange={handleSoundChange}
          disabled={!isMusicEnabled || isRunning}
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
          />
          <p className="text-xs w-5">{musicVolume * 100}</p>
        </div>
      </div>
    </div>
  );
};

export default BackgroundMusicSettings;
