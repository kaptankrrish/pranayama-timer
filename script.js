// App State
let isRunning = false;
let currentPhase = 'ready'; // ready, inhale, hold1, exhale, hold2
let currentRound = 1;
let timeRemaining = 0;
let timerInterval = null;
let animationTimeout = null;

// Audio Context for Chime
let audioCtx;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playChime() {
  if (!settings.chimeSound) return;
  
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 1.5); // C6
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 3);
}

// Voice Synthesis
function speakPhase(phrase) {
  if (!settings.voiceGuidance) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.9; // Slightly slower, calmer voice
    utterance.pitch = 1;
    // Try to find a calmer sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const calmVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English')));
    if (calmVoice) {
      utterance.voice = calmVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}

// Load voices proactively
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// Default Settings
const defaultSettings = {
  inhale: 4,
  hold1: 4,
  exhale: 4,
  hold2: 4,
  rounds: 0, // 0 = continuous
  voiceGuidance: true,
  chimeSound: true
};

let settings = { ...defaultSettings };

// DOM Elements
const elements = {
  phaseLabel: document.getElementById('phaseLabel'),
  countdown: document.getElementById('countdown'),
  roundInfo: document.getElementById('roundInfo'),
  breathingCircle: document.getElementById('breathingCircle'),
  startPauseBtn: document.getElementById('startPauseBtn'),
  resetBtn: document.getElementById('resetBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  settingsForm: document.getElementById('settingsForm'),
  inputs: {
    inhale: document.getElementById('inhaleTime'),
    hold1: document.getElementById('hold1Time'),
    exhale: document.getElementById('exhaleTime'),
    hold2: document.getElementById('hold2Time'),
    rounds: document.getElementById('totalRounds'),
    voiceGuidance: document.getElementById('voiceGuidance'),
    chimeSound: document.getElementById('chimeSound')
  }
};

// Initialize
function init() {
  loadSettings();
  updateUI();
  setupEventListeners();
}

// Settings Management
function loadSettings() {
  const savedSettings = localStorage.getItem('pranayamaSettings');
  if (savedSettings) {
    settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
  }
  
  // Update inputs
  elements.inputs.inhale.value = settings.inhale;
  elements.inputs.hold1.value = settings.hold1;
  elements.inputs.exhale.value = settings.exhale;
  elements.inputs.hold2.value = settings.hold2;
  elements.inputs.rounds.value = settings.rounds;
  elements.inputs.voiceGuidance.checked = settings.voiceGuidance;
  elements.inputs.chimeSound.checked = settings.chimeSound;
}

function saveSettings(e) {
  e.preventDefault();
  
  settings = {
    inhale: parseInt(elements.inputs.inhale.value) || 4,
    hold1: parseInt(elements.inputs.hold1.value) || 0,
    exhale: parseInt(elements.inputs.exhale.value) || 4,
    hold2: parseInt(elements.inputs.hold2.value) || 0,
    rounds: parseInt(elements.inputs.rounds.value) || 0,
    voiceGuidance: elements.inputs.voiceGuidance.checked,
    chimeSound: elements.inputs.chimeSound.checked
  };
  
  localStorage.setItem('pranayamaSettings', JSON.stringify(settings));
  closeSettings();
  
  // If not running, reset to apply new settings
  if (!isRunning && currentPhase === 'ready') {
    updateUI();
  } else {
    resetTimer();
  }
}

// Timer Logic
function startPause() {
  // Initialize audio context on first user interaction to satisfy browser policies
  getAudioContext();
  if ('speechSynthesis' in window && !window.speechSynthesis.speaking) {
      // Just an empty utterance to unlock speech on mobile
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
  }

  if (isRunning) {
    pauseTimer();
  } else {
    if (currentPhase === 'ready') {
      startNewCycle();
    } else {
      resumeTimer();
    }
  }
}

function startNewCycle() {
  isRunning = true;
  currentRound = 1;
  elements.startPauseBtn.textContent = 'Pause';
  elements.startPauseBtn.classList.replace('primary', 'secondary');
  elements.resetBtn.style.opacity = '1';
  
  playChime();
  setTimeout(() => {
    startPhase('inhale');
  }, 500); // Slight delay before first inhale
}

function startPhase(phase) {
  currentPhase = phase;
  let duration = settings[phase];
  
  // Skip phases with 0 duration
  if (duration <= 0) {
    nextPhase();
    return;
  }
  
  timeRemaining = duration;
  
  // UI Updates
  let phaseText = '';
  let speechText = '';
  let circleColor = '';
  
  // Reset circle classes
  elements.breathingCircle.className = 'breathing-circle';
  // Set transition duration exactly matching the phase duration
  elements.breathingCircle.style.setProperty('--duration', `${duration}s`);
  
  // Force a reflow so the duration change takes effect before adding the animation class
  void elements.breathingCircle.offsetWidth;

  switch (phase) {
    case 'inhale':
      phaseText = 'Inhale';
      speechText = 'Breathe In';
      circleColor = '#4a90e2';
      elements.breathingCircle.classList.add('inhale');
      break;
    case 'hold1':
      phaseText = 'Hold';
      speechText = 'Hold';
      circleColor = '#10b981';
      elements.breathingCircle.classList.add('hold');
      break;
    case 'exhale':
      phaseText = 'Exhale';
      speechText = 'Breathe Out';
      circleColor = '#f59e0b';
      elements.breathingCircle.classList.add('exhale');
      break;
    case 'hold2':
      phaseText = 'Hold';
      speechText = 'Hold';
      circleColor = '#ef4444';
      elements.breathingCircle.classList.add('hold');
      break;
  }
  
  elements.phaseLabel.textContent = phaseText;
  elements.phaseLabel.style.color = circleColor;
  elements.countdown.textContent = timeRemaining;
  
  speakPhase(speechText);
  updateRoundInfo();
  
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining > 0) {
      elements.countdown.textContent = timeRemaining;
    } else {
      clearInterval(timerInterval);
      nextPhase();
    }
  }, 1000);
}

function nextPhase() {
  switch (currentPhase) {
    case 'inhale':
      startPhase('hold1');
      break;
    case 'hold1':
      startPhase('exhale');
      break;
    case 'exhale':
      startPhase('hold2');
      break;
    case 'hold2':
      completeCycle();
      break;
  }
}

function completeCycle() {
  if (settings.rounds > 0 && currentRound >= settings.rounds) {
    // Finished
    finishSession();
  } else {
    // Next round
    currentRound++;
    playChime();
    startPhase('inhale');
  }
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  elements.startPauseBtn.textContent = 'Resume';
  elements.startPauseBtn.classList.replace('secondary', 'primary');
  
  // Freeze animation
  const computedStyle = window.getComputedStyle(elements.breathingCircle);
  const currentWidth = computedStyle.width;
  const currentHeight = computedStyle.height;
  
  elements.breathingCircle.style.width = currentWidth;
  elements.breathingCircle.style.height = currentHeight;
  elements.breathingCircle.style.transition = 'none';
}

function resumeTimer() {
  isRunning = true;
  elements.startPauseBtn.textContent = 'Pause';
  elements.startPauseBtn.classList.replace('primary', 'secondary');
  
  // Resume animation (approximated by removing the hardcoded styles and letting CSS take over with reduced duration)
  elements.breathingCircle.style.width = '';
  elements.breathingCircle.style.height = '';
  elements.breathingCircle.style.transition = '';
  elements.breathingCircle.style.setProperty('--duration', `${timeRemaining}s`);
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining > 0) {
      elements.countdown.textContent = timeRemaining;
    } else {
      clearInterval(timerInterval);
      nextPhase();
    }
  }, 1000);
}

function resetTimer() {
  isRunning = false;
  currentPhase = 'ready';
  currentRound = 1;
  timeRemaining = 0;
  clearInterval(timerInterval);
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  elements.startPauseBtn.textContent = 'Start';
  elements.startPauseBtn.classList.replace('secondary', 'primary');
  
  // Reset circle animation
  elements.breathingCircle.className = 'breathing-circle';
  elements.breathingCircle.style.width = '';
  elements.breathingCircle.style.height = '';
  elements.breathingCircle.style.transition = '';
  
  updateUI();
}

function finishSession() {
  isRunning = false;
  currentPhase = 'ready';
  clearInterval(timerInterval);
  
  elements.phaseLabel.textContent = 'Done';
  elements.phaseLabel.style.color = 'var(--success)';
  elements.countdown.textContent = '--';
  
  elements.startPauseBtn.textContent = 'Restart';
  elements.startPauseBtn.classList.replace('secondary', 'primary');
  
  speakPhase("Session complete");
  playChime();
  
  elements.breathingCircle.className = 'breathing-circle';
}

// UI Updates
function updateUI() {
  elements.phaseLabel.textContent = 'Ready';
  elements.phaseLabel.style.color = 'var(--primary-light)';
  elements.countdown.textContent = '--';
  updateRoundInfo();
}

function updateRoundInfo() {
  if (currentPhase === 'ready') {
    elements.roundInfo.textContent = settings.rounds > 0 ? `0 of ${settings.rounds} Rounds` : 'Continuous Mode';
  } else {
    elements.roundInfo.textContent = settings.rounds > 0 ? `Round ${currentRound} of ${settings.rounds}` : `Round ${currentRound} (Continuous)`;
  }
}

// Modal Handling
function openSettings() {
  if (isRunning) pauseTimer();
  elements.settingsModal.classList.remove('hidden');
}

function closeSettings() {
  elements.settingsModal.classList.add('hidden');
}

// Event Listeners
function setupEventListeners() {
  elements.startPauseBtn.addEventListener('click', startPause);
  elements.resetBtn.addEventListener('click', resetTimer);
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.closeSettingsBtn.addEventListener('click', closeSettings);
  elements.settingsForm.addEventListener('submit', saveSettings);
  
  // Close modal when clicking outside
  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
      closeSettings();
    }
  });
}

// Run app
document.addEventListener('DOMContentLoaded', init);
