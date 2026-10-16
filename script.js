const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let telefone = "";
let tempoRestante = 60;
let pontos = 0;
let jogoAtivo = false;

// Jogador
let player = { x: 100, y: 310, w: 35, h: 45, vy: 0, speed: 6, grounded: true };
let keys = {};

// Obstáculo e Itens
let obstacle = { x: 800, w: 40, h: 40, speed: 5, materia: "MATEMÁTICA" };
let items = [];
const materias = ["MATEMÁTICA", "REDAÇÃO", "FÍSICA", "QUÍMICA", "BIOLOGIA", "PORTUGUÊS"];
const cursos = ["TADS", "BIOLOGIA", "GESTÃO", "SANEAMENTO", "TURISMO", "ED. FÍSICA"];

// Capturar eventos de teclado
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

document.getElementById("start-btn").addEventListener("click", () => {
    telefone = document.getElementById("phone-input").value;
    if (telefone.length < 8) {
        alert("Digite um número válido!");
        return;
    }
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    iniciarJogo();
});

function iniciarJogo() {
    jogoAtivo = true;
    
    // Timer principal de 60 segundos
    let timerInterval = setInterval(() => {
        if (!jogoAtivo) { clearInterval(timerInterval); return; }
        tempoRestante--;
        document.getElementById("timer-txt").innerText = `Tempo: ${tempoRestante}s`;
        
        // Troca de fase dinâmica a cada 15s
        let faseNum = Math.floor((60 - tempoRestante) / 15) + 1;
        document.getElementById("fase-txt").innerText = `Fase: ${faseNum <= 4 ? faseNum : 4}`;

        if (tempoRestante <= 0) {
            finalizarJogo("Parabéns! Você venceu o desafio!");
        }
    }, 1000);

    // Gerador de itens verdes (cursos)
    setInterval(() => {
        if (!jogoAtivo) return;
        items.push({
            x: Math.random() * 700 + 50,
            y: -20,
            radius: 16,
            curso: cursos[Math.floor(Math.random() * cursos.length)]
        });
    }, 2000);

    loopGame();
}

function loopGame() {
    if (!jogoAtivo) return;

    // Atualizações
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
    if (keys["Space"] && player.grounded) {
        player.vy = -13;
        player.grounded = false;
    }

    // Limites de tela horizontal
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;

    // Gravidade
    player.vy += 0.6;
    player.y += player.vy;
    if (player.y >= 310) {
        player.y = 310;
        player.vy = 0;
        player.grounded = true;
    }

    // Obstáculo
    obstacle.x -= obstacle.speed;
    if (obstacle.x < -50) {
        obstacle.x = 800;
        obstacle.materia = materias[Math.floor(Math.random() * materias.length)];
    }

    // Colisão com obstáculo
    if (player.x < obstacle.x + obstacle.w && player.x + player.w > obstacle.x && player.y + player.h > 350 - obstacle.h) {
        pontos -= 3;
    }

    // Atualizar itens (bolinhas verdes)
    items.forEach((item, index) => {
        item.y += 3;
        // Colisão com o jogador
        let distX = (player.x + player.w/2) - item.x;
        let distY = (player.y + player.h/2) - item.y;
        if (Math.sqrt(distX * distX + distY * distY) < 30) {
            pontos += 10;
            items.splice(index, 1);
        }
    });

    // Renderização no Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chão
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 350, canvas.width, 4);

    // Jogador (Quadrado Verde IFRR)
    ctx.fillStyle = "#008744";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Obstáculo (Barra Vermelha Vestibular)
    ctx.fillStyle = "#cc0000";
    ctx.fillRect(obstacle.x, 350 - obstacle.h, obstacle.w, obstacle.h);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText(obstacle.materia.substring(0,4), obstacle.x + 5, 335);

    // Desenhar Itens Verdes
    items.forEach(item => {
        ctx.fillStyle = "#2ecc71";
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.font = "bold 11px Arial";
        ctx.fillText(item.curso, item.x - 15, item.y - 20);
    });

    document.getElementById("score-txt").innerText = `Pontos: ${pontos}`;

    requestAnimationFrame(loopGame);
}

function finalizarJogo(mensagem) {
    jogoAtivo = false;
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("gameover-screen").classList.remove("hidden");
    document.getElementById("end-title").innerText = mensagem;
    document.getElementById("final-score").innerText = `Pontuação Final: ${pontos} pontos (Tel: ${telefone})`;
}