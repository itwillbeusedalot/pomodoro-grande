import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import debounce from "@/utils/debounce";
import TodoProgress from "../todos/TodoProgress";
import { ONE_HOUR } from "@/constants";
import { useTimer } from "@/context/TimerContext";

const PomodoroTimer = () => {
  const [time, setTime] = useState(0);
  const {
    isRunning,
    setIsRunning,
    isBreak,
    isLongBreak,
    setIsBreak,
    setIsLongBreak,
    setUltraFocusMode,
    ultraFocusMode,
  } = useTimer();

  useEffect(() => {
    const syncState = async () => {
      const result = await chrome.storage.local.get(["time"]);
      setTime((result.time as number) ?? 0);
    };

    syncState();

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      Object.entries(changes).forEach(([key, { newValue }]) => {
        if (key === "time") setTime(newValue ?? 0);
        if (key === "isRunning") setIsRunning(newValue ?? false);
        if (key === "isBreak") setIsBreak(newValue ?? false);
        if (key === "isLongBreak") setIsLongBreak(newValue ?? false);
        if (key === "ultraFocusMode") setUltraFocusMode(newValue ?? false);
      });
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const startTimer = () => {
    chrome.runtime.sendMessage({ type: "start-timer" });
  };

  const stopTimer = () => {
    chrome.runtime.sendMessage({ type: "stop-timer" });
  };

  const skipTimer = debounce(() => {
    chrome.storage.local.set({ time: 0 });
  }, 1000);

  const formatTimer = (time: number) => {
    if (time <= 0) return "00:00";

    const sliceStart = time >= ONE_HOUR ? 11 : 14;

    return new Date(time).toISOString().slice(sliceStart, 19);
  };

  return (
    <TabsContent
      value="timer"
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="text-center space-y-2 mt-6">
        {ultraFocusMode && (
          <p className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] px-4 bg-primary-custom text-white rounded-full">
            Ultra Focus Mode! 🔥
          </p>
        )}
        <p
          className={`${
            isBreak ? "text-red-500" : "text-primary-custom"
          } text-5xl font-bold `}
        >
          {formatTimer(time)}
        </p>
        <h1
          className={`${
            isBreak ? "text-red-500" : "text-primary-custom"
          } text-xl text-center font-semibold mb-2`}
        >
          {!isRunning && !isBreak && "Ready? Start! 🚀"}
          {isRunning && !isBreak && "Focus time! ⚡"}
          {isRunning && isBreak && !isLongBreak && "Quick break! ☀️"}
          {isRunning && isBreak && isLongBreak && "Long Break! ✨"}
        </h1>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2">
        {isRunning ? (
          <>
            <Button
              size="sm"
              variant="destructive"
              className="min-w-28 bg-red-100 text-red-600 border  hover:bg-red-100/80"
              onClick={stopTimer}
            >
              Stop
            </Button>
            {isBreak && (
              <Button
                size="sm"
                variant="outline"
                className="min-w-28 bg-primary-custom hover:bg-primary-custom/80 text-white hover:text-white"
                onClick={skipTimer}
              >
                Skip
              </Button>
            )}
          </>
        ) : (
          <Button
            size="sm"
            className="min-w-28 bg-primary-custom hover:bg-primary-custom/90"
            onClick={startTimer}
          >
            Start
          </Button>
        )}
      </div>

      {isRunning && <TodoProgress />}
    </TabsContent>
  );
};

export default PomodoroTimer;
