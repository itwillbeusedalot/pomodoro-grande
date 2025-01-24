interface SoundRequest {
  action: string;
  selectedSound?: string;
  isSoundEnabled?: boolean;
  soundVolume?: number;
}

let audio: HTMLAudioElement | null = null;
let isSoundPlaying: boolean = false;

chrome.runtime.onMessage.addListener((request: SoundRequest) => {
  if (
    request.action === "playSound" &&
    request?.selectedSound &&
    request?.isSoundEnabled
  ) {
    if (isSoundPlaying && audio) {
      audio.pause();
      audio.currentTime = 0;
      isSoundPlaying = false;
    }

    audio = new Audio(
      chrome.runtime.getURL(`assets/sounds/${request.selectedSound}`)
    );

    if (request?.soundVolume !== undefined) {
      audio.volume = request.soundVolume;
    }

    audio
      .play()
      .then(() => {
        isSoundPlaying = true;
      })
      .catch((error: Error) => {
        console.error("Error playing audio:", error);
        isSoundPlaying = false;
      });

    audio.addEventListener("ended", () => {
      isSoundPlaying = false;
    });
  }
});
