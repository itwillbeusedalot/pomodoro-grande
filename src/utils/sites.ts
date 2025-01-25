export const getBlockedSites = async (): Promise<string[]> => {
  // blockedSites: ['example.com']
  const { blockedSites } = await chrome.storage.local.get("blockedSites");
  return blockedSites;
};

export const getAllowedUrls = async (): Promise<string[]> => {
  // allowedUrls: ['https://www.example.com']
  const { allowedUrls } = await chrome.storage.local.get("allowedUrls");
  return allowedUrls;
};

export const isBlockedSite = async (url: string): Promise<boolean> => {
  const normalizedUrl = new URL(url);
  const urlHostname = normalizedUrl.hostname.replace(/^www\./, "");

  const allowedUrls = (await getAllowedUrls()) || [];
  if (allowedUrls.some((site) => normalizedUrl.href === site)) return false;

  const blockedSites = (await getBlockedSites()) || [];
  return blockedSites.some((site) => urlHostname === site);
};

export const blockAllSites = async (): Promise<void> => {
  let ruleId = 1;
  const allowedUrls = (await getAllowedUrls()) || [];

  const allowedRules = allowedUrls.map((site) => ({
    id: ruleId++,
    priority: 2,
    action: { type: "allow" },
    condition: {
      urlFilter: site,
      resourceTypes: ["main_frame"],
    },
  }));

  const blockedSites = (await getBlockedSites()) || [];

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

export const unBlockAllSites = async (): Promise<void> => {
  const existingRuleIds = await getBlockedSiteIds();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
  });
};

export const getBlockedSiteIds = async (): Promise<number[]> => {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    return rules.map((rule) => rule.id);
  } catch (error) {
    console.error("Error getting existing rules:", error);
    return [];
  }
};
