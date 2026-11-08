let interval;
let isRunning = false;
let currentRound = 1;
let timeLeft = 0;
let isWorkPhase = true;
let runId = 0;

// --- CONFIGURAÇÃO DOS SONS ---
// Você pode substituir os links abaixo pelos caminhos dos seus arquivos locais: 'assets/sounds/nome.mp3'
const soundStart = new Audio('./assets/sounds/startSound.mp3');
const soundWork = new Audio('./assets/sounds/work.mp3');
const soundRest = new Audio('./assets/sounds/rest.mp3');
const soundFinish = new Audio('./assets/sounds/finish.mp3');
soundWork.loop = true;

const displayTimer = document.getElementById('timer');
const displayStatus = document.getElementById('status');
const displayRounds = document.getElementById('round-indicator');
const startBtn = document.getElementById('startBtn');
const totalEstimateHtml = document.getElementById('totalEstimate');

function updateTotalEstimate() {
    const r = parseInt(document.getElementById('rounds').value);
    const w = parseInt(document.getElementById('workTime').value);
    const p = parseInt(document.getElementById('restTime').value);
    const total = (r * w) + ((r - 1) * p);
    totalEstimateHtml.innerText = total > 0 ? total : 0;
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateTotalEstimate);
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) return;

    const totalRounds = parseInt(document.getElementById('rounds').value);
    const workTime = parseInt(document.getElementById('workTime').value);
    const restTime = parseInt(document.getElementById('restTime').value);

    isRunning = true;
    startBtn.disabled = true;
    currentRound = 1;
    isWorkPhase = true;
    timeLeft = workTime;
    const currentRunId = ++runId;

    stopSound(soundFinish);
    runCycle(totalRounds, workTime, restTime, currentRunId);
}

function runCycle(totalRounds, workTime, restTime, currentRunId) {
    updateDisplay(totalRounds);
    playStartCue(() => startWorkPhase(totalRounds, workTime, restTime, currentRunId), currentRunId);
}

function playStartCue(onComplete, currentRunId) {
    stopSound(soundStart);
    let completed = false;
    const startWork = () => {
        if (completed) return;
        completed = true;
        soundStart.onended = null;
        if (isRunning && runId === currentRunId) onComplete();
    };

    soundStart.onended = startWork;
    soundStart.play().catch(error => {
        console.error('Não foi possível reproduzir o som de início.', error);
        startWork();
    });
}

function startWorkPhase(totalRounds, workTime, restTime, currentRunId) {
    if (!isRunning || runId !== currentRunId) return;

    playSound(soundWork);
    interval = setInterval(() => {
        if (timeLeft <= 1) {
            clearInterval(interval);
            timeLeft = 0;
            updateDisplay(totalRounds);
            endWorkPhase(totalRounds, workTime, restTime, currentRunId);
            return;
        }

        timeLeft--;
        updateDisplay(totalRounds);
    }, 1000);
}

function endWorkPhase(totalRounds, workTime, restTime, currentRunId) {
    stopSound(soundWork);

    if (currentRound >= totalRounds) {
        finish();
        return;
    }

    isWorkPhase = false;
    timeLeft = restTime;
    updateDisplay(totalRounds);
    playSound(soundRest);

    interval = setInterval(() => {
        if (timeLeft <= 1) {
            clearInterval(interval);
            timeLeft = 0;
            updateDisplay(totalRounds);
            endRestPhase(totalRounds, workTime, restTime, currentRunId);
            return;
        }

        timeLeft--;
        updateDisplay(totalRounds);
    }, 1000);
}

function endRestPhase(totalRounds, workTime, restTime, currentRunId) {
    stopSound(soundRest);
    isWorkPhase = true;
    currentRound++;
    timeLeft = workTime;
    updateDisplay(totalRounds);
    playStartCue(() => startWorkPhase(totalRounds, workTime, restTime, currentRunId), currentRunId);
}

function playSound(sound) {
    sound.play().catch(error => {
        console.error('Não foi possível reproduzir o áudio.', error);
    });
}

function stopSound(sound) {
    sound.pause();
    sound.currentTime = 0;
}

function updateDisplay(totalRounds) {
    displayTimer.innerText = formatTime(timeLeft);
    const container = document.querySelector('.display');

    if (isWorkPhase) {
        displayStatus.innerText = "Trabalho!";
        container.className = "display working";
    } else {
        displayStatus.innerText = "Pausa";
        container.className = "display resting";
    }

    displayRounds.innerText = `Rodada: ${currentRound} / ${totalRounds}`;
}

function finish() {
    runId++;
    isRunning = false;
    startBtn.disabled = false;
    displayStatus.innerText = "Finalizado!";
    displayTimer.innerText = "00:00";
    document.querySelector('.display').className = "display";

    stopSound(soundStart);
    stopSound(soundWork);
    stopSound(soundRest);
    playSound(soundFinish);

    setTimeout(() => alert("Treino Concluído!"), 500);
}

function reset() {
    runId++;
    clearInterval(interval);
    isRunning = false;
    startBtn.disabled = false;
    stopSound(soundStart);
    stopSound(soundWork);
    stopSound(soundRest);
    stopSound(soundFinish);
    displayStatus.innerText = "Pronto?";
    displayTimer.innerText = "00:00";
    displayRounds.innerText = "Rodada: 0 / 0";
    document.querySelector('.display').className = "display";
}

startBtn.addEventListener('click', startTimer);
document.getElementById('resetBtn').addEventListener('click', reset);

updateTotalEstimate();