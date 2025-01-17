const WORK_TIME = 1000 * 60 * 25;
const BREAK_TIME = 1000 * 60 * 5;

let isRunning = false;
let time = WORK_TIME;
let interval;
let isBreak = false;

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
    time -= 1000;

    if (time <= 0) {
      isBreak = !isBreak;
      time = isBreak ? BREAK_TIME : WORK_TIME;
      chrome.storage.local.set({ isBreak, time });

      const badgeColor = isBreak ? "#ffccd5" : "#40A662";
      chrome.action.setBadgeBackgroundColor({ color: badgeColor });
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
  chrome.storage.local.set({ isRunning, time });
  chrome.action.setBadgeBackgroundColor({ color: "#40A662" });
  updateBadge(time);
};

const updateBadge = (time) => {
  const formattedTime = new Date(time).toISOString().slice(14, 19);
  chrome.action.setBadgeText({ text: formattedTime });
};
