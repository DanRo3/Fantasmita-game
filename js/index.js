
const gameCanvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('scoreValue');
const livesContainer = document.getElementById('livesContainer');
const gameOverScreen = document.getElementById('gameOver');
let score = 0;
let lives = 5;
let gameActive = true;

function updateLives() {
  livesContainer.innerHTML = '♥'.repeat(lives);
}

function createGhostSVG(color) {
  return `
    <svg viewBox="0 0 100 100" class="ghost">
      <path d="M 25,50 C 25,20 75,20 75,50 L 75,80 L 65,70 L 55,80 L 45,70 L 35,80 L 25,70 Z" fill="${color}"/>
      <circle cx="40" cy="40" r="5" fill="#000"/>
      <circle cx="60" cy="40" r="5" fill="#000"/>
    </svg>
  `;
}

function createGhost(type = 'normal') {
  const ghost = document.createElement('div');
  let color;
  switch(type) {
    case 'normal': // fantasmas blancos que dan puntos
      color = '#ffffff';
      break;
    case 'evil': // fantasmas rojos que quitan vida
      color = '#ff0000';
      break;
    case 'healing': // fantasmas amarillos que dan vida
      color = '#ffff00';
      break;
    default:
      color = '#ffffff';
  }
  
  ghost.innerHTML = createGhostSVG(color);
  ghost.style.position = 'absolute';
  ghost.style.left = Math.random() * (window.innerWidth - 50) + 'px';
  ghost.style.top = Math.random() * (window.innerHeight - 50) + 'px';
  ghost.style.animation = `float ${2 + Math.random() * 2}s infinite`;
  ghost.dataset.type = type;
  
  ghost.onclick = function() {
    if (!gameActive) return;
    
    switch(type) {
      case 'normal':
        score += 10;
        playPointSound();
        break;
      case 'evil':
        lives--;
        playHurtSound();
        break;
      case 'healing':
        lives = Math.min(lives + 1, 5);
        score += 50;
        playHealSound();
        break;
    }
    
    updateLives();
    scoreElement.textContent = score;
    ghost.remove();
    
    if (lives <= 0) {
      gameOver();
    } else {
      // Crear nuevo fantasma del mismo tipo después de un tiempo
      const delay = type === 'healing' ? 300000 : // 5 minutos para curativo
                    type === 'evil' ? 10000 : // 10 segundos para malvado
                    2000; // 2 segundos para normal
      setTimeout(() => createGhost(type), delay);
    }
  };

  gameCanvas.appendChild(ghost);
  
  // Movimiento aleatorio
  const moveInterval = setInterval(() => {
    if (!gameActive) {
      clearInterval(moveInterval);
      return;
    }
    const x = parseInt(ghost.style.left) + (Math.random() - 0.5) * 150;
    const y = parseInt(ghost.style.top) + (Math.random() - 0.5) * 150;
    ghost.style.left = Math.min(Math.max(0, x), window.innerWidth - 50) + 'px';
    ghost.style.top = Math.min(Math.max(0, y), window.innerHeight - 50) + 'px';
  }, 2000);
}

function gameOver() {
  gameActive = false;
  gameOverScreen.style.display = 'block';
  document.getElementById('finalScore').textContent = score;
  clearInterval(lifeRegenInterval);
}

function restartGame() {
  gameActive = true;
  lives = 5;
  score = 0;
  updateLives();
  scoreElement.textContent = score;
  gameOverScreen.style.display = 'none';
  
  // Eliminar todos los fantasmas existentes
  const ghosts = document.querySelectorAll('.ghost');
  ghosts.forEach(ghost => ghost.parentElement.remove());
  
  // Reiniciar el juego
  initGame();
}

function playPointSound() {
  const audio = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
  audio.play();
}

function playHurtSound() {
  const audio = new Audio('data:audio/wav;base64,UklGRh4PAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YfoOAACA7K+Vm6u7xMbCurSuqaqutb7Eyci+sKebn6y6yMvGvLSkm5ypucXLyMC2qZ2am6i2w8rJw7munpqaqLbDysnDuq6empqotsPKycO6rp6amqi2w8rJw7qunpqaqLbDysnDuq6empqotsPKycO6rp6amqi2w8rJw7qunpqaqLbDysnDuq6empqotsOouq2ppqKepK23vcK/t6qglZKVnai0v8nLw7aompiZn6y7x8vEuq6koZ6enqSwucHDwLqyq6impKWor7a7vr65s66ppaOipKqwt7y+vbexrKikoqOlq7G2u727urSvrKmop6eorK+ztbe3trOwrausrK2tsLGztLS0s7KysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKyraqvxdjb18y8pZONkZ2tw9Xd28/ArZySlZ+qvMzX3NjLtp+Pk5qktcfV29rPvqiXkpOYoK/Cz9fZ1se0opeVl5ymsL7L0tTRxbmpo6CfoaWruMHJzMzHvbGrqKempqu0vcPIycfBuLGsqqmpqq60ucDDxMO+t7KvrKysrbC0uLu9vby5tbOysLCwsbK0tbe3t7a1s7OztLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLOtp67D0tfZ1Mi4pZaSlZyqvcrV2tfKuKaZlZeep7fGz9XVzb6rnpmYm6CsvsbP1NLKvaqdmZiaoKu7xMzR0Mm/s6ahmpmaoqu3wMjNzcnBuK6opqWmqK62v8XIycfCu7WysLCvsLG0uL3AwcG/vLi2tbS0tLW2t7i5urq5uLe2tra2tra3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e2s6yqr7vHztHPxbqqoZ6en6ayvMXMz8zEuq6loqGipauwucDGycjEvrexrqysra6wtLe6vLy7ubazsbCwsLCxtLa4ubm4t7WzsrKysrKztba3t7i3tra1tbW1tbW1tbW2tra2tra2tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbKtp7C/ydDSz8W5raWhoaSqtb7Hz9DMwbetpaKipau0vcXLzcvGv7eysa+vsLG0t7q8vby6uLW0s7OztLW2t7i5ubm3trW0tLS0tLW2tra3t7e2tbW1tbW1tbW1tra2tra2trW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbSxq6i2wtDY29bLu6iZk5ScqbrJ1NvZ0MCqnZWVmqKvwM3X2tfMu6iblZWYna23xdDX2NO/r6CYlZacpbPAydLV0se7rqKbmZqgqbe/x87Pyr+2rqejoqSnrba+xcrMyMS9t7GuraytrrO3vcLFxsXCvLe1s7KysrO1t7m7vLy7ubm2s7KysrKys7S0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLOuqK6+zdne3dPEsaCWkpigr8PU3+Dbzrehl5KWnqm5zNrg39bGsqCWk5edqLrJ1t7e2Mu7qJqUlZqitMPP2NvYz8CvoZmWmJ6ntL/L0tTRxrqupKCfoaWruMHJzMzHvbGrqKempqu0vcPIycfBuLGsqqmpqq60ucDDxMO+t7KvrKysrbC0uLu9vby5tbOysLCwsbK0tbe3t7a1s7OztLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLOtp67D0tfZ1Mi4pZaSlZyqvcrV2tfKuKaZlZeep7fGz9XVzb6rnpmYm6CsvsbP1NLKvaqdmZiaoKu7xMzR0Mm/s6ahmpmaoqu3wMjNzcnBuK6opqWmqK62v8XIycfCu7WysLCvsLG0uL3AwcG/vLi2tbS0tLW2t7i5urq5uLe2tra2tra3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e2s6yqr7vHztHPxbqqoZ6en6ayvMXMz8zEuq6loqGipauwucDGycjEvrexrqysra6wtLe6vLy7ubazsbCwsLCxtLa4ubm4t7WzsrKysrKztba3t7i3tra1tbW1tbW1tbW2tra2tra2tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbKtp7C/ydDSz8W5raWhoaSqtb7Hz9DMwbetpaKipau0vcXLzcvGv7eysa+vsLG0t7q8vby6uLW0s7OztLW2t7i5ubm3trW0tLS0tLW2tra3t7e2tbW1tbW1tbW1tra2tra2trW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbSxq6qyt77DxcTAtK6qp6eprbO5v8LDwLqzrqmmp6mtsLa8wcLBvbeyraqqqquwtrq+wcC+u7axr66ur7G0uLu9vr27ubWysLCwsbO1t7m6urm3trOysrKys7W2t7i4uLe2tbS0tLS0tba2tra2trW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tLKtp7O/ytTX1Ma4p5mVmKCsv8vW2dbJt6WalpieppG90tLKv7ChmJqisL/M1NXRxbamnJiZoKy8yNLW1cy+r6GamZ2msb7J0NPQxryupqKhoqaut8DIzc3JwLawqqinp6muts');
  audio.play();
}

function playHealSound() {
  const audio = new Audio('data:audio/wav;base64,UklGRh4NAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YfoMAACAn6y5xMvLxbmpl5WYoba/ydDQyb2snpiZoK69x87OyL+wnpmanKi2w8vNyMGzop2bnaa0wMjLyMS2p5+cnqi3w8rLxr6voaCgpK64wcfJxsG5rqWjo6euuL/Ex8bDvLWrp6anqrG3vcLExMG+uLKtra2usba6vcDAwL65tbKxsbGytbe5u7y8u7m2tLOzs7O0tba3t7e3tra1tbW1tbW2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra1s62msLzIz9DLv66hmJabpLTBzNPTzMCvoJmXnKWyu8XP0s7Fuaqgl5eaoq/Ayc/Ryr+wpZ2Zm6Ktvcb');
  audio.play();
}

// Regeneración automática de vidas cada 1.5 minutos
const lifeRegenInterval = setInterval(() => {
  if (gameActive && lives < 5) {
    lives++;
    updateLives();
    playHealSound();
  }
}, 90000); // 90000ms = 1.5 minutos

function initGame() {
  updateLives();
  
  // Crear fantasmas blancos (normales) iniciales
  for(let i = 0; i < 30; i++) {
    createGhost('normal');
  }
  
  // Crear fantasmas rojos (malvados) cada 10 segundos
  setInterval(() => {
    if (gameActive && Math.random() < 0.7) { // 70% de probabilidad
      createGhost('evil');
    }
  }, 10000);
  
  // Crear fantasma curativo (amarillo) cada 5 minutos
  setInterval(() => {
    if (gameActive) {
      createGhost('healing');
    }
  }, 300000);
}

// Iniciar el juego
initGame();
