import { Switch } from "./ui/switch";

const Settings = () => {
  return (
    <div className="flex items-center justify-between">
      <span className=" font-medium">Enable Blocker</span>

      <Switch className={`data-[state=checked]:bg-primary-custom`} />
    </div>
  );
};

export default Settings;
