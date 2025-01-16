const DEFAULT_TIME = 1000 * 60 * 25;
let isRunning = false;
let time = DEFAULT_TIME;

const createFocusOverlay = () => {
  let overlay = document.getElementById("focus-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "focus-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    overlay.style.fontFamily = "Arial, sans-serif";
    overlay.style.backdropFilter = "blur(4px)";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  overlay.innerHTML = `
    <h1 style="margin-bottom: 20px;">KEEP YOUR FOCUS!</h1>
    <p style="font-size: 24px;">${new Date(time)
      .toISOString()
      .slice(14, 19)}</p>
  `;
};

const removeFocusOverlay = () => {
  const overlay = document.getElementById("focus-overlay");
  if (overlay) {
    overlay.remove();
    document.body.style.overflow = "auto";
  }
};

// Initialize state from storage
chrome.storage.local.get(["time", "isRunning"], (result) => {
  time = result.time ?? DEFAULT_TIME;
  isRunning = result.isRunning ?? false;

  if (isRunning && time > 0) {
    createFocusOverlay();
  } else {
    removeFocusOverlay();
  }
});

// Listen for changes to storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isRunning) {
    isRunning = changes.isRunning.newValue;
  }

  if (changes.time) {
    time = changes.time.newValue;
  }

  if (isRunning) {
    createFocusOverlay();
  } else {
    removeFocusOverlay();
  }
});

const getBlockedSites = async () => {
  const { urls } = await chrome.storage.local.get("urls");
  return urls || [];
};

const isBlockedSite = (url, blockedSites) => {
  return blockedSites.some((site) => url.includes(site));
};
