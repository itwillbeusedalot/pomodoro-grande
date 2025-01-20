let isRunning = false;
let time = 0;
let isBreak = false;

// Initialize state from storage
chrome.storage.local.get(["time", "isRunning", "isBreak"], async (result) => {
  time = result.time ?? 0;
  isRunning = result.isRunning ?? false;
  isBreak = result.isBreak ?? false;

  if (isBreak) return removeFocusOverlay();

  const currentUrl = window.location.href;

  if (isRunning && !isBreak && (await isBlockedSite(currentUrl))) {
    createFocusOverlay();
  } else {
    removeFocusOverlay();
  }
});

// Listen for changes to storage
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.isRunning) {
    isRunning = changes.isRunning.newValue;
  }

  if (changes.time) {
    time = changes.time.newValue;
  }

  if (changes.isBreak) {
    isBreak = changes.isBreak.newValue;
    if (isBreak) return removeFocusOverlay();
  }

  const currentUrl = window.location.href;

  if (isRunning && !isBreak && (await isBlockedSite(currentUrl))) {
    createFocusOverlay();
  } else {
    removeFocusOverlay();
  }
});

//*****************BLOCKING******************** */

const getBlockedSites = async () => {
  const { blockedSites } = await chrome.storage.local.get("blockedSites");
  return blockedSites || [];
};

const getAllowedUrls = async () => {
  const { allowedUrls } = await chrome.storage.local.get("allowedUrls");
  return allowedUrls || [];
};

const isBlockedSite = async (url) => {
  const allowedUrls = await getAllowedUrls();
  if (allowedUrls.some((site) => url.includes(site))) return false;

  const blockedSites = await getBlockedSites();
  return blockedSites.some((site) => url.includes(site));
};

//*****************OVERLAY******************** */

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
    overlay.style.pointerEvents = "all";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  overlay.innerHTML = `
    <h1 style="margin-bottom: 20px; font-size: 48px; text-align: center">Almost there! Keep up the good work!</h1>
    <p style="font-size: 20px;">Time remaining: ${new Date(time)
      .toISOString()
      .slice(14, 19)}</p>
  `;
};

const removeFocusOverlay = () => {
  const overlay = document.getElementById("focus-overlay");
  if (overlay) {
    overlay.remove();
    document.body.style.overflow = "auto";
    window.removeEventListener("keydown", () => {
      return;
    });
  }
};
