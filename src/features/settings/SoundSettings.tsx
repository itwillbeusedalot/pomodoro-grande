"use client";
import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import browser from "webextension-polyfill";

const sounds = [
  { value: "clock.mp3", label: "Clock" },
  { value: "rickroll.mp3", label: "Rick Roll" },
];

const SoundSettings = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("clock");
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEnableSound = (value: boolean) => {
    setIsSoundEnabled(value);
    browser.storage.local.set({ isSoundEnabled: value });

    // Pause the audio if sound is disabled
    if (!value && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleSoundChange = (value: string) => {
    setIsSoundPlaying(true);
    setSelectedSound(value);
    browser.storage.local.set({ selectedSound: value });
  };

  const handlePlay = () => {
    setIsSoundPlaying(false);
    const sound = new Audio(`./sounds/${selectedSound}`);
    sound.volume = soundVolume;
    sound.play();

    audioRef.current = sound;
    setIsSoundPlaying(true);
  };

  useEffect(() => {
    browser.storage.local
      .get(["selectedSound", "isSoundEnabled", "soundVolume"])
      .then((data) => {
        setSelectedSound((data?.selectedSound as string) ?? "clock");
        setIsSoundEnabled((data?.isSoundEnabled as boolean) ?? true);
        setSoundVolume((data?.soundVolume as number) ?? 1);
      });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (isSoundEnabled && isSoundPlaying) {
      handlePlay();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSound, soundVolume, isSoundPlaying]);

  return (
    <div className="w-full space-y-2">
      <h1 className="text-base text-center font-semibold ">Sound Settings</h1>

      <div className="flex items-center justify-between">
        <p>Enable Sound</p>
        <Switch
          className={`data-[state=checked]:bg-primary-custom`}
          checked={isSoundEnabled}
          onCheckedChange={handleEnableSound}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <p>Select Sound</p>
        <Select
          value={selectedSound}
          onValueChange={handleSoundChange}
          disabled={!isSoundEnabled}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select a sound" />
          </SelectTrigger>
          <SelectContent>
            {sounds.map((sound) => (
              <SelectItem key={sound.value} value={sound.value}>
                {sound.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SoundSettings;
