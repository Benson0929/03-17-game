// ==========================================
// 03:17
// Interactive Horror Game
// ==========================================



// ==========================================
// PRELOAD IMAGES
// ==========================================

const backgroundImages = [
  "Images/kill1.png",
  "Images/kill2.png",
  "Images/kill3.png",
  "Images/kill4.png",
  "Images/kill5.png",

  "Images/safe.jpg",
  "Images/apartnt.jpg",
  "Images/scar.jpg",
  "Images/rope.jpg",
  "Images/hand.jpg",
  "Images/mirror.jpg",
  "Images/hallway-empty.png",
  "Images/man-sprite.png",
  "Images/man.jpg",
  "Images/apartment.jpg",
  "Images/bathroom.jpg",
  "Images/closet.jpg",
  "Images/closet-hand.jpg",
  "Images/door.jpg",
  "Images/near-door.jpg",
  "Images/kitchen.jpg",
  "Images/kitchen-note.jpg"
];


function preloadImages() {

  backgroundImages.forEach(
    function (path) {

      const image =
        new Image();

      image.src =
        path;
    }
  );
}


preloadImages();



// ==========================================
// AUDIO
// ==========================================

// Quiet ambient music persists through scene changes and restarts.
const horrorBackgroundAudio = new Audio("sound/horror.mp3");
horrorBackgroundAudio.preload = "auto";
horrorBackgroundAudio.loop = true;
horrorBackgroundAudio.volume = 0.25;
let escapeMusicActive = false;
let backgroundMusicPending = false;
function startBackgroundMusic() {
  if (escapeMusicActive || !horrorBackgroundAudio.paused || backgroundMusicPending) return;
  backgroundMusicPending = true;
  horrorBackgroundAudio.play().then(function () {
    document.removeEventListener("pointerdown", startBackgroundMusic);
    document.removeEventListener("keydown", startBackgroundMusic);
  }).catch(function (error) {
    if (error.name !== "NotAllowedError") console.warn("Background music could not play:", error);
  }).finally(function () { backgroundMusicPending = false; });
}
// Start on the title screen; retry on interaction if autoplay is blocked.
document.addEventListener("pointerdown", startBackgroundMusic);
document.addEventListener("keydown", startBackgroundMusic);
startBackgroundMusic();

const escapeEndAudio = new Audio("sound/end.mp3");
escapeEndAudio.preload = "auto";
escapeEndAudio.loop = false;
escapeEndAudio.volume = 0.6;
function unlockEscapeEndAudio() {
  escapeEndAudio.muted = true;
  escapeEndAudio.play().then(function () {
    if (!escapeMusicActive) {
      escapeEndAudio.pause();
      escapeEndAudio.currentTime = 0;
    }
    escapeEndAudio.muted = false;
  }).catch(function () { escapeEndAudio.muted = false; });
}
function startEscapeEndAudio() {
  if (escapeMusicActive) return;
  escapeMusicActive = true;
  horrorBackgroundAudio.pause();
  escapeEndAudio.muted = false;
  escapeEndAudio.currentTime = 0;
  escapeEndAudio.play().catch(function (error) {
    console.warn("Escape ending music could not play:", error);
  });
}
function stopEscapeEndAudio() {
  const wasActive = escapeMusicActive;
  escapeMusicActive = false;
  escapeEndAudio.pause();
  escapeEndAudio.currentTime = 0;
  if (wasActive) startBackgroundMusic();
}

const phoneRing = new Audio("sound/phone-RING.mp3");
phoneRing.preload = "auto";
phoneRing.loop = true;
phoneRing.volume = 0.55;
let phoneIsRinging = false;
let phonePlaysRemaining = 0;
let phoneTwiceTriggered = false;
phoneRing.addEventListener("ended", function () {
  if (!phoneIsRinging || phoneRing.loop) return;
  phonePlaysRemaining--;
  if (phonePlaysRemaining > 0) {
    phoneRing.currentTime = 0;
    phoneRing.play().catch(function (error) {
      phoneIsRinging = false;
      console.warn("Phone ringtone could not replay:", error);
    });
  } else {
    phoneIsRinging = false;
  }
});

function startPhoneRingTwice() {
  if (phoneTwiceTriggered) return;
  phoneTwiceTriggered = true;
  startPhoneRing(2);
}

// Called from ENTER so later story cues can play on mobile browsers.
function unlockPhoneAudio() {
  phoneRing.muted = true;
  phoneRing.play().then(function () {
    if (!phoneIsRinging) {
      phoneRing.pause();
      phoneRing.currentTime = 0;
    }
    phoneRing.muted = false;
  }).catch(function () {
    phoneRing.muted = false;
  });
}

function startPhoneRing(playCount = Infinity) {
  if (phoneIsRinging) return;
  phonePlaysRemaining = playCount;
  phoneRing.loop = playCount === Infinity;
  phoneIsRinging = true;
  phoneRing.muted = false;
  phoneRing.currentTime = 0;
  phoneRing.play().catch(function (error) {
    phoneIsRinging = false;
    console.warn("Phone ringtone could not play:", error);
  });
}

function stopPhoneRing() {
  phonePlaysRemaining = 0;
  phoneTwiceTriggered = false;
  phoneIsRinging = false;
  phoneRing.pause();
  phoneRing.currentTime = 0;
}

const hangUpAudio = new Audio("sound/hang-up.mp3");
hangUpAudio.preload = "auto";
hangUpAudio.loop = false;
hangUpAudio.volume = 0.65;
let hangUpTriggered = false;

function unlockHangUpAudio() {
  hangUpAudio.muted = true;
  hangUpAudio.play().then(function () {
    if (!hangUpTriggered) {
      hangUpAudio.pause();
      hangUpAudio.currentTime = 0;
    }
    hangUpAudio.muted = false;
  }).catch(function () { hangUpAudio.muted = false; });
}

function stopHangUp() {
  hangUpAudio.pause();
  hangUpAudio.currentTime = 0;
  hangUpTriggered = false;
}

function playHangUp() {
  if (hangUpTriggered) return;
  hangUpTriggered = true;
  stopMurmur();
  hangUpAudio.muted = false;
  hangUpAudio.currentTime = 0;
  hangUpAudio.play().catch(function (error) {
    console.warn("Hang-up audio could not play:", error);
  });
}

const murmurAudio = new Audio("sound/murmur.mp3");
murmurAudio.preload = "auto";
murmurAudio.volume = 0.65;
murmurAudio.loop = false;
let murmurTimer = null;
let murmurStarted = false;

// Unlock during the actual answer click; the story cue starts audible playback.
function unlockMurmurAudio() {
  murmurAudio.muted = true;
  murmurAudio.play().then(function () {
    if (!murmurStarted) {
      murmurAudio.pause();
      murmurAudio.currentTime = 0;
    }
    murmurAudio.muted = false;
  }).catch(function () { murmurAudio.muted = false; });
}
let murmurPlaybackID = 0;

function stopMurmur() {
  murmurStarted = false;
  murmurPlaybackID++;
  clearTimeout(murmurTimer);
  murmurTimer = null;
  murmurAudio.pause();
  murmurAudio.currentTime = 0;
}

function playMurmur() {
  stopMurmur();
  murmurStarted = true;
  murmurAudio.muted = false;
  const playbackID = murmurPlaybackID;
  murmurAudio.play().then(function () {
    if (playbackID !== murmurPlaybackID) return;
    murmurTimer = setTimeout(stopMurmur, 7000);
  }).catch(function (error) {
    console.warn("Phone murmur could not play:", error);
  });
}

const mysteryAudio = new Audio("sound/mistery.mp3");
mysteryAudio.preload = "auto";
mysteryAudio.volume = 0.6;
mysteryAudio.loop = false;
let dreamWakeTimer = null;
let dreamWakeActive = false;

function resetDreamWake() {
  stopDreamVortex();
  clearTimeout(dreamWakeTimer);
  dreamWakeTimer = null;
  dreamWakeActive = false;
  mysteryAudio.pause();
  mysteryAudio.currentTime = 0;
  document.body.classList.remove("dream-waking", "dream-swirl");
}

function wakeFromDream() {
  if (dreamWakeActive) return;
  dreamWakeActive = true;
  clearTimeout(typingTimer);
  isTyping = false;
  stopPhoneRing();
  stopDropAudio();
  stopMurmur();
  stopHangUp();
  stopKnocking();
  document.querySelectorAll("#choices button").forEach(function (button) {
    button.disabled = true;
  });
  document.body.classList.add("dream-waking");
  mysteryAudio.currentTime = 0;
  mysteryAudio.play().catch(function (error) {
    console.warn("Dream transition audio could not play:", error);
  });
  const sceneID = currentSceneID;
  dreamWakeTimer = setTimeout(function () {
    if (sceneID !== currentSceneID) return;
    startGame();
  }, 6000);
}

const dropAudio = new Audio("sound/drop.mp3");
dropAudio.preload = "auto";
dropAudio.loop = true;
dropAudio.volume = 0.18;

function stopDropAudio() {
  dropAudio.pause();
  dropAudio.currentTime = 0;
}

function playDropAudio() {
  dropAudio.play().catch(function (error) {
    console.warn("Bathroom drip audio could not play:", error);
  });
}

const knockAudio = new Audio("sound/knock.mp3");
knockAudio.preload = "auto";
knockAudio.volume = 0.7;
let knockSequence = null;
let knockComplete = false;
let cancelKnock = null;
let skipAfterKnock = false;

function stopKnocking() {
  if (cancelKnock) cancelKnock();
  knockAudio.pause();
  knockAudio.currentTime = 0;
  knockSequence = null;
  knockComplete = false;
  skipAfterKnock = false;
}

function unlockKnockAudio() {
  knockAudio.muted = true;
  knockAudio.play().then(function () {
    if (!knockSequence) {
      knockAudio.pause();
      knockAudio.currentTime = 0;
    }
    knockAudio.muted = false;
  }).catch(function () { knockAudio.muted = false; });
}

function playKnockOnce() {
  return new Promise(function (resolve) {
    let timer;
    function done() {
      clearTimeout(timer);
      knockAudio.removeEventListener("ended", done);
      knockAudio.removeEventListener("error", done);
      if (cancelKnock === done) cancelKnock = null;
      resolve();
    }
    cancelKnock = done;
    knockAudio.addEventListener("ended", done);
    knockAudio.addEventListener("error", done);
    knockAudio.currentTime = 0;
    knockAudio.muted = false;
    // Avoid trapping the story if the file fails to load or playback stalls.
    timer = setTimeout(function () { knockAudio.pause(); done(); }, 6000);
    knockAudio.play().catch(done);
  });
}

function playKnockSequence(sceneID) {
  if (knockSequence) return knockSequence;
  knockSequence = (async function () {
    await playKnockOnce();
    if (sceneID !== currentSceneID) return;
    await playKnockOnce();
    if (sceneID === currentSceneID) knockComplete = true;
  })();
  return knockSequence;
}

const manScareAudio = new Audio("sound/jumpscare-man.mp3");
manScareAudio.preload = "auto";
manScareAudio.loop = false;
manScareAudio.volume = 0.45;
let manScarePlaying = false;

function unlockManScareAudio() {
  manScareAudio.muted = true;
  manScareAudio.play().then(function () {
    if (!manScarePlaying) {
      manScareAudio.pause();
      manScareAudio.currentTime = 0;
    }
    manScareAudio.muted = false;
  }).catch(function () { manScareAudio.muted = false; });
}

let killerZoom = 1.04;
let killerZoomFrame = null;
let killerZoomStarted = false;
function startKillerZoom() {
  if (killerZoomStarted) return;
  killerZoomStarted = true;
  const started = performance.now();
  function step(now) {
    const t = Math.min((now - started) / 5000, 1);
    const eased = t * t * (3 - 2 * t);
    killerZoom = 1.04 + (2.2 - 1.04) * eased;
    document.body.style.setProperty("--killer-zoom", killerZoom);
    positionKillerFigure();
    if (t < 1) killerZoomFrame = requestAnimationFrame(step);
  }
  killerZoomFrame = requestAnimationFrame(step);
}
const killerRoomImage = new Image();
killerRoomImage.src = "Images/apartment.jpg";
function positionKillerFigure() {
  if (!document.body.classList.contains("killer-present")) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const iw = killerRoomImage.naturalWidth || 1672;
  const ih = killerRoomImage.naturalHeight || 941;
  const scale = Math.max(width / iw, height / ih) * killerZoom;
  const figure = document.getElementById("killer-doorway-figure");
  figure.style.left = (width / 2 + (0.531 - 0.5) * iw * scale) + "px";
  figure.style.top = (height / 2 + (0.455 - 0.5) * ih * scale) + "px";
  figure.style.height = (0.15 * ih * scale) + "px";
  const glow = document.getElementById("killer-door-glow");
  glow.style.left = figure.style.left;
  glow.style.top = (height / 2 + (0.443 - 0.5) * ih * scale) + "px";
  glow.style.width = (0.042 * iw * scale) + "px";
  glow.style.height = (0.16 * ih * scale) + "px";
}
killerRoomImage.addEventListener("load", positionKillerFigure);
window.addEventListener("resize", positionKillerFigure);

const killerScaryAudio = new Audio("sound/scary.mp3");
killerScaryAudio.preload = "auto";
killerScaryAudio.loop = false;
killerScaryAudio.volume = 0.9;

function unlockKillerScaryAudio() {
  killerScaryAudio.muted = true;
  killerScaryAudio.play().then(function () {
    if (!killerFigureTriggered) {
      killerScaryAudio.pause();
      killerScaryAudio.currentTime = 0;
    }
    killerScaryAudio.muted = false;
  }).catch(function () { killerScaryAudio.muted = false; });
}

let killerFigureTriggered = false;

function resetKillerFigure() {
  killerScaryAudio.pause();
  killerScaryAudio.currentTime = 0;
  cancelAnimationFrame(killerZoomFrame);
  killerZoomStarted = false;
  killerZoom = 1.04;
  document.body.style.setProperty("--killer-zoom", killerZoom);
  killerFigureTriggered = false;
  document.body.classList.remove("killer-present", "killer-figure-visible");
}

function revealKillerFigure() {
  if (killerFigureTriggered) return;
  killerFigureTriggered = true;
  document.body.classList.add("killer-figure-visible");
  killerScaryAudio.muted = false;
  killerScaryAudio.currentTime = 0;
  killerScaryAudio.play().catch(function (error) {
    console.warn("Killer reveal sound could not play:", error);
  });

}

let memoryMontageTimer = null;
function stopMemoryMontage() {
  clearTimeout(memoryMontageTimer);
  document.body.classList.remove("memory-montage");
}
function startMemoryMontage() {
  stopMemoryMontage();
  const sceneID = currentSceneID;
  const frames = ["Images/kill1.png", "Images/kill2.png", "Images/kill3.png", "Images/kill4.png", "Images/kill5.png"];
  let index = 0;
  document.body.classList.add("memory-montage");
  function next() {
    if (sceneID !== currentSceneID) return;
    if (index === frames.length) {
      setBackground("Images/scar.jpg");
      document.body.classList.remove("memory-montage");
      return;
    }
    setBackground(frames[index++], true);
    memoryMontageTimer = setTimeout(next, 2000);
  }
  next();
}

const crimeAudio = new Audio("sound/crime.mp3");
crimeAudio.preload = "auto";
crimeAudio.loop = false;
crimeAudio.volume = 0.6;
crimeAudio.playbackRate = 0.75;
let crimeTimer = null;
let crimePlaybackID = 0;
function stopCrimeAudio() {
  crimePlaybackID++;
  clearTimeout(crimeTimer);
  crimeTimer = null;
  crimeAudio.pause();
  crimeAudio.currentTime = 0;
}
function playCrimeAudio() {
  stopCrimeAudio();
  const playbackID = crimePlaybackID;
  crimeAudio.playbackRate = 0.75;
  crimeAudio.play().then(function () {
    if (playbackID !== crimePlaybackID) return;
    crimeTimer = setTimeout(stopCrimeAudio, 20000);
  }).catch(function (error) {
    console.warn("Remember ending music could not play:", error);
  });
}

const keyAudio = new Audio("sound/key.mp3");
keyAudio.preload = "auto";
keyAudio.loop = false;
keyAudio.volume = 0.65;
let keyTriggered = false;
function unlockKeyAudio() {
  keyAudio.muted = true;
  keyAudio.play().then(function () {
    if (!keyTriggered) {
      keyAudio.pause();
      keyAudio.currentTime = 0;
    }
    keyAudio.muted = false;
  }).catch(function () { keyAudio.muted = false; });
}
function stopKeyAudio() {
  keyTriggered = false;
  keyAudio.pause();
  keyAudio.currentTime = 0;
}
function playKeyAudio() {
  if (keyTriggered) return;
  keyTriggered = true;
  setBackground("Images/apartment.jpg");
  keyAudio.muted = false;
  keyAudio.currentTime = 0;
  keyAudio.play().catch(function (error) {
    console.warn("Key sound could not play:", error);
  });
}

const revealedAudio = new Audio("sound/revealed.mp3");
revealedAudio.preload = "auto";
revealedAudio.loop = false;
revealedAudio.volume = 0.65;
let revealedTriggered = false;
function unlockRevealedAudio() {
  revealedAudio.muted = true;
  revealedAudio.play().then(function () {
    if (!revealedTriggered) {
      revealedAudio.pause();
      revealedAudio.currentTime = 0;
    }
    revealedAudio.muted = false;
  }).catch(function () { revealedAudio.muted = false; });
}
function stopRevealedAudio() {
  revealedTriggered = false;
  revealedAudio.pause();
  revealedAudio.currentTime = 0;
}
function playRevealedAudio() {
  if (revealedTriggered) return;
  revealedTriggered = true;
  revealedAudio.muted = false;
  revealedAudio.currentTime = 0;
  revealedAudio.play().catch(function (error) {
    console.warn("Note reveal audio could not play:", error);
  });
}

const heartbeatAudio = new Audio("sound/heartbeat.mp3");
heartbeatAudio.preload = "auto";
heartbeatAudio.loop = false;
heartbeatAudio.volume = 0.35;
let heartbeatStarted = false;
function stopHeartbeat() {
  heartbeatAudio.loop = false;
  heartbeatStarted = false;
  heartbeatAudio.pause();
  heartbeatAudio.currentTime = 0;
}
function unlockHeartbeatAudio() {
  heartbeatAudio.muted = true;
  heartbeatAudio.play().then(function () {
    if (!heartbeatStarted) {
      heartbeatAudio.pause();
      heartbeatAudio.currentTime = 0;
    }
    heartbeatAudio.muted = false;
  }).catch(function () { heartbeatAudio.muted = false; });
}
function startHeartbeat() {
  if (heartbeatStarted) return;
  heartbeatStarted = true;
  heartbeatAudio.muted = false;
  heartbeatAudio.currentTime = 0;
  heartbeatAudio.play().catch(function (error) {
    console.warn("Heartbeat audio could not play:", error);
  });
}

const handShockAudio = new Audio("sound/shock.mp3");
handShockAudio.preload = "auto";
handShockAudio.loop = false;
handShockAudio.volume = 0.7;
handShockAudio.addEventListener("ended", function () {
  if (handShockTriggered) startHeartbeat();
});
let handShockTriggered = false;
let handShockTimer = null;
function unlockHandShockAudio() {
  handShockAudio.muted = true;
  handShockAudio.play().then(function () {
    if (!handShockTriggered) {
      handShockAudio.pause();
      handShockAudio.currentTime = 0;
    }
    handShockAudio.muted = false;
  }).catch(function () { handShockAudio.muted = false; });
}
function resetHandShock() {
  stopHeartbeat();
  clearTimeout(handShockTimer);
  handShockTriggered = false;
  handShockAudio.pause();
  handShockAudio.currentTime = 0;
  document.body.classList.remove("hand-shock");
}
function revealHandShock() {
  if (handShockTriggered) return;
  handShockTriggered = true;
  document.body.classList.add("hand-shock");
  setBackground("Images/closet-hand.jpg", true);
  handShockAudio.muted = false;
  handShockAudio.currentTime = 0;
  handShockAudio.play().catch(function (error) {
    console.warn("Hand shock sound could not play:", error);
  });
  handShockTimer = setTimeout(function () {
    document.body.classList.remove("hand-shock");
  }, 650);
}

let doorScareTimer = null;
let doorScareComplete = false;

function resetDoorScare() {
  manScarePlaying = false;
  manScareAudio.pause();
  manScareAudio.currentTime = 0;
  clearTimeout(doorScareTimer);
  document.body.classList.remove("door-scare", "door-dread");
  doorScareComplete = false;
}

function playScareImpact() {
  manScarePlaying = true;
  manScareAudio.muted = false;
  manScareAudio.currentTime = 0;
  manScareAudio.play().catch(function (error) {
    manScarePlaying = false;
    console.warn("Man jumpscare audio could not play:", error);
  });
}

function playDoorScare(sceneID) {
  document.body.classList.add("door-scare");
  playScareImpact();
  doorScareTimer = setTimeout(function () {
    if (sceneID !== currentSceneID) return;
    setBackground("Images/man.jpg", true);
    // Commit the final background before hiding the independent actor.
    void document.getElementById("bg-a").offsetWidth;
    document.body.classList.remove("door-scare");
    doorScareComplete = true;
    typeNextCharacter(sceneID);
  }, 1250);
}

let audioContext = null;


function initializeAudio() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
  }


  if (
    audioContext.state ===
    "suspended"
  ) {

    audioContext.resume();
  }
}



// ==========================================
// TYPEWRITER CLICK
// ==========================================

function playTypingClick() {

  if (!audioContext) {
    return;
  }


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    "square";


  oscillator.frequency.value =
    850 +
    Math.random() * 250;


  const now =
    audioContext.currentTime;


  gain.gain.setValueAtTime(
    0.005,
    now
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.025
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    audioContext.destination
  );


  oscillator.start(
    now
  );


  oscillator.stop(
    now + 0.03
  );
}



// ==========================================
// BUTTON CLICK
// ==========================================

function playButtonClick() {

  if (!audioContext) {
    return;
  }


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    "sine";


  oscillator.frequency.value =
    170;


  const now =
    audioContext.currentTime;


  gain.gain.setValueAtTime(
    0.02,
    now
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.08
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    audioContext.destination
  );


  oscillator.start(
    now
  );


  oscillator.stop(
    now + 0.09
  );
}



// ==========================================
// BACKGROUND CROSSFADE SYSTEM
// ==========================================

let activeBackground =
  "a";


let currentBackground =
  "";


let motionIndex = 0;


function setBackground(
  imagePath,
  force = false
) {

  if (
    imagePath ===
      currentBackground &&
    !force
  ) {

    return;
  }


  currentBackground =
    imagePath;


  const oldLayer =
    document.getElementById(
      activeBackground === "a"
        ? "bg-a"
        : "bg-b"
    );


  const newLayer =
    document.getElementById(
      activeBackground === "a"
        ? "bg-b"
        : "bg-a"
    );


  // Change image
  newLayer.style.backgroundImage =
    `url("${imagePath}")`;


  // Remove previous motion classes
  newLayer.classList.remove(
    "motion-a",
    "motion-b",
    "motion-c"
  );


  void newLayer.offsetWidth;


  // Rotate camera movement
  const motions = [
    "motion-a",
    "motion-b",
    "motion-c"
  ];


  const selectedMotion =
    motions[
      motionIndex %
      motions.length
    ];


  motionIndex++;


  newLayer.classList.add(
    selectedMotion
  );


  // Start new image fade in
  newLayer.classList.add(
    "active"
  );


  // Fade old image away
  oldLayer.classList.remove(
    "active"
  );


  activeBackground =
    activeBackground === "a"
      ? "b"
      : "a";
}



// ==========================================
// SPECIAL EFFECTS
// ==========================================

function triggerFlash() {

  const flash =
    document.getElementById(
      "flash-overlay"
    );


  flash.classList.remove(
    "flash"
  );


  void flash.offsetWidth;


  flash.classList.add(
    "flash"
  );
}


function triggerShake() {

  document.body.classList.remove(
    "shake"
  );


  void document.body.offsetWidth;


  document.body.classList.add(
    "shake"
  );


  setTimeout(
    function () {

      document.body.classList.remove(
        "shake"
      );

    },

    350
  );
}



// ==========================================
// TYPEWRITER VARIABLES
// ==========================================

let typingTimer =
  null;


let transitionTimer =
  null;


let isTyping =
  false;


let activeText =
  "";


let activeButtons =
  "";


let activeIndex =
  0;


let currentSceneID =
  0;



// ==========================================
// CLEAN STORY TEXT
// ==========================================

function cleanText(text) {

  return text

    .trim()

    .replace(
      /\r/g,
      ""
    )

    .replace(
      /[ \t]+\n/g,
      "\n"
    )

    .replace(
      /\n[ \t]+/g,
      "\n"
    )

    .replace(
      /\n{2,}/g,
      "\n"
    )

    .replace(
      /\n?\[PAUSE=(\d+)\]\n?/g,
      "[PAUSE=$1]\n"
    )

    .replace(
      /\n?\[BG=([^\]]+)\]\n?/g,
      "[BG=$1]\n"
    )

    .replace(
      /\n?\[FX=([^\]]+)\]\n?/g,
      "[FX=$1]\n"
    );
}



// ==========================================
// SET SCENE
// ==========================================

function setScene(
  storyText,
  buttons,
  preserveKillerScene = false
) {
  resetDreamWake();
  stopPhoneRing();
  stopDropAudio();
  stopMurmur();
  stopHangUp();
  stopKnocking();
  resetDoorScare();
  stopRevealedAudio();
  stopKeyAudio();
  stopEscapeEndAudio();
  stopMemoryMontage();
  stopCrimeAudio();
  document.body.classList.remove("escape-running");
  document.body.classList.remove("looking-at-hand");
  if (storyText.trim().startsWith("You force yourself to stay calm.")) {
    // Keep the shock-to-heartbeat sequence alive across the calm choice.
    clearTimeout(handShockTimer);
    document.body.classList.remove("hand-shock");
  } else {
    resetHandShock();
  }
  document.body.classList.remove("calming-breath");
  if (preserveKillerScene) {
    killerScaryAudio.pause();
    killerScaryAudio.currentTime = 0;
  } else {
    resetKillerFigure();
  }
  document.body.classList.remove("revenge-fading");

  currentSceneID++;


  const sceneID =
    currentSceneID;


  clearTimeout(
    typingTimer
  );


  clearTimeout(
    transitionTimer
  );


  isTyping =
    false;


  const sceneContent =
    document.getElementById(
      "scene-content"
    );


  const story =
    document.getElementById(
      "story"
    );


  const choices =
    document.getElementById(
      "choices"
    );


  sceneContent.classList.add(
    "fade-out"
  );


  sceneContent.classList.remove(
    "fade-in"
  );


  transitionTimer =
    setTimeout(

      function () {

        if (
          sceneID !==
          currentSceneID
        ) {

          return;
        }


        activeText =
          cleanText(
            localizeStory(storyText)
          );


        activeButtons =
          localizeButtons(buttons);


        activeIndex =
          0;


        sceneContent.scrollTop = 0;
        story.textContent =
          "";


        choices.innerHTML =
          "";


        choices.classList.add(
          "hidden"
        );


        story.classList.add(
          "typing"
        );


        sceneContent.classList.remove(
          "fade-out"
        );


        sceneContent.classList.add(
          "fade-in"
        );


        setTimeout(

          function () {

            if (
              sceneID !==
              currentSceneID
            ) {

              return;
            }


            isTyping =
              true;


            typeNextCharacter(
              sceneID
            );

          },

          180
        );

      },

      400
    );
}



// ==========================================
// TYPEWRITER
// ==========================================

function renderStoryText(text) {
  const story = document.getElementById("story");
  story.classList.toggle("memory-fragments", activeText.startsWith(translateLine("You stare at the scar.")));
  const isRememberEnding = activeText.startsWith(translateLine("The final memory returns."));
  story.classList.toggle("remember-ending-text", isRememberEnding);
  if (isRememberEnding) {
    const lead = translateLine("The voice on the phone was yours.") + "\n";
    const leadIndex = text.indexOf(lead);
    if (leadIndex >= 0) {
      const split = leadIndex + lead.length;
      const conclusion = document.createElement("span");
      conclusion.className = "memory-conclusion";
      conclusion.textContent = text.slice(split);
      story.replaceChildren(document.createTextNode(text.slice(0, split)), conclusion);
    } else {
      story.textContent = text;
    }
    return;
  }
  if (activeText.startsWith(translateLine("You enter the kitchen."))) {
    const noteStart = text.indexOf(gameLanguage === "zh-Hant" ? "如果" : "IF");
    if (noteStart >= 0) {
      const note = document.createElement("span");
      note.className = "story-note";
      note.textContent = text.slice(noteStart);
      story.replaceChildren(document.createTextNode(text.slice(0, noteStart)), note);
    } else {
      story.textContent = text;
    }
    return;
  }
  const isApartment = activeText.startsWith(translateLine("You finally take a closer look around the apartment."));
  const isMirror = activeText.startsWith(translateLine("You look into the mirror."));
  const isLoop = activeText.startsWith(translateLine("You check the clock again."));
  if (!isApartment && !isMirror && !isLoop) {
    story.textContent = text;
    return;
  }
  const lines = text.split("\n");
  const nodes = [];
  const clockLabel = (isMirror || isLoop) ? "03:17 AM." : "03:17 AM";
  lines.forEach(function (line, index) {
    const previous = lines[index - 1];
    const followsClock = isApartment
      ? previous === translateLine("The clock reads:")
      : isLoop
        ? previous === translateLine("You check the clock again.")
        : previous === translateLine("You check the clock.") || previous === translateLine("Your phone:");
    if (followsClock && line && clockLabel.startsWith(line)) {
      const clock = document.createElement("span");
      clock.className = "story-clock-large";
      clock.textContent = line;
      nodes.push(clock);
    } else {
      nodes.push(document.createTextNode(line));
    }
    if (index < lines.length - 1) nodes.push(document.createTextNode("\n"));
  });
  story.replaceChildren(...nodes);
}

function typeNextCharacter(
  sceneID
) {

  if (
    sceneID !==
    currentSceneID
  ) {

    return;
  }


  if (!isTyping) {

    return;
  }


  const story =
    document.getElementById(
      "story"
    );


  if (
    activeIndex >=
    activeText.length
  ) {

    finishTyping();

    return;
  }


  const remaining =
    activeText.slice(
      activeIndex
    );

  if (remaining.startsWith("[RUN_STOP]")) {
    activeIndex += "[RUN_STOP]".length;
    document.body.classList.remove("escape-running");
    stopHeartbeat();
    startEscapeEndAudio();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[KEY_SOUND]")) {
    activeIndex += "[KEY_SOUND]".length;
    playKeyAudio();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[REVEALED]")) {
    activeIndex += "[REVEALED]".length;
    playRevealedAudio();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[HAND_SHOCK]")) {
    activeIndex += "[HAND_SHOCK]".length;
    revealHandShock();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[KILLER_ZOOM]")) {
    activeIndex += "[KILLER_ZOOM]".length;
    startKillerZoom();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[KILLER_FIGURE]")) {
    activeIndex += "[KILLER_FIGURE]".length;
    revealKillerFigure();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[FADE_TO_BLACK]")) {
    activeIndex += "[FADE_TO_BLACK]".length;
    document.body.classList.add("revenge-fading");
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[DOOR_SCARE]")) {
    activeIndex += "[DOOR_SCARE]".length;
    playDoorScare(sceneID);
    return;
  }

  if (remaining.startsWith("[KNOCK_SEQUENCE]")) {
    activeIndex += "[KNOCK_SEQUENCE]".length;
    playKnockSequence(sceneID).then(function () {
      if (sceneID !== currentSceneID) return;
      if (skipAfterKnock) finishTyping();
      else typeNextCharacter(sceneID);
    });
    return;
  }

  if (remaining.startsWith("[MURMUR]")) {
    activeIndex += "[MURMUR]".length;
    playMurmur();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[HANG_UP]")) {
    activeIndex += "[HANG_UP]".length;
    playHangUp();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[PHONE_RING_TWICE]")) {
    activeIndex += "[PHONE_RING_TWICE]".length;
    startPhoneRingTwice();
    typeNextCharacter(sceneID);
    return;
  }

  if (remaining.startsWith("[PHONE_RING]")) {
    activeIndex += "[PHONE_RING]".length;
    startPhoneRing();
    typeNextCharacter(sceneID);
    return;
  }



  // ========================================
  // PAUSE
  // ==========================================

  const pauseMatch =
    remaining.match(
      /^\[PAUSE=(\d+)\]/
    );


  if (pauseMatch) {

    const pauseTime =
      parseInt(
        pauseMatch[1]
      );


    activeIndex +=
      pauseMatch[0].length;


    typingTimer =
      setTimeout(

        function () {

          typeNextCharacter(
            sceneID
          );

        },

        pauseTime
      );


    return;
  }



  // ========================================
  // BACKGROUND CHANGE
  // ==========================================

  const backgroundMatch =
    remaining.match(
      /^\[BG=([^\]]+)\]/
    );


  if (backgroundMatch) {

    const filename =
      backgroundMatch[1].trim();


    activeIndex +=
      backgroundMatch[0].length;


    setBackground(
      "Images/" +
      filename
    );


    typingTimer =
      setTimeout(

        function () {

          typeNextCharacter(
            sceneID
          );

        },

        700
      );


    return;
  }



  // ========================================
  // FX COMMAND
  // ==========================================

  const fxMatch =
    remaining.match(
      /^\[FX=([^\]]+)\]/
    );


  if (fxMatch) {

    const effect =
      fxMatch[1]
        .trim()
        .toLowerCase();


    activeIndex +=
      fxMatch[0].length;


    if (
      effect === "flash"
    ) {

      triggerFlash();
    }


    if (
      effect === "shake"
    ) {

      triggerShake();
    }


    typingTimer =
      setTimeout(

        function () {

          typeNextCharacter(
            sceneID
          );

        },

        180
      );


    return;
  }



  // ========================================
  // NORMAL CHARACTER
  // ==========================================

  const character =
    activeText[
      activeIndex
    ];


  renderStoryText(story.textContent + character);


  activeIndex++;



  // ========================================
  // TYPING SOUND
  // ==========================================

  if (
    character !== " " &&
    character !== "\n" &&
    activeIndex % 2 === 0
  ) {

    playTypingClick();
  }



  // ========================================
  // SPEED
  // ==========================================

  let speed =
    gameLanguage === "zh-Hant" ? 65 : 28;


  if (
    character === "." ||
    character === "?" ||
    character === "!" || "。？！…".includes(character)
  ) {

    speed =
      220;
  }


  else if (
    character === "," ||
    character === ";" || "，；：".includes(character)
  ) {

    speed =
      90;
  }


  else if (
    character === "\n"
  ) {

    speed =
      80;
  }


  typingTimer =
    setTimeout(

      function () {

        typeNextCharacter(
          sceneID
        );

      },

      speed
    );
}



// ==========================================
// FINAL BACKGROUND WHEN SKIPPING
// ==========================================

function applyFinalBackground() {

  const regex =
    /\[BG=([^\]]+)\]/g;


  let match;


  let lastFilename =
    null;


  while (
    (
      match =
      regex.exec(
        activeText
      )
    ) !== null
  ) {

    lastFilename =
      match[1].trim();
  }


  if (lastFilename) {

    setBackground(
      "Images/" +
      lastFilename
    );
  }
}



// ==========================================
// FINISH TYPEWRITER
// ==========================================

function finishTyping() {
  // Keep the short opening pause and scare intact when the player clicks.
  if (activeText.includes("[DOOR_SCARE]") && !doorScareComplete) return;
  if (activeText.includes("[KNOCK_SEQUENCE]") && !knockComplete) {
    clearTimeout(typingTimer);
    const sceneID = currentSceneID;
    if (!skipAfterKnock) {
      skipAfterKnock = true;
      playKnockSequence(sceneID).then(function () {
        if (sceneID === currentSceneID && skipAfterKnock) finishTyping();
      });
    }
    return;
  }
  skipAfterKnock = false;

  clearTimeout(
    typingTimer
  );


  const story =
    document.getElementById(
      "story"
    );


  const choices =
    document.getElementById(
      "choices"
    );


  applyFinalBackground();
  if (activeText.includes("[RUN_STOP]")) {
    document.body.classList.remove("escape-running");
    stopHeartbeat();
    startEscapeEndAudio();
  }
  if (activeText.includes("[KEY_SOUND]")) playKeyAudio();
  if (activeText.includes("[REVEALED]")) playRevealedAudio();
  if (activeText.includes("[HAND_SHOCK]")) revealHandShock();
  if (activeText.includes("[KILLER_ZOOM]")) startKillerZoom();
  if (activeText.includes("[KILLER_FIGURE]")) revealKillerFigure();
  if (activeText.includes("[HANG_UP]")) playHangUp();
  if (activeText.includes("[FADE_TO_BLACK]")) document.body.classList.add("revenge-fading");
  // Skipping text must still trigger the opening phone cue.
  if (activeText.includes("[PHONE_RING]")) startPhoneRing();
  if (activeText.includes("[PHONE_RING_TWICE]")) startPhoneRingTwice();


  const finalText =
    activeText.replace(/\[(?:RUN_STOP|KEY_SOUND|REVEALED|HAND_SHOCK|KILLER_ZOOM|KILLER_FIGURE|MURMUR|HANG_UP|PHONE_RING_TWICE|PHONE_RING|KNOCK_SEQUENCE|DOOR_SCARE|FADE_TO_BLACK)\]/g, "")

      .replace(
        /\[PAUSE=\d+\]/g,
        ""
      )

      .replace(
        /\[BG=[^\]]+\]/g,
        ""
      )

      .replace(
        /\[FX=[^\]]+\]/g,
        ""
      )

      .replace(
        /\n{2,}/g,
        "\n"
      )

      .trim();


  renderStoryText(finalText);


  story.classList.remove(
    "typing"
  );


  choices.innerHTML =
    activeButtons;


  isTyping =
    false;


  requestAnimationFrame(

    function () {

      choices.classList.remove(
        "hidden"
      );
    }
  );
}



// ==========================================
// CLICK TO SKIP
// ==========================================

document.addEventListener(

  "click",

  function (event) {

    if (
      isTyping &&
      event.target.tagName !==
      "BUTTON"
    ) {

      finishTyping();
    }
  }
);



// ==========================================
// BUTTON SOUND
// ==========================================

document.addEventListener(

  "click",

  function (event) {

    if (
      event.target.tagName ===
      "BUTTON"
    ) {

      initializeAudio();

      playButtonClick();
    }
  }
);



// ==========================================
// OPENING
// ==========================================

let wakeTimer = null;

function startGame() {
  resetDreamWake();
  stopPhoneRing();
  stopDropAudio();
  stopMurmur();
  stopHangUp();
  stopKnocking();
  resetDoorScare();
  stopRevealedAudio();
  stopKeyAudio();
  stopEscapeEndAudio();
  stopMemoryMontage();
  stopCrimeAudio();
  document.body.classList.remove("escape-running");
  document.body.classList.remove("looking-at-hand");
  resetHandShock();
  document.body.classList.remove("calming-breath");
  resetKillerFigure();
  document.body.classList.remove("revenge-fading");
  clearTimeout(wakeTimer);
  clearTimeout(typingTimer);
  clearTimeout(transitionTimer);
  currentSceneID++;
  isTyping = false;
  document.getElementById("story").textContent = "";
  document.getElementById("choices").innerHTML = "";
  document.body.classList.remove("waking-up");
  void document.body.offsetWidth;
  document.body.classList.add("waking-up");

  setBackground(
    "Images/apartment.jpg",
    true
  );


  wakeTimer = setTimeout(function () {
    document.body.classList.remove("waking-up");
    setScene(

`You wake up in a dark, unfamiliar apartment.
You don't remember how you got here.
[PAUSE=1000]
[PHONE_RING_TWICE]A phone starts ringing.`,

`
<button onclick="answerPhone()">
  Answer the phone
</button>

<button onclick="ignorePhone()">
  Ignore the phone
</button>
`
  );
  }, 4200);
}



// ==========================================
// ANSWER PHONE
// ==========================================

function answerPhone() {

  setBackground(
    "Images/apartment.jpg"
  );


  setScene(

`You answer the phone.
[PAUSE=700]
For a few seconds, there is only static.
[PAUSE=2000]
Then a low voice says:
[PAUSE=600]
[MURMUR]"If you're hearing this, you've forgotten again."
[PAUSE=800]
"Don't call the police."
"Don't open the closet."
"Go to the kitchen."
"I left something for you."
[PAUSE=900]
[HANG_UP]The call ends.`,

`
<button onclick="apartmentScene()">
  Continue
</button>
`
  );
  unlockMurmurAudio();
}



// ==========================================
// IGNORE PHONE
// ==========================================

function ignorePhone() {

  setBackground(
    "Images/near-door.jpg"
  );


  setScene(

`You let the phone ring.
After a few seconds, it stops.
[PAUSE=800]
The apartment becomes completely silent.
[PAUSE=1200]
Then you hear footsteps outside.
[PAUSE=700]
Knock. Knock.
[KNOCK_SEQUENCE]
[BG=door.jpg]
[PAUSE=500]
Someone is standing outside the door.`,

`
<button onclick="stayQuiet()">
  Stay quiet
</button>

<button onclick="openDoor()">
  Open the door
</button>
`
  );
}



// ==========================================
// STAY QUIET
// ==========================================

function stayQuiet() {

  setBackground(
    "Images/door.jpg"
  );


  setScene(

`You hold your breath and stay completely still.
The knocking continues for a moment.
[PAUSE=1000]
Then the footsteps slowly fade away.
[PAUSE=900]
[PHONE_RING_TWICE]The phone starts ringing again.
[PAUSE=700]
This time, you answer.`,

`
<button onclick="answerPhone()">
  Answer the phone
</button>
`
  );
}



// ==========================================
// OPEN DOOR
// ==========================================

function openDoor() {

  setBackground(
    "Images/hallway-empty.png"
  );


  setScene(

`You slowly open the door.
[PAUSE=1500]
[DOOR_SCARE]
[PAUSE=350]
A man is standing outside.
He looks shocked when he sees you.
[PAUSE=800]
"Where is she?"
[PAUSE=700]
You have no idea what he is talking about.`,

`
<button onclick="revengeEnding()">
  Continue
</button>
`
  );
}



// ==========================================
// ENDING 01
// ==========================================

function revengeEnding() {

  // Keep the man and hallway from the previous scene.


  setScene(

`The man sees the blood inside the apartment.
[PAUSE=700]
His expression changes.
[PAUSE=900]
Before you can explain anything, he attacks you.
[FX=flash]
[FX=shake]
You collapse to the floor.
[FADE_TO_BLACK]Your vision slowly disappears into darkness.
[PAUSE=1200]
You still don't understand why he wanted you dead.
[PAUSE=1200]
ENDING 01 — REVENGE`,

`
<button onclick="startGame()">
  Start Again
</button>
`
  );
}



// ==========================================
// APARTMENT
// ==========================================

function apartmentScene() {

  setBackground(
    "Images/apartment.jpg"
  );


  setScene(

`You finally take a closer look around the apartment.
The clock reads:
[PAUSE=700]
03:17 AM
[PAUSE=800]
You see a closed closet nearby.
The bathroom light is still on.
A dark hallway leads toward the kitchen.`,

`
<button onclick="closetScene()">
  Open the closet
</button>

<button onclick="bathroomScene()">
  Go to the bathroom
</button>
`
  );
}



// ==========================================
// CLOSET
// ==========================================

function closetScene() {

  setBackground(
    "Images/closet.jpg"
  );


  setScene(

`You slowly open the closet.
[PAUSE=800]
A foul smell hits you immediately.
At first, you can only make out something in the darkness.
[PAUSE=1000]
[HAND_SHOCK]A hand.
[PAUSE=1200]
Then you realize—
[PAUSE=800]
There is a body inside.`,

`
<button onclick="rememberCallScene()">
  Force yourself to stay calm
</button>

<button onclick="someoneIsHereScene()">
  Panic and leave
</button>
`
  );
}



// ==========================================
// REMEMBER CALL
// ==========================================

function rememberCallScene() {

  setBackground(
    "Images/closet-hand.jpg"
  );


  setScene(

`You force yourself to stay calm.
Then you remember the voice on the phone:
[PAUSE=800]
"Go to the kitchen."
[PAUSE=600]
You leave the closet behind and follow the hallway.`,

`
<button onclick="kitchenScene()">
  Go to the kitchen
</button>
`
  );
  document.body.classList.add("calming-breath");
}



// ==========================================
// SOMEONE IS HERE
// ==========================================

function someoneIsHereScene() {

  setBackground(
    "Images/apartment.jpg"
  );


  setScene(

`You panic and rush out of the room.
[PAUSE=600]
[KILLER_ZOOM]Then you freeze.
[PAUSE=1000]
[KILLER_FIGURE]
[PAUSE=800]
A man is standing inside the apartment.
He looks at you calmly.
[PAUSE=900]
"Looks like you woke up earlier than expected."`,

`
<button onclick="tooLateEnding()">
  Continue
</button>
`
  );
  document.body.classList.add("killer-present");
  positionKillerFigure();
}



// ==========================================
// ENDING 03
// ==========================================

function tooLateEnding() {

  // Continue with the current apartment framing, figure and red backlight.


  setScene(

`The stranger steps closer.
You try to run, but he catches you from behind.
[PAUSE=500]
[FX=shake]
A sharp pain tears through your side.
[FX=flash]
You look down and see blood dripping onto the floor.
[PAUSE=700]
He pulls the knife out slowly.
[PAUSE=700]
"You weren't supposed to wake up yet."
[PAUSE=900]
Your vision blurs.
Everything goes dark.
[PAUSE=1300]
ENDING 03 — TOO LATE`,

`
<button onclick="startGame()">
  Start Again
</button>
`,
    true
  );
}



// ==========================================
// BATHROOM
// ==========================================

function bathroomScene() {

  setBackground(
    "Images/bathroom.jpg"
  );


  setScene(

`You enter the bathroom.
Everything feels unfamiliar.
The towels.
The toothbrush.
The objects around the sink.
[PAUSE=600]
None of them belong to you.
[PAUSE=700]
This is definitely not your apartment.`,

`
<button onclick="someoneIsHereScene()">
  Leave the bathroom
</button>

<button onclick="somethingWrongScene()">
  Keep investigating
</button>
`
  );
  playDropAudio();
}



// ==========================================
// SOMETHING IS WRONG
// ==========================================

function somethingWrongScene() {

  setBackground(
    "Images/mirror.jpg"
  );


  setScene(

`You look into the mirror.
[PAUSE=1000]
[FX=flash]
There is no reflection.
[PAUSE=900]
You check the clock.
03:17 AM.
Your phone:
03:17 AM.
[PAUSE=800]
You look outside the window.
Nothing is moving.
Not the cars.
Not the people.
Not even the traffic lights.`,

`
<button onclick="loopEnding()">
  Check the clock again
</button>
`
  );
}



// ==========================================
// ENDING 02 — LOOP
// ==========================================

function loopEnding() {

  setBackground(
    "Images/mirror.jpg"
  );


  setScene(

`You check the clock again.
03:17 AM.
[PAUSE=800]
You close your eyes and try to remember waking up.
You can't.
You only remember being here.
[PAUSE=1000]
No reflection.
A clock that never moves.
[PAUSE=1200]
Then you understand.
You never woke up.
You're still dreaming.
[PAUSE=1300]
You squeeze your eyes shut.
Wake up.
[PAUSE=700]
Please, wake up.
[PAUSE=1300]
When you open them again...`,

`
<button onclick="wakeFromDream()">
  Wake Up Again
</button>
`
  );
  document.body.classList.add("dream-swirl");
  startDreamVortex();
}



// ==========================================
// KITCHEN
// ==========================================

function kitchenScene() {

  setBackground(
    "Images/kitchen.jpg"
  );


  setScene(

`You enter the kitchen.
The room is dark except for a small lamp on the table.
Under the light is a folded piece of paper.
[PAUSE=900]
[BG=kitchen-note.jpg]
[REVEALED]You open it.
[PAUSE=900]
IF YOU DON'T REMEMBER:
Don't call the police.
Don't open the closet.
Clean the bathroom.
Leave before 4:00 AM.
[PAUSE=1000]
If you still can't remember...
[PAUSE=900]
Look at the mark on your left hand.`,

`
<button onclick="markScene()">
  Look at your left hand
</button>
`
  );
}



// ==========================================
// MARK
// ==========================================

function markScene() {

  setBackground(
    "Images/hand.jpg"
  );


  setScene(

`You slowly look down at your left hand.
[PAUSE=700]
There is a mark.
You stare at it.
[PAUSE=1000]
It is...`,

`
<button onclick="memoryReturnsScene()">
  An old scar
</button>

<button onclick="noteNotForYouScene()">
  Rope marks
</button>
`
  );
  document.body.classList.add("looking-at-hand");
}



// ==========================================
// MEMORY RETURNS
// ==========================================

function memoryReturnsScene() {

  setBackground(
    "Images/scar.jpg"
  );


  setScene(

`You stare at the scar.
[PAUSE=1000]
A scream. Blood. The closet door closing.
[FX=flash]
[PAUSE=1400]
Then you remember.
[PAUSE=1000]
You brought the victim here.
You hid the body.
[PAUSE=1400]
You left yourself instructions.
[PAUSE=1000]
And recorded the call.`,

`
<button onclick="rememberEnding()">
  Remember everything
</button>
`
  );
}



// ==========================================
// ENDING 05
// ==========================================

function rememberEnding() {




  setScene(

`The final memory returns.
The apartment isn't unfamiliar.
[PAUSE=700]
It belongs to you.
[PAUSE=900]
You remember the screaming.
You remember the blood running across the bathroom floor.
You remember dragging it to the closet.
[PAUSE=900]
The instructions were written by you.
The voice on the phone was yours.
[PAUSE=1400]
You remember everything. And now—
[PAUSE=1300]
ENDING 05 — REMEMBER`,

`
<button onclick="startGame()">
  Start Again
</button>
`
  );
  playCrimeAudio();
  startMemoryMontage();
}



// ==========================================
// VICTIM TRUTH
// ==========================================

function noteNotForYouScene() {

  setBackground(
    "Images/rope.jpg"
  );


  setScene(

`You look closely at your wrist.
There is no old scar.
[PAUSE=700]
Instead, there are marks left by a rope.
You look back at the note.
[PAUSE=700]
Something is wrong.
You pick up the phone and try Face ID.
[PAUSE=900]
FACE NOT RECOGNIZED.
[PAUSE=1000]
Suddenly, everything makes sense.
The note was never written for you.
The phone call was never meant for you.
You are not the owner of this apartment.
[PAUSE=800]
You are one of the victims.
[PAUSE=1200]
[KEY_SOUND]Click.
[PAUSE=700]
[FX=flash]
A key turns in the front door.
[PAUSE=800]
The killer is coming back.`,

`
<button onclick="escapeEnding()">
  Run
</button>
`
  );
}



// ==========================================
// ENDING 04
// ==========================================

function escapeEnding() {

  setBackground(
    "Images/apartnt.jpg"
  );


  setScene(

`You remember the instructions on the note.
There is a back exit.
You run.
Behind you, the apartment door opens.
Footsteps follow.
[RUN_STOP][BG=safe.jpg]
You reach the back stairs and rush outside.
[PAUSE=800]
For the first time tonight, the city is moving normally.
You turn around.
[PAUSE=900]
A figure is standing in the apartment window.
[PAUSE=700]
Watching you.
[PAUSE=1300]
ENDING 04 — ESCAPE`,

`
<button onclick="startGame()">
  Start Again
</button>
`
  );
  document.body.classList.add("escape-running");
  heartbeatAudio.loop = true;
  startHeartbeat();
}



// ==========================================
// ENTER
// ==========================================

const enterButton =
  document.getElementById(
    "enter-button"
  );


enterButton.addEventListener(

  "click",

  function () {

    initializeAudio();


    const startScreen =
      document.getElementById(
        "start-screen"
      );


    unlockPhoneAudio();
    unlockKnockAudio();
    unlockManScareAudio();
    unlockHangUpAudio();
    unlockKillerScaryAudio();
    unlockHandShockAudio();
    unlockHeartbeatAudio();
    unlockRevealedAudio();
    unlockKeyAudio();
    unlockEscapeEndAudio();
    startBackgroundMusic();
    enterButton.disabled = true;
    startGame();
    startScreen.classList.add("hide");
  }
);