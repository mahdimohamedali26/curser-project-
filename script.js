// Get all the elements we need
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const breakButton = document.getElementById('break');
const musicButton = document.getElementById('music');
const focusMusic = document.getElementById('focusMusic');
const breakMusic = document.getElementById('breakMusic');
const modeDisplay = document.getElementById('mode-display');
const volumeSlider = document.getElementById('volume');
const timerCircle = document.querySelector('.timer-circle');

// Timer settings
const WORK_TIME = 50 * 60; // 50 minutes
const BREAK_TIME = 5 * 60; // 5 minutes
const WARNING_TIME = 60; // 1 minute warning
let timeLeft = WORK_TIME;
let timerId = null;
let isRunning = false;
let isWorkMode = true;
let isMusicPlaying = false;
let lastTick = Date.now();

// Initialize the display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    // Update timer circle progress
    const progress = isWorkMode 
        ? 1 - (timeLeft / WORK_TIME)
        : 1 - (timeLeft / BREAK_TIME);
    timerCircle.style.setProperty('--progress', progress);
    
    // Add warning class when time is running low
    if (timeLeft <= WARNING_TIME) {
        timerCircle.classList.add('warning');
    } else {
        timerCircle.classList.remove('warning');
    }
}

// Timer functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        lastTick = Date.now();
        timerCircle.classList.add('active');
        updateButtonStates();
        
        timerId = setInterval(() => {
            const now = Date.now();
            const delta = now - lastTick;
            lastTick = now;
            
            // Calculate actual time passed (accounting for timer drift)
            const timePassed = Math.floor(delta / 1000);
            timeLeft = Math.max(0, timeLeft - timePassed);
            
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                timerCircle.classList.remove('active');
                
                // Play notification sound
                const notification = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                notification.play().catch(() => {});
                
                if (isWorkMode) {
                    showNotification('Work session completed! Time for a break!');
                    switchToBreak();
                } else {
                    showNotification('Break time is over! Ready to work?');
                    switchToWork();
                }
                
                updateButtonStates();
            }
        }, 100); // Update more frequently for smoother countdown
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        timerCircle.classList.remove('active');
        updateButtonStates();
    }
}

function switchToWork() {
    clearInterval(timerId);
    isRunning = false;
    isWorkMode = true;
    timeLeft = WORK_TIME;
    modeDisplay.textContent = 'Work Time';
    document.body.classList.add('focus-mode');
    updateDisplay();
    handleMusicSwitch();
    updateButtonStates();
}

function switchToBreak() {
    clearInterval(timerId);
    isRunning = false;
    isWorkMode = false;
    timeLeft = BREAK_TIME;
    modeDisplay.textContent = 'Break Time';
    document.body.classList.remove('focus-mode');
    updateDisplay();
    handleMusicSwitch();
    updateButtonStates();
}

function handleMusicSwitch() {
    if (isMusicPlaying) {
        focusMusic.pause();
        breakMusic.pause();
        const music = isWorkMode ? focusMusic : breakMusic;
        music.currentTime = 0;
        const playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Error playing music:', error);
                isMusicPlaying = false;
                musicButton.classList.remove('playing');
            });
        }
    }
}

function toggleMusic() {
    const music = isWorkMode ? focusMusic : breakMusic;
    
    if (isMusicPlaying) {
        music.pause();
        musicButton.classList.remove('playing');
        isMusicPlaying = false;
    } else {
        music.currentTime = 0;
        const playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicButton.classList.add('playing');
                isMusicPlaying = true;
            }).catch(error => {
                console.log('Error playing music:', error);
                isMusicPlaying = false;
                musicButton.classList.remove('playing');
            });
        }
    }
}

function updateButtonStates() {
    startButton.disabled = isRunning;
    pauseButton.disabled = !isRunning;
    breakButton.disabled = isRunning || !isWorkMode;
    resetButton.disabled = isRunning || isWorkMode;
    
    // Update button classes
    startButton.classList.toggle('disabled', isRunning);
    pauseButton.classList.toggle('disabled', !isRunning);
    breakButton.classList.toggle('disabled', isRunning || !isWorkMode);
    resetButton.classList.toggle('disabled', isRunning || isWorkMode);
}

function showNotification(message) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/2387/2387633.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Pomodoro Timer', {
                        body: message,
                        icon: 'https://cdn-icons-png.flaticon.com/512/2387/2387633.png'
                    });
                }
            });
        }
    }
    
    // Fallback to alert if notifications are not supported
    if (!('Notification' in window) || Notification.permission === 'denied') {
        alert(message);
    }
}

// Set up volume control
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    focusMusic.volume = volume;
    breakMusic.volume = volume;
});

// Initialize audio
function initAudio() {
    // Set initial volume
    const initialVolume = volumeSlider.value / 100;
    focusMusic.volume = initialVolume;
    breakMusic.volume = initialVolume;
    
    // Add event listeners for audio errors
    focusMusic.addEventListener('error', (e) => {
        console.log('Error loading focus music:', e);
    });
    
    breakMusic.addEventListener('error', (e) => {
        console.log('Error loading break music:', e);
    });
}

// Set up button click handlers
startButton.onclick = startTimer;
pauseButton.onclick = pauseTimer;
resetButton.onclick = switchToWork;
breakButton.onclick = switchToBreak;
musicButton.onclick = toggleMusic;

// Request notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}

// Initialize
initAudio();
updateDisplay();
updateButtonStates(); 