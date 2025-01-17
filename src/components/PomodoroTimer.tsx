import { TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

const PomodoroTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    const syncState = async () => {
      const result = await browser.storage.local.get([
        "time",
        "isRunning",
        "isBreak",
      ]);
      setTime((result.time as number) ?? 0);
      setIsRunning((result.isRunning as boolean) ?? false);
      setIsBreak((result.isBreak as boolean) ?? false);
    };

    syncState();

    const handleStorageChange = (changes: any) => {
      if (changes.time) setTime(changes.time.newValue);
      if (changes.isRunning) setIsRunning(changes.isRunning.newValue);
      if (changes.isBreak) setIsBreak(changes.isBreak.newValue);
    };

    browser.storage.onChanged.addListener(handleStorageChange);
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const startTimer = () => {
    browser.storage.local.set({ isRunning: true, isBreak: false });
  };

  const stopTimer = () => {
    browser.storage.local.set({
      isRunning: false,
      isBreak: false,
    });
  };

  return (
    <TabsContent
      value="timer"
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="text-center space-y-2 mt-10">
        <p
          className={`${
            isBreak ? "text-red-500" : "text-primary-custom"
          } text-5xl font-bold `}
        >
          {time > 0 ? new Date(time).toISOString().slice(14, 19) : "00:00"}
        </p>
        <h1
          className={`${
            isBreak ? "text-red-500" : "text-primary-custom"
          } text-xl text-center font-semibold mb-2`}
        >
          {isBreak ? "Break" : "Work"} time!
        </h1>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2">
        {isRunning ? (
          <Button
            size="sm"
            variant="destructive"
            className="min-w-28 bg-red-100 text-red-600 border  hover:bg-red-100/80"
            onClick={stopTimer}
          >
            Stop
          </Button>
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
    </TabsContent>
  );
};

export default PomodoroTimer;
