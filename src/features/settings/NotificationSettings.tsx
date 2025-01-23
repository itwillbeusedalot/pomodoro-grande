import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

const NotificationSettings = () => {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const handleEnableNotication = (value: boolean) => {
    setIsNotificationEnabled(value);
    browser.storage.local.set({ isNotificationEnabled: value });
  };

  useEffect(() => {
    const result = browser.storage.local.get("isNotificationEnabled");
    result.then((data) => {
      setIsNotificationEnabled((data.isNotificationEnabled as boolean) ?? true);
    });
  }, []);

  return (
    <div className="w-full space-y-2">
      <h1 className="text-base text-center font-semibold ">
        Notification Settings
      </h1>

      <div className="flex items-center justify-between">
        <p>Enable Notification</p>
        <Switch
          className={`data-[state=checked]:bg-primary-custom`}
          checked={isNotificationEnabled}
          onCheckedChange={handleEnableNotication}
        />
      </div>
    </div>
  );
};

export default NotificationSettings;
