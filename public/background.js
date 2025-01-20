let WORK_TIME = 1000 * 60 * 25;
let BREAK_TIME = 1000 * 60 * 5;
let SESSIONS = 4;
let BLOCKED_SITES = [
  "facebook.com",
  "twitter.com",
  "instagram.com",
  "x.com",
  "youtube.com",
];

let isRunning = false;
let time = WORK_TIME;
let interval;
let isBreak = false;
let sessions = SESSIONS;
let selectedSound = "clock.mp3";
let isSoundEnabled = true;
let soundVolume = 0.5;

//*************************EVENT LISTENERS************************* */

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
  chrome.storage.local.set({
    time,
    breakTime: BREAK_TIME,
    sessions,
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
    if (!isRunning) {
      WORK_TIME = changes.time.newValue;
      updateBadge(WORK_TIME);
    }
  }

  if (changes.breakTime) {
    BREAK_TIME = changes.breakTime.newValue;
  }

  if (changes.isBreak) {
    isBreak = changes.isBreak.newValue;
  }

  if ((changes.blockedSites || changes.allowedUrls) && isRunning) {
    blockAllSites();
  }

  if (changes.sessions) {
    sessions = changes.sessions.newValue;
    // Store the initial value of sessions to reset the value when all sessions are completed
    if (!isRunning) {
      SESSIONS = changes.sessions.newValue;
    }
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
    if (sessions === 0) {
      handleAllSessionsCompleted();
      return;
    }

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
  sessions = SESSIONS;
  chrome.storage.local.set({ isRunning, time, isBreak, sessions });
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
  unBlockAllSites();
};

const handleTimeEnds = () => {
  if (selectedSound && isSoundEnabled) {
    playSound();
  }

  isBreak = !isBreak;
  time = isBreak ? BREAK_TIME : WORK_TIME;
  sessions = isBreak ? sessions : sessions - 1;
  chrome.storage.local.set({ isBreak, time, sessions });

  const badgeColor = isBreak ? "#ffccd5" : "#40A662";
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });

  createNotification({
    title: isBreak ? "Break Time! ☀️" : "Work Time! ⏰",
    message: isBreak ? "Take a break and recharge." : "Let's get to work!",
  });

  if (isBreak) {
    unBlockAllSites();
  } else {
    blockAllSites();
  }
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
  }, 5000);
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
