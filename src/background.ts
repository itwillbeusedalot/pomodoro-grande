type NotificationOptions = {
  title: string;
  message: string;
};

type Changes = {
  time?: number;
  workTime?: number;
  isRunning?: boolean;
  breakTime?: number;
  selectedSound?: string;
  isSoundEnabled?: boolean;
  soundVolume?: number;
  longBreak?: number;
  isNotificationEnabled?: boolean;
};

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
let sessionCount = 0;

let selectedSound = "clock.mp3";
let isSoundEnabled = true;
let soundVolume = 0.5;

let isNotificationEnabled = true;

const updateVariables = (changes: Changes): void => {
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
  (result) => updateVariables(result as Changes)
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
  const newChanges: Changes = Object.fromEntries(
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
    console.log(time);

    if (time <= 0) {
      handleTimeEnds();
    } else {
      chrome.storage.local.set({ time });
    }

    updateBadge(time);
  }, 1000);
};

const stopTimer = (): void => {
  clearInterval(interval);
  time = WORK_TIME;
  isRunning = false;
  isBreak = false;
  sessionCount = 0;
  chrome.storage.local.set({ isRunning, time, isBreak });
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
  unBlockAllSites();
};

const handleTimeEnds = (): void => {
  if (selectedSound && isSoundEnabled) {
    playSound();
  }

  sessionCount = isBreak ? sessionCount : sessionCount + 1;
  isBreak = !isBreak;

  if (isBreak) {
    unBlockAllSites();
  } else {
    blockAllSites();
  }

  if (isBreak && sessionCount % 4 === 0) {
    time = LONG_BREAK_TIME;
    chrome.storage.local.set({ isBreak, time, isLongBreak: true });

    createNotification({
      title: "Long Break! ✨",
      message: "Fantastic work session! Time for a proper recharge!",
    });
  } else {
    time = isBreak ? BREAK_TIME : WORK_TIME;
    chrome.storage.local.set({ isBreak, time, isLongBreak: false });

    createNotification({
      title: isBreak ? "Quick break! ☀️" : "Focus time! ⚡",
      message: isBreak ? "Take a break and recharge." : "Let's get to work!",
    });
  }

  const badgeColor = isBreak ? "#ffccd5" : "#40A662";
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
};

const updateBadge = (time: number): void => {
  const formattedTime = new Date(time).toISOString().slice(14, 19);
  chrome.action.setBadgeText({ text: formattedTime });
};

const createNotification = ({ title, message }: NotificationOptions): void => {
  if (!isNotificationEnabled) return;

  const notificationId = `reset-notif-${Date.now()}`;

  chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("assets/images/icon128.png"),
    title,
    message,
    priority: 2,
  });

  setTimeout(() => {
    chrome.notifications.clear(notificationId);
  }, 1000 * 30);
};

const blockAllSites = async (): Promise<void> => {
  let ruleId = 1;
  const allowedUrls = await getAllowedUrls();

  const allowedRules = allowedUrls.map((site) => ({
    id: ruleId++,
    priority: 2,
    action: { type: "allow" },
    condition: {
      urlFilter: site,
      resourceTypes: ["main_frame"],
    },
  }));

  const blockedSites = await getBlockedSites();

  const blockedRules = blockedSites.map((site) => ({
    id: ruleId++,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `||${site}/`,
      resourceTypes: ["main_frame"],
    },
  }));

  const rules = [...allowedRules, ...blockedRules];

  try {
    const existingRuleIds = await getBlockedSiteIds();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      // @ts-ignore
      addRules: rules,
    });
  } catch (error) {
    console.error("Error updating rules:", error);
  }
};

const unBlockAllSites = async (): Promise<void> => {
  const existingRuleIds = await getBlockedSiteIds();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
  });
};

const getBlockedSiteIds = async (): Promise<number[]> => {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    return rules.map((rule) => rule.id);
  } catch (error) {
    console.error("Error getting existing rules:", error);
    return [];
  }
};

const getBlockedSites = async (): Promise<string[]> => {
  const { blockedSites } = await chrome.storage.local.get("blockedSites");
  return blockedSites || BLOCKED_SITES;
};

const getAllowedUrls = async (): Promise<string[]> => {
  const { allowedUrls } = await chrome.storage.local.get("allowedUrls");
  return allowedUrls || [];
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
