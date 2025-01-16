import Header from "./common/Header";
import Navbar from "./common/Navbar";
import Settings from "./Settings";
import SiteBlocker from "./SiteBlocker";
import { Tabs, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { FIVE_MINUTES, DEFAULT_TIME, ONE_HOUR } from "@/constants";
import browser from "webextension-polyfill";

const PomodoroTimer = () => {
  const [time, setTime] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    browser.storage.local.get("time").then((result) => {
      if (result.time) setTime(result.time as number);
    });

    browser.storage.local.get("isRunning").then((result) => {
      setIsRunning((result.isRunning as boolean) || false);
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (prev === 0) {
            clearInterval(interval);
            stopTimer();
            return 0;
          }

          browser.storage.local.set({ time: prev - 1000, isRunning: true });
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  useEffect(() => {
    browser.runtime.sendMessage({
      type: "updateBadge",
      text: time,
    });
  }, [time]);

  const startTimer = () => {
    setIsRunning(true);
    browser.storage.local.set({ time, isRunning: true });
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTime(DEFAULT_TIME);
    browser.storage.local.set({ time: DEFAULT_TIME, isRunning: false });
  };

  return (
    <TabsContent
      value="timer"
      className="flex flex-col items-center justify-center gap-6"
    >
      <p className="text-5xl font-bold text-primary-custom mt-10">
        {new Date(time).toISOString().slice(14, 19)}
      </p>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <Button
          size="sm"
          className="bg-secondary-custom shadow-none text-primary-custom border hover:bg-secondary-custom/50"
          onClick={() =>
            setTime((prev) => {
              if (prev + FIVE_MINUTES >= ONE_HOUR) return ONE_HOUR - 1000;
              return Math.min(prev + FIVE_MINUTES, ONE_HOUR);
            })
          }
          disabled={time >= ONE_HOUR}
        >
          + 5 mins
        </Button>
        <Button
          size="sm"
          className="bg-secondary-custom shadow-none text-primary-custom border  hover:bg-secondary-custom/50"
          onClick={() =>
            setTime((prev) => Math.max(prev - FIVE_MINUTES, FIVE_MINUTES))
          }
          disabled={isRunning || time <= FIVE_MINUTES}
        >
          - 5 mins
        </Button>
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
