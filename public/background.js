let WORK_TIME = 1000 * 60 * 25;
let BREAK_TIME = 1000 * 60 * 5;
let SESSIONS = 4;

let isRunning = false;
let time = WORK_TIME;
let interval;
let isBreak = false;
let sessions = SESSIONS;

const getBlockedSites = async () => {
  const { urls } = await chrome.storage.local.get("urls");
  return urls || [];
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
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

  if (changes.urls && isRunning) {
    blockAllSites();
  }

  if (changes.sessions) {
    sessions = changes.sessions.newValue;

    if (!isRunning) {
      SESSIONS = changes.sessions.newValue;
    }
  }
});

const startTimer = () => {
  clearInterval(interval);
  blockAllSites();

  interval = setInterval(() => {
    if (sessions === 0) {
      return stopTimer();
    }

    time -= 1000;

    if (time <= 0) {
      isBreak = !isBreak;
      time = isBreak ? BREAK_TIME : WORK_TIME;
      sessions = isBreak ? sessions : sessions - 1;
      chrome.storage.local.set({ isBreak, time, sessions });

      const badgeColor = isBreak ? "#ffccd5" : "#40A662";
      chrome.action.setBadgeBackgroundColor({ color: badgeColor });
      createNotification();

      if (isBreak) {
        unBlockAllSites();
      } else {
        blockAllSites();
      }
    } else {
      chrome.storage.local.set({ time });
    }

    updateBadge(time);
  }, 1000);
};

const stopTimer = async () => {
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

const updateBadge = (time) => {
  const formattedTime = new Date(time).toISOString().slice(14, 19);
  chrome.action.setBadgeText({ text: formattedTime });
};

const createNotification = () => {
  chrome.notifications.create("reset-notif", {
    type: "basic",
    iconUrl: "https://www.pngfind.com/images/lazy-bg.png",
    title: isBreak ? "Break Time!" : "Work Time!",
    message: `Time left: ${new Date(time).toISOString().slice(14, 19)}`,
  });

  setTimeout(() => {
    chrome.notifications.clear("reset-notif");
  }, 5000);
};

const blockAllSites = async () => {
  const blockedSites = await getBlockedSites();

  const rules = blockedSites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `||${site}/`,
      resourceTypes: ["main_frame"],
    },
  }));

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
