let audio = null;
let isSoundPlaying = false;

chrome.runtime.onMessage.addListener((request) => {
  if (
    request.action === "playSound" &&
    request?.selectedSound &&
    request?.isSoundEnabled
  ) {
    if (isSoundPlaying) {
      audio.pause();
      audio.currentTime = 0;
      isSoundPlaying = false;
    }

    audio = new Audio(
      chrome.runtime.getURL(`./assets/sounds/${request.selectedSound}`)
    );
    audio.volume = request?.soundVolume;

    audio.play().then(() => {
      isSoundPlaying = true;
      chrome.storage.local.set({ isSoundPlaying: true });
    });

    audio.addEventListener("ended", () => {
      isSoundPlaying = false;
    });
  }
});
