import { ONE_MINUTE } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

const WORKING_OPTIONS = [1, 15, 20, 25, 30, 45, 50].map((option) =>
  (option * ONE_MINUTE).toString()
);

const BREAK_OPTIONS = [1, 3, 5, 7, 10].map((option) =>
  (option * ONE_MINUTE).toString()
);

const LONG_BREAK_OPTIONS = [1, 15, 20, 25, 30].map((option) =>
  (option * ONE_MINUTE).toString()
);

const TimerSettings = () => {
  const [time, setTime] = useState(WORKING_OPTIONS[2]);
  const [breakTime, setBreakTime] = useState(BREAK_OPTIONS[1]);
  const [isRunning, setIsRunning] = useState(false);
  const [longBreak, setLongBreak] = useState(LONG_BREAK_OPTIONS[1]);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await browser.storage.local.get([
        "breakTime",
        "isRunning",
        "longBreak",
        "workTime",
      ]);

      setTime(data?.workTime?.toString() ?? WORKING_OPTIONS[2]);
      setBreakTime(data?.breakTime?.toString() ?? BREAK_OPTIONS[1]);
      setIsRunning((data.isRunning as boolean) ?? false);
      setLongBreak(data?.longBreak?.toString() ?? LONG_BREAK_OPTIONS[1]);
    };

    loadSettings();
  }, []);

  const handleWorkTimeChange = (value: string) => {
    setTime(value);
    browser.storage.local.set({
      time: parseInt(value),
      workTime: parseInt(value),
    });
  };

  const handleBreakTimeChange = (value: string) => {
    setBreakTime(value);
    browser.storage.local.set({ breakTime: parseInt(value) });
  };

  const handleLongBreakChange = (value: string) => {
    setLongBreak(value);
    browser.storage.local.set({ longBreak: parseInt(value) });
  };

  return (
    <div className="w-full space-y-2">
      <h1 className="text-base text-center font-semibold mb-2">
        Timer Settings
      </h1>

      <div className="flex items-center justify-between">
        <p>Work</p>

        <Select
          disabled={isRunning}
          value={time}
          onValueChange={handleWorkTimeChange}
          defaultValue={time}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {WORKING_OPTIONS.map((option) => {
              const value = Number(option) / ONE_MINUTE;
              return (
                <SelectItem key={option} value={option}>
                  {value} {value > 1 ? "minutes" : "minute"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p>Short Break</p>

        <Select
          disabled={isRunning}
          value={breakTime}
          onValueChange={handleBreakTimeChange}
          defaultValue={breakTime}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {BREAK_OPTIONS.map((option) => {
              const value = Number(option) / ONE_MINUTE;
              return (
                <SelectItem key={option} value={option}>
                  {value} {value > 1 ? "minutes" : "minute"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p>Long Break</p>

        <Select
          disabled={isRunning}
          value={longBreak}
          onValueChange={handleLongBreakChange}
          defaultValue={longBreak}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {LONG_BREAK_OPTIONS.map((option) => {
              const value = Number(option) / ONE_MINUTE;
              return (
                <SelectItem key={option} value={option}>
                  {value} {value > 1 ? "minutes" : "minute"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TimerSettings;
