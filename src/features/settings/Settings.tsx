import TimerSettings from "./TimerSettings";
import SoundSettings from "./SoundSettings";
import NotificationSettings from "./NotificationSettings";

const Settings = () => {
  return (
    <div className="w-full space-y-4 text-center ">
      <TimerSettings />

      <div className="w-full h-px bg-border"></div>

      <SoundSettings />

      <div className="w-full h-px bg-border"></div>

      <NotificationSettings />

      <div className="w-full h-px bg-border"></div>

      <ul className="space-y-1">
        <li>
          <a
            href="https://chromewebstore.google.com/detail/pomodoro-grande/hmkklgcpkihbecjbohepediganhefdof/reviews"
            target="_blank"
            className="hover:underline"
          >
            Write a Review
          </a>
        </li>
        <li>
          <a
            href="mailto:gemmueldelacruz@gmail.com"
            target="_blank"
            className="hover:underline"
          >
            Report an Issue
          </a>
        </li>
        <li>
          <a
            href="https://buymeacoffee.com/bulletonli"
            target="_blank"
            className="hover:underline"
          >
            Buy me a tomato
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Settings;
