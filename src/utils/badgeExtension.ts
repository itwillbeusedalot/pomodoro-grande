import { ONE_HOUR, ONE_MINUTE } from "@/constants";

export const updateBadge = (time: number): void => {
  const isMoreThanOneHour = time >= ONE_HOUR;

  const formattedTime = new Date(time).toISOString().slice(14, 19);

  const textBadge = isMoreThanOneHour
    ? `${Math.floor(time / ONE_MINUTE)}m`
    : formattedTime;

  chrome.action.setBadgeText({ text: textBadge });
};
