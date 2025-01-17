const WORK_TIME = 1000 * 60 * 1;
const BREAK_TIME = 1000 * 60 * 1;
const SESSIONS = 4;

let isRunning = false;
let time = WORK_TIME;
let interval;
let isBreak = false;
let sessions = SESSIONS;

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
});

chrome.storage.onChanged.addListener((changes) => {
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
      updateBadge(time);
    }
  }

  if (changes.isBreak) {
    isBreak = changes.isBreak.newValue;
  }
});

const startTimer = () => {
  clearInterval(interval);

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
  chrome.storage.local.set({ isRunning, time });
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
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
