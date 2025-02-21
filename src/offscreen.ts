interface SoundRequest {
  action: string;
  isRunning?: boolean; // Timer status

  // Sound settings
  selectedSound?: string;
  isSoundEnabled?: boolean;
  soundVolume?: number;

  // Music settings
  selectedMusic?: string;
  isMusicEnabled?: boolean;
  musicVolume?: number;
}

let soundAudio: HTMLAudioElement | null = null;
let isSoundPlaying: boolean = false;

let musicAudio: HTMLAudioElement | null = null;

chrome.runtime.onMessage.addListener((request: SoundRequest) => {
  // Play sound
  if (
    request.action === "playSound" &&
    request?.selectedSound &&
    request?.isSoundEnabled
  ) {
    handlePlaySound(request);
  }

  // Play background music
  if (
    request.action === "playMusic" &&
    request?.selectedMusic &&
    request?.isMusicEnabled
  ) {
    handlePlayMusic(request).catch(console.error);
  }

  // Stop background music
  if (request.action === "stopMusic") {
    handleStopMusic();
  }

  // Adjust music volume
  if (
    request.action === "adjust-music-volume" &&
    musicAudio &&
    request.musicVolume !== undefined
  ) {
    musicAudio.volume = request.musicVolume;
  }

  // Toggle music on/off
  if (request.action === "toggle-music") {
    const isMusicEnabled = request.isMusicEnabled;
    if (isMusicEnabled && musicAudio && request.isRunning) {
      musicAudio.play();
    } else {
      musicAudio?.pause();
    }
  }
});

// ***************** Notification Sound ***************

const handlePlaySound = (request: SoundRequest) => {
  if (isSoundPlaying && soundAudio) {
    soundAudio.pause();
    soundAudio.currentTime = 0;
    isSoundPlaying = false;
  }

  soundAudio = new Audio(request.selectedSound);

  if (request?.soundVolume !== undefined) {
    soundAudio.volume = request.soundVolume;
  }

  soundAudio
    .play()
    .then(() => {
      isSoundPlaying = true;
    })
    .catch((error: Error) => {
      console.error("Error playing soundAudio:", error);
      isSoundPlaying = false;
    });

  soundAudio.addEventListener("ended", () => {
    isSoundPlaying = false;
  });
};

// ***************** Background Music ***************

const handlePlayMusic = async (request: SoundRequest) => {
  try {
    // Stop any existing music first
    handleStopMusic();

    if (!request.selectedMusic || !request.isMusicEnabled) return;

    musicAudio = new Audio(request.selectedMusic);
    musicAudio.loop = true;

    if (request?.musicVolume !== undefined) {
      musicAudio.volume = request.musicVolume;
    }

    await musicAudio.play();
  } catch (error) {
    console.error("Error playing background music:", error);
    handleStopMusic();
  }
};

const handleStopMusic = () => {
  try {
    if (musicAudio) {
      musicAudio.pause();
      musicAudio.currentTime = 0;
      musicAudio = null;
    }
  } catch (error) {
    console.error("Error stopping music:", error);
  }
};
