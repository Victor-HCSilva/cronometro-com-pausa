let interval;
let isRunning = false;
let currentRound = 1;
let timeLeft = 0;
let isWorkPhase = true;

const displayTimer = document.getElementById('timer');
const displayStatus = document.getElementById('status');
const displayRounds = document.getElementById('round-indicator');
const startBtn = document.getElementById('startBtn');
const totalEstimateHtml = document.getElementById('totalEstimate');

// Atualiza o cálculo do tempo total em tempo real ao mudar inputs
function updateTotalEstimate() {
    const r = parseInt(document.getElementById('rounds').value);
    const w = parseInt(document.getElementById('workTime').value);
    const p = parseInt(document.getElementById('restTime').value);

    // Total = (Rodadas * Trabalho) + ((Rodadas - 1) * Pausa)
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

    runCycle(totalRounds, workTime, restTime);
}

function runCycle(totalRounds, workTime, restTime) {
    updateDisplay(totalRounds);

    interval = setInterval(() => {
        timeLeft--;

        if (timeLeft < 0) {
            if (isWorkPhase) {
                // Se terminou o trabalho e ainda há rodadas, vai para pausa
                if (currentRound < totalRounds) {
                    isWorkPhase = false;
                    timeLeft = restTime;
                } else {
                    // Fim de tudo
                    clearInterval(interval);
                    finish();
                    return;
                }
            } else {
                // Terminou a pausa, volta para o trabalho na próxima rodada
                isWorkPhase = true;
                currentRound++;
                timeLeft = workTime;
            }
        }

        updateDisplay(totalRounds);
    }, 1000);
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
    isRunning = false;
    startBtn.disabled = false;
    displayStatus.innerText = "Finalizado!";
    displayTimer.innerText = "00:00";
    document.querySelector('.display').className = "display";
    alert("Treino Concluído!");
}

function reset() {
    clearInterval(interval);
    isRunning = false;
    startBtn.disabled = false;
    displayStatus.innerText = "Pronto?";
    displayTimer.innerText = "00:00";
    displayRounds.innerText = "Rodada: 0 / 0";
    document.querySelector('.display').className = "display";
}

startBtn.addEventListener('click', startTimer);
document.getElementById('resetBtn').addEventListener('click', reset);

// Inicializa o valor total ao carregar
updateTotalEstimate();