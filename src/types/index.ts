export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

export type StorageChanges = {
  time?: number;
  workTime?: number;
  breakTime?: number;
  longBreak?: number;

  isRunning?: boolean;
  isBreak?: boolean;

  isSoundEnabled?: boolean;
  selectedSound?: string;
  soundVolume?: number;
  isNotificationEnabled?: boolean;

  blockedSites?: string[];
  allowedUrls?: string[];
  todos?: Todo[];
};
