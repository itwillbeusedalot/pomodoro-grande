type NotificationOptions = {
  title: string;
  message: string;
};

export const createNotification = ({
  title,
  message,
}: NotificationOptions): void => {
  const notificationId = `reset-notif-${Date.now()}`;

  chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("assets/images/icon128.png"),
    title,
    message,
    priority: 2,
  });

  setTimeout(() => {
    chrome.notifications.clear(notificationId);
  }, 1000 * 30);
};
