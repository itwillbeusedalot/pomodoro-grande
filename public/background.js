const REDIRECT_URL = "https://example.com";

let isEnabled = true;

chrome.storage.local.get("isEnabled", (result) => {
  isEnabled = result.isEnabled ?? true;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
    console.log("Blocking state changed:", isEnabled);
  }
});

const getBlockedSites = async () => {
  const { urls } = await chrome.storage.local.get("urls");
  return urls || [];
};

const isBlockedSite = (url, blockedSites) => {
  return blockedSites.some((site) => url.includes(site));
};

const handleRequests = async (details) => {
  if (!isEnabled) return { cancel: false };

  if (details.url.includes(REDIRECT_URL)) {
    return { cancel: false };
  }

  const blockedSites = await getBlockedSites();

  if (isBlockedSite(details.url, blockedSites)) {
    return { redirectUrl: REDIRECT_URL };
  }

  return { cancel: false };
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!isEnabled) return;

  // Only check when the URL has changed and the page has finished loading
  if (changeInfo.url || (changeInfo.status === "complete" && tab.url)) {
    const url = changeInfo.url || tab.url;

    if (url.includes(REDIRECT_URL)) return;

    const blockedSites = await getBlockedSites();

    if (isBlockedSite(url, blockedSites)) {
      chrome.tabs.update(tabId, { url: REDIRECT_URL });
    }
  }
});

chrome.webRequest.onBeforeRequest.addListener(handleRequests, {
  urls: ["<all_urls>"],
});
