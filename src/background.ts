import { PomodoroHistory, StorageChanges, Todo } from "./types";
import { updateBadge } from "./utils/badgeExtension";
import { createNotification } from "./utils/notification";
import { blockAllSites, unBlockAllSites } from "./utils/sites";

let WORK_TIME = 1000 * 60 * 25;
let BREAK_TIME = 1000 * 60 * 5;
let LONG_BREAK_TIME = 1000 * 60 * 15;
let BLOCKED_SITES: string[] = [
  "facebook.com",
  "twitter.com",
  "instagram.com",
  "x.com",
  "youtube.com",
  "reddit.com",
  "netflix.com",
  "tiktok.com",
];

let isRunning = false;
let isBreak = false;

let interval: NodeJS.Timeout | undefined;
let time = WORK_TIME;
let pomodoroCount = 0; // 1 Work = 1 Pomodoro

let selectedSound = "clock.mp3";
let isSoundEnabled = true;
let soundVolume = 0.5;

let isNotificationEnabled = true;

let completedTodos: Todo[] = [];

const updateVariables = (changes: StorageChanges): void => {
  if (changes.time !== undefined) time = changes.time;
  if (changes.workTime) WORK_TIME = changes.workTime;
  if (changes.breakTime) BREAK_TIME = changes.breakTime;
  if (changes.longBreak) LONG_BREAK_TIME = changes.longBreak;

  if (changes.selectedSound) selectedSound = changes.selectedSound;
  if (changes.soundVolume !== undefined) soundVolume = changes.soundVolume;

  if (changes.isRunning !== undefined) isRunning = changes.isRunning;
  if (changes.isSoundEnabled !== undefined) {
    isSoundEnabled = changes.isSoundEnabled;
  }
  if (changes.isNotificationEnabled !== undefined) {
    isNotificationEnabled = changes.isNotificationEnabled;
  }
};

chrome.storage.local.get(
  [
    "time",
    "workTime",
    "isRunning",
    "breakTime",
    "selectedSound",
    "isSoundEnabled",
    "soundVolume",
    "longBreak",
    "isNotificationEnabled",
  ],
  (result) => updateVariables(result as StorageChanges)
);

chrome.runtime.onStartup.addListener(() => {
  stopTimer();
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
  chrome.storage.local.set({
    time,
    workTime: WORK_TIME,
    breakTime: BREAK_TIME,
    longBreak: LONG_BREAK_TIME,
    blockedSites: BLOCKED_SITES,
  });
});

chrome.storage.onChanged.addListener((changes) => {
  const newChanges: StorageChanges = Object.fromEntries(
    Object.entries(changes).map(([key, value]) => [key, value.newValue])
  );
  updateVariables(newChanges);

  if (changes.isRunning) {
    if (newChanges.isRunning) {
      startTimer();
    } else {
      stopTimer();
    }
  }

  if (changes.todos && newChanges.todos && isRunning) {
    completedTodos = newChanges.todos.filter((todo: Todo) => todo.isCompleted);
  }

  if ((changes.blockedSites || changes.allowedUrls) && isRunning) {
    blockAllSites();
  }

  if (changes.workTime) {
    updateBadge(WORK_TIME);
  }
});

const startTimer = (): void => {
  clearInterval(interval);
  blockAllSites();

  interval = setInterval(() => {
    time -= 1000;

    if (time <= 0) {
      handleTimeEnds();
    } else {
      chrome.storage.local.set({ time });
    }

    updateBadge(time);
  }, 1000);
};

const stopTimer = async (): Promise<void> => {
  if (pomodoroCount >= 1) {
    recordPomodoroHistory();
  }

  clearInterval(interval);
  time = WORK_TIME;
  isRunning = false;
  isBreak = false;
  await chrome.storage.local.set({ isRunning, time, isBreak });

  completedTodos = [];
  pomodoroCount = 0;
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
  unBlockAllSites();
};

const handleTimeEnds = (): void => {
  if (selectedSound && isSoundEnabled) {
    playSound();
  }

  pomodoroCount = isBreak ? pomodoroCount : pomodoroCount + 1;
  isBreak = !isBreak;

  if (isBreak) {
    unBlockAllSites();
  } else {
    blockAllSites();
  }

  if (isBreak && pomodoroCount % 4 === 0) {
    time = LONG_BREAK_TIME;
    chrome.storage.local.set({ isBreak, time, isLongBreak: true });

    if (isNotificationEnabled) {
      createNotification({
        title: "Long Break! ✨",
        message: "Fantastic work session! Time for a proper recharge!",
      });
    }
  } else {
    time = isBreak ? BREAK_TIME : WORK_TIME;
    chrome.storage.local.set({ isBreak, time, isLongBreak: false });

    if (isNotificationEnabled) {
      createNotification({
        title: isBreak ? "Quick break! ☀️" : "Focus time! ⚡",
        message: isBreak ? "Take a break and recharge." : "Let's get to work!",
      });
    }
  }

  const badgeColor = isBreak ? "#ffccd5" : "#40A662";
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
};

const ensureOffscreenDocument = (callback?: () => void): void => {
  chrome.offscreen.hasDocument().then((hasDocument) => {
    if (!hasDocument) {
      chrome.offscreen
        .createDocument({
          url: chrome.runtime.getURL("offscreen.html"),
          // @ts-ignore
          reasons: ["AUDIO_PLAYBACK"],
          justification: "Play notification sounds for timers",
        })
        .then(() => {
          if (callback) callback();
        });
    } else {
      if (callback) callback();
    }
  });
};

const playSound = (): void => {
  ensureOffscreenDocument(() => {
    chrome.runtime.sendMessage({
      action: "playSound",
      isSoundEnabled,
      selectedSound,
      soundVolume,
    });
  });
};

//*************** Pomodoro history *******************/
const recordPomodoroHistory = (): void => {
  chrome.storage.sync.get("pomodoroHistory", (result) => {
    const history: PomodoroHistory[] = result.pomodoroHistory || [];
    const newData = {
      createdAt: new Date().toLocaleString(),
      totalPomodoros: pomodoroCount,
      completedTodos: completedTodos.length,
      totalWorkTime: (pomodoroCount * WORK_TIME) / 1000 / 60,
    };
    history.unshift(newData);
    // Keep only the last 100 entries
    const trimmedHistory = history.slice(-100);
    chrome.storage.sync.set({ pomodoroHistory: trimmedHistory });
  });
};
