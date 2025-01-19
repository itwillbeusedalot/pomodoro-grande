import TimerSettings from "./TimerSettings";
import SoundSettings from "./SoundSettings";

const Settings = () => {
  return (
    <div className="w-full space-y-4 text-center ">
      <TimerSettings />

      <div className="w-full h-px bg-border"></div>

      <SoundSettings />
    </div>
  );
};

export default Settings;
