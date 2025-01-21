let WORK_TIME = 1000 * 60 * 25;
let BREAK_TIME = 1000 * 60 * 5;
let LONG_BREAK_TIME = 1000 * 60 * 15;
let BLOCKED_SITES = [
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

let interval;
let time = WORK_TIME;
let sessionCount = 0;

let selectedSound = "clock.mp3";
let isSoundEnabled = true;
let soundVolume = 0.5;

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
  ],
  (result) => {
    WORK_TIME = result.workTime ?? WORK_TIME;
    time = result.time ?? WORK_TIME;
    BREAK_TIME = result.breakTime ?? BREAK_TIME;
    isRunning = result.isRunning ?? false;
    selectedSound = result.selectedSound ?? selectedSound;
    isSoundEnabled = result.isSoundEnabled ?? isSoundEnabled;
    soundVolume = result.soundVolume ?? soundVolume;
    LONG_BREAK_TIME = result.longBreak ?? LONG_BREAK_TIME;
  }
);

//*************************EVENT LISTENERS************************* */

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

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.isRunning) {
    isRunning = changes.isRunning.newValue;

    if (isRunning) {
      startTimer();
    } else {
      stopTimer();
    }
  }

  if (changes.time) {
    time = changes.time.newValue;
    // Store the initial value of WORK_TIME to reset the value of "time" when all sessions are completed
    // if (!isRunning) {
    //   WORK_TIME = changes.time.newValue;
    //   updateBadge(WORK_TIME);
    // }
  }

  if (changes.workTime) {
    WORK_TIME = changes.workTime.newValue;
    updateBadge(WORK_TIME);
  }

  if (changes.breakTime) {
    BREAK_TIME = changes.breakTime.newValue;
  }

  if (changes.longBreak) {
    LONG_BREAK_TIME = changes.longBreak.newValue;
  }

  if (changes.isBreak) {
    isBreak = changes.isBreak.newValue;
  }

  if ((changes.blockedSites || changes.allowedUrls) && isRunning) {
    blockAllSites();
  }

  if (changes.selectedSound) {
    selectedSound = changes.selectedSound.newValue;
  }

  if (changes.isSoundEnabled) {
    isSoundEnabled = changes.isSoundEnabled.newValue;
  }

  if (changes.soundVolume) {
    soundVolume = changes.soundVolume.newValue;
  }
});

//*****************TIMER******************** */

const startTimer = () => {
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

const stopTimer = () => {
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

const handleTimeEnds = () => {
  if (selectedSound && isSoundEnabled) {
    playSound();
  }

  // Increment session count after work time ends
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

const handleAllSessionsCompleted = () => {
  createNotification({
    title: "All sessions completed! Time to take a long break!",
    message: "You can start another session by clicking on the extension icon.",
  });

  return stopTimer();
};

const updateBadge = (time) => {
  const formattedTime = new Date(time).toISOString().slice(14, 19);
  chrome.action.setBadgeText({ text: formattedTime });
};

const createNotification = ({ title, message }) => {
  chrome.notifications.create("reset-notif", {
    type: "basic",
    iconUrl: "https://www.pngfind.com/images/lazy-bg.png",
    title,
    message,
  });

  setTimeout(() => {
    chrome.notifications.clear("reset-notif");
  }, 1000 * 60);
};

//*****************BLOCKING SITES******************** */

const blockAllSites = async () => {
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
      addRules: rules,
    });
  } catch (error) {
    console.error("Error updating rules:", error);
  }
};

const unBlockAllSites = async () => {
  const existingRuleIds = await getBlockedSiteIds();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
  });
};

const getBlockedSiteIds = async () => {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    return rules.map((rule) => rule.id);
  } catch (error) {
    console.error("Error getting existing rules:", error);
    return [];
  }
};

const getBlockedSites = async () => {
  const { blockedSites } = await chrome.storage.local.get("blockedSites");
  return blockedSites || BLOCKED_SITES;
};

const getAllowedUrls = async () => {
  const { allowedUrls } = await chrome.storage.local.get("allowedUrls");
  return allowedUrls || [];
};

//*****************SOUND******************** */
function ensureOffscreenDocument(callback) {
  chrome.offscreen.hasDocument().then((hasDocument) => {
    if (!hasDocument) {
      chrome.offscreen
        .createDocument({
          url: chrome.runtime.getURL("offscreen.html"),
          reasons: ["AUDIO_PLAYBACK"],
          justification: "Play notification sounds for timers",
        })
        .then(() => {
          if (callback) callback(); // Ensure the document is created before sending the message
        });
    } else {
      if (callback) callback();
    }
  });
}

function playSound() {
  ensureOffscreenDocument(() => {
    chrome.runtime.sendMessage({
      action: "playSound",
      isSoundEnabled,
      selectedSound,
      soundVolume,
    });
  });
}
