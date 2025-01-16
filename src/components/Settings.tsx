import { Switch } from "./ui/switch";

const Settings = () => {
  return (
    <div className="flex items-center justify-between">
      <p>Notifications</p>

      <Switch disabled className={`data-[state=checked]:bg-primary-custom`} />
    </div>
  );
};

export default Settings;
