import { ONE_MINUTE } from "@/constants";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

const WORKING_OPTIONS = [1, 15, 25, 35, 45];
const BREAK_OPTIONS = [1, 5, 10, 15, 20];
const SESSION_OPTIONS = [1, 2, 3, 4, 5];

const Settings = () => {
  const [time, setTime] = useState(
    (WORKING_OPTIONS[1] * ONE_MINUTE).toString()
  );
  const [breakTime, setBreakTime] = useState(
    (BREAK_OPTIONS[0] * ONE_MINUTE).toString()
  );
  const [sessions, setSessions] = useState("1");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await browser.storage.local.get([
        "time",
        "breakTime",
        "sessions",
        "isRunning",
      ]);

      setTime((data.time ?? WORKING_OPTIONS[1] * ONE_MINUTE).toString());
      setBreakTime(
        (data.breakTime ?? BREAK_OPTIONS[0] * ONE_MINUTE).toString()
      );
      setSessions((data.sessions as number).toString() ?? "1");
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
    <div className="w-full space-y-4 text-center">
      <h1 className="text-lg text-center font-semibold mb-2">Settings</h1>

      {/* <div className="flex items-center justify-between">
        <p>Notifications</p>

        <Switch className={`data-[state=checked]:bg-primary-custom`} />
      </div> */}

      <div className="flex items-center justify-between">
        <p>Work time</p>

        <Select
          disabled={isRunning}
          value={time}
          onValueChange={handleWorkTimeChange}
          defaultValue={time}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {WORKING_OPTIONS.map((option) => (
              <SelectItem key={option} value={(ONE_MINUTE * option).toString()}>
                {option} minutes
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {BREAK_OPTIONS.map((option) => (
              <SelectItem key={option} value={(ONE_MINUTE * option).toString()}>
                {option} minutes
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {SESSION_OPTIONS.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Settings;
