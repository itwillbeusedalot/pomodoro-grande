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

const WORKING_OPTIONS = [1, 15, 25, 35, 45].map((option) =>
  (option * ONE_MINUTE).toString()
);

const BREAK_OPTIONS = [1, 5, 10, 15, 20].map((option) =>
  (option * ONE_MINUTE).toString()
);
const SESSION_OPTIONS = [1, 2, 3, 4, 5].map((option) => option.toString());

const TimerSettings = () => {
  const [time, setTime] = useState(WORKING_OPTIONS[2]);
  const [breakTime, setBreakTime] = useState(BREAK_OPTIONS[1]);
  const [sessions, setSessions] = useState(SESSION_OPTIONS[4]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await browser.storage.local.get([
        "time",
        "breakTime",
        "sessions",
        "isRunning",
      ]);

      setTime(data?.time?.toString() ?? WORKING_OPTIONS[2]);
      setBreakTime(data?.breakTime?.toString() ?? BREAK_OPTIONS[1]);
      setSessions(data?.sessions?.toString() ?? SESSION_OPTIONS[4]);
      setIsRunning((data.isRunning as boolean) ?? false);
    };

    loadSettings();
  }, []);

  const handleWorkTimeChange = (value: string) => {
    setTime(value);
    browser.storage.local.set({ time: parseInt(value) });
  };

  const handleBreakTimeChange = (value: string) => {
    setBreakTime(value);
    browser.storage.local.set({ breakTime: parseInt(value) });
  };

  const handleSessionsChange = (value: string) => {
    setSessions(value);
    browser.storage.local.set({ sessions: parseInt(value) });
  };

  return (
    <div className="w-full space-y-2">
      <h1 className="text-base text-center font-semibold mb-2">
        Timer Settings
      </h1>

      <div className="flex items-center justify-between">
        <p>Work time</p>

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
            {WORKING_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {Number(option) / ONE_MINUTE} minutes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p>Break time</p>

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
            {BREAK_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {Number(option) / ONE_MINUTE} minutes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p>Sessions</p>

        <Select
          disabled={isRunning}
          value={sessions}
          onValueChange={handleSessionsChange}
          defaultValue={sessions}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {SESSION_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TimerSettings;
