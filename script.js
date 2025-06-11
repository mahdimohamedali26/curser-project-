// DOM elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const breakButton = document.getElementById('break');
const musicButton = document.getElementById('music');
const focusMusic = document.getElementById('focusMusic');
const modeDisplay = document.getElementById('mode-display');

// Music control
let isMusicPlaying = false;

function toggleMusic() {
    if (isMusicPlaying) {
        focusMusic.pause();
        musicButton.classList.remove('playing');
    } else {
        focusMusic.play().catch(error => {
            console.log('Audio playback failed:', error);
        });
        musicButton.classList.add('playing');
    }
    isMusicPlaying = !isMusicPlaying;
}

// Timer variables
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
let timeLeft = WORK_TIME;
let timerId = null;
let isRunning = false;
let isWorkMode = true;

// Format time to display
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Update timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = formatTime(minutes);
    secondsDisplay.textContent = formatTime(seconds);
}

// Timer function
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                
                if (isWorkMode) {
                    alert('Work session completed! Time for a break!');
                    isWorkMode = false;
                    timeLeft = BREAK_TIME;
                    modeDisplay.textContent = 'Break Time';
                    setTheme(false);
                } else {
                    alert('Break time is over! Ready to work?');
                    isWorkMode = true;
                    timeLeft = WORK_TIME;
                    modeDisplay.textContent = 'Work Time';
                    setTheme(true);
                }
                
                updateDisplay();
            }
        }, 1000);
    }
}

// Pause timer
function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
}

// Reset timer
function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    isWorkMode = true;
    timeLeft = WORK_TIME;
    modeDisplay.textContent = 'Work Time';
    setTheme(true);
    updateDisplay();
}

// Function to start break
function setTheme(isWork) {
    if (isWork) {
        document.body.classList.add('focus-mode');
    } else {
        document.body.classList.remove('focus-mode');
    }
}

function startBreak() {
    clearInterval(timerId);
    isRunning = false;
    isWorkMode = false;
    timeLeft = BREAK_TIME;
    modeDisplay.textContent = 'Break Time';
    updateDisplay();
    setTheme(false);
    startTimer();
}

// Event listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
breakButton.addEventListener('click', startBreak);
musicButton.addEventListener('click', toggleMusic); 