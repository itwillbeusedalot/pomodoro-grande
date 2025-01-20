chrome.runtime.onMessage.addListener((request) => {
  if (
    request.action === "playSound" &&
    request?.selectedSound &&
    request?.isSoundEnabled
  ) {
    const audio = new Audio(
      chrome.runtime.getURL(`./assets/sounds/${request.selectedSound}`)
    );
    audio.volume = request?.soundVolume;

    audio.play().catch((error) => console.error("Error playing sound:", error));
  }
});
