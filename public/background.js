const DEFAULT_TIME = 1000 * 60 * 25;

let isRunning = false;
let time = DEFAULT_TIME;
let interval;

chrome.storage.local.get(["time", "isRunning"], (result) => {
  time = result.time ?? DEFAULT_TIME;
  isRunning = result.isRunning ?? false;

  if (isRunning && time > 0) {
    startTimer();
  } else {
    updateBadge(time);
  }
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
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "updateBadge") {
    if (message.text) updateBadge(message.text);
  }
});

const startTimer = () => {
  clearInterval(interval);

  interval = setInterval(() => {
    time -= 1000;

    if (time <= 0) {
      time = DEFAULT_TIME;
      stopTimer();

      chrome.storage.local.set({ isRunning: false, time });
    } else {
      if (time % 1000 === 0) {
        updateBadge(time);
      }
    }

    updateBadge(time);
  }, 1000);
};

const stopTimer = () => {
  clearInterval(interval);
  updateBadge(DEFAULT_TIME);
};

const updateBadge = (time) => {
  const formattedTime = new Date(time).toISOString().slice(14, 19);
  chrome.action.setBadgeText({ text: formattedTime });
};
