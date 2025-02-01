import TimerSettings from "./TimerSettings";
import SoundSettings from "./SoundSettings";
import NotificationSettings from "./NotificationSettings";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Bug,
  Clock,
  ExternalLink,
  HandHeart,
  Star,
} from "lucide-react";
import { useState } from "react";

const SettingsPage = () => {
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const goBack = () => setCurrentSection(null);

  if (currentSection) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-center">
          <button
            onClick={goBack}
            className="absolute left-2 hover:bg-primary-custom/20 hover:text-gray-800 p-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>

          <p className="text-base font-semibold text-center">
            {currentSection}
          </p>
        </div>

        {currentSection === "Timer Settings" && <TimerSettings />}
        {currentSection === "Sounds and Notifications" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-full h-px bg-border"></div>
              <div className="text-zinc-400 text-xs text-nowrap">
                Customize Sound
              </div>
              <div className="w-full h-px bg-border"></div>
            </div>
            <SoundSettings />
            <div className="flex items-center gap-2">
              <div className="w-full h-px bg-border"></div>
              <div className="text-zinc-400 text-xs text-nowrap">
                Notification Control
              </div>
              <div className="w-full h-px bg-border"></div>
            </div>
            <NotificationSettings />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <h1 className="text-base text-center font-semibold mb-2">
        General Settings
      </h1>

      <div>
        <MenuItem
          icon={<Clock className="size-5" />}
          title="Timer Settings"
          subtitle="Adjust your timer preferences"
          onClick={() => setCurrentSection("Timer Settings")}
        />
        <MenuItem
          icon={<BellRing className="size-5" />}
          title="Sounds and Notifications"
          subtitle="Customize your notification sounds"
          onClick={() => setCurrentSection("Sounds and Notifications")}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="w-full h-px bg-border"></div>
        <div className="text-zinc-400 text-nowrap">Feedback</div>
        <div className="w-full h-px bg-border"></div>
      </div>

      <div>
        <MenuItem
          icon={<Star className="size-5" />}
          title="Leave a Review"
          subtitle="Help us improve by leaving a review"
          url="https://chromewebstore.google.com/detail/pomodoro-grande/hmkklgcpkihbecjbohepediganhefdof/reviews"
          rightIcon={<ExternalLink className="w-4 h-4" />}
          external
        />
        <MenuItem
          icon={<Bug className="size-5" />}
          title="Report an Issue"
          subtitle="Found a bug? Report it here"
          url="https://x.com/BulletLang"
          rightIcon={<ExternalLink className="w-4 h-4" />}
          external
        />
        <MenuItem
          icon={<HandHeart className="size-5" />}
          title="Buy me a Tomato"
          subtitle="Send some Tomato Love"
          url="https://buymeacoffee.com/bulletonli"
          rightIcon={<ExternalLink className="w-4 h-4" />}
          external
        />
      </div>
    </div>
  );
};

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
  url?: string;
};

const MenuItem = ({
  icon,
  title,
  subtitle,
  rightIcon,
  onClick,
  external,
  url = "#",
}: MenuItemProps) => {
  const Wrapper = external ? "a" : "button";
  const wrapperProps = external
    ? {
        href: url,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : { onClick };

  return (
    <Wrapper
      {...wrapperProps}
      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left group hover:bg-primary-custom hover:text-white"
    >
      {icon}
      <div className="flex-1">
        <div className=" font-medium">{title}</div>
        <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
          {subtitle}
        </div>
      </div>
      <div className="text-primary-custom group-hover:text-zinc-200">
        {rightIcon}
      </div>
    </Wrapper>
  );
};

export default SettingsPage;
