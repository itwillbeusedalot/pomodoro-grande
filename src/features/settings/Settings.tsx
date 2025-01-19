import { Switch } from "@/components/ui/switch";
import TimerSettings from "./TimerSettings";

const Settings = () => {
  return (
    <div className="w-full space-y-4 text-center ">
      <TimerSettings />

      <div className="w-full h-px bg-border"></div>

      <div className="w-full space-y-2">
        <h1 className="text-base text-center font-semibold ">Sound Settings</h1>

        <div className="flex items-center justify-between">
          <p>Enable Sound</p>

          <Switch className={`data-[state=checked]:bg-primary-custom`} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
