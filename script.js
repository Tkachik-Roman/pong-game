// Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 500;
const height = 700;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change Mobile Settings to Optimize Game Performance and Comfort of Playing
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

// Render Everything on Canvas
function renderCanvas() {
  // Canvas background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle color
  context.fillStyle = 'white';

  // Player paddle (on bottom of canvas)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

  // Computer paddle (on top of canvas)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed center line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = '32px Courier New';
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(computerScore, 20, canvas.height / 2 - 30);
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical speed
  ballY += -speedY;
  // Horizontal speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off left wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off right wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (on bottom of canvas)
  // Checking if ball has crossed boundary
  if (ballY > height - paddleDiff) {
    // Checking if ball contact with paddle
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Limit maximum permissible speed
        if (speedY < -5) {
          speedY = -5;
          // Increase speed of computer paddle
          computerSpeed = 6;
        }
      }
      // Сhange ball's movement direction to opposite
      speedY = -speedY;
      // Determining new ball's trajectory and speed
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (on top of canvas)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      if (playerMoved) {
        speedY += 1;
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement
function computerAI() {
  if (playerMoved) {
    // Сhoosing movement direction based on comparison center point of paddle vs ball
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

// Create "Game Over" Page
function showGameOverEl(winner) {
  // Hide canvas
  canvas.hidden = true;

  // Cleaning container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');

  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Победил!`;

  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Начать заново';

  // Append
  gameOverEl.append(title, playAgainBtn);
  body.appendChild(gameOverEl);
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set winner
    let winner = playerScore === winningScore ? 'Ты' : 'Киборг Т-1000';
    showGameOverEl(winner);
  }
}

// Called Every Frame
function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  computerAI();
  gameOver();
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
    canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;

    // Correcting paddle position in compliance with position of mouse inside canvas
    // Convert global coordinates to local canvas coordinates
    let rectangle = canvas.getBoundingClientRect();  // Getting canvas frame
    let x = e.clientX - rectangle.left;              // Сoordinate relative to canvas itself
    
    // Center position of paddle relative to mouse click
    paddleBottomX = x - paddleDiff;
    
    // Limit paddle movement to boundaries of canvas
    if (paddleBottomX < 0) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    
    // Hide cursor
    canvas.style.cursor = 'none';
});
}

// On Load
startGame();