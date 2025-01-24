import React, { useEffect, useState, useCallback } from "react";
import "./content.css";

interface StorageChanges {
  isRunning?: boolean;
  time?: number;
  isBreak?: boolean;
  blockedSites?: string[];
  allowedUrls?: string[];
}

const createFocusOverlay = (): void => {
  let overlay = document.getElementById("focus-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "focus-overlay";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  overlay.innerHTML = `
    <div class='focus-overlay-footer'>
      <img src="${chrome.runtime.getURL(
        "assets/images/icon48.png"
      )}" alt="Tomato" />
      <p>Pomodoro Grande</p>
    </div>
    <h1>
      Don't let the tomato distract you!
    </h1>
  `;

  const tabKeyHandler = (e: KeyboardEvent): void => {
    if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  window.addEventListener("keydown", tabKeyHandler);

  // Store reference to cleanup the event listener later
  (overlay as any).tabKeyHandler = tabKeyHandler;
};

const removeFocusOverlay = (): void => {
  const overlay = document.getElementById("focus-overlay");
  if (overlay) {
    const tabKeyHandler = (overlay as any).tabKeyHandler;
    if (tabKeyHandler) {
      window.removeEventListener("keydown", tabKeyHandler);
    }

    overlay.remove();
    document.body.style.overflow = "auto";
  }
};

const Content: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  const getBlockedSites = async (): Promise<string[]> => {
    const { blockedSites } = await chrome.storage.local.get("blockedSites");
    return blockedSites || [];
  };

  const getAllowedUrls = async (): Promise<string[]> => {
    const { allowedUrls } = await chrome.storage.local.get("allowedUrls");
    return allowedUrls || [];
  };

  const isBlockedSite = async (url: string): Promise<boolean> => {
    const allowedUrls = await getAllowedUrls();
    if (allowedUrls.some((site) => url.includes(site))) return false;

    const blockedSites = await getBlockedSites();
    return blockedSites.some((site) => url.includes(site));
  };

  const handleOverlay = useCallback(async () => {
    if (isBreak) {
      removeFocusOverlay();
      return;
    }

    const currentUrl = window.location.href;
    const isBlocked = await isBlockedSite(currentUrl);

    if (isRunning && isBlocked) {
      createFocusOverlay();
    } else {
      removeFocusOverlay();
    }
  }, [isRunning, isBreak, time]);

  useEffect(() => {
    const fetchStorageData = async () => {
      const result: StorageChanges = await chrome.storage.local.get([
        "time",
        "isRunning",
        "isBreak",
      ]);
      setIsRunning(result.isRunning ?? false);
      setTime(result.time ?? 0);
      setIsBreak(result.isBreak ?? false);
    };

    fetchStorageData();

    const onStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      const updatedChanges: StorageChanges = Object.fromEntries(
        Object.entries(changes).map(([key, value]) => [key, value.newValue])
      );
      if (updatedChanges.isRunning !== undefined)
        setIsRunning(updatedChanges.isRunning);
      if (updatedChanges.isBreak !== undefined)
        setIsBreak(updatedChanges.isBreak);
    };

    chrome.storage.onChanged.addListener(onStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(onStorageChange);
    };
  }, []);

  useEffect(() => {
    handleOverlay();
  }, [handleOverlay]);

  return null;
};

export default Content;
