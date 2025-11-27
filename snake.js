
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.fpsElement = document.getElementById('fps');
        this.snakeLengthElement = document.getElementById('snakeLength');
        this.foodPosElement = document.getElementById('foodPos');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.init();
    }
    
    init() {
        this.updateHighScore();
        this.setupControls();
        this.draw();
        setInterval(() => this.gameLoop(), 100);
    }
    
    setupControls() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.addEventListener('keydown', (e) => {
            this.handleKeypress(e);
        });
    }
    
    handleKeypress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction.y !== 1) {
                    this.direction = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y !== -1) {
                    this.direction = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x !== 1) {
                    this.direction = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x !== -1) {
                    this.direction = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.hideGameOver();
            this.generateFood();
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
        }
    }
    
    resetGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.frameCount = 0;
        this.generateFood();
        this.updateScore();
        this.hideGameOver();
        this.draw();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        this.updateDebugInfo();
        this.frameCount++;
    }
    
    update() {
        // Mover la serpiente
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Verificar si comió comida
        if (head.x === this.food.x && head.y === this.food.y) {
            this.ateFood();
        } else {
            this.snake.pop();
        }
    }
    
    ateFood() {
        this.score += 10;
        
        this.updateScore();
        this.generateFood();
    }
    
    generateFood() {
        let newFood;
        let attempts = 0;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
            
        } while (this.isOnSnake(newFood) && attempts < 50);
        
        this.food = newFood;
    }
    
    isOnSnake(position) {
        return this.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
    
    draw() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#27ae60';
        this.snake.forEach((segment, index) => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        // this.ctx.fillStyle = '#e74c3c';
        // this.ctx.fillRect(
        //     this.food.x * this.gridSize,
        //     this.food.y * this.gridSize,
        //     this.gridSize - 2,
        //     this.gridSize - 2
        // );
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
    }
    
    updateHighScore() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    updateDebugInfo() {
        this.snakeLengthElement.textContent = this.snake.length;
        this.foodPosElement.textContent = `(${this.food.x}, ${this.food.y})`;
        
        const now = performance.now();
        if (this.lastTime) {
            this.fps = Math.round(1000 / (now - this.lastTime));
        }
        this.lastTime = now;
        this.fpsElement.textContent = this.fps;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.finalScoreElement.textContent = this.score;
        this.showGameOver();
    }
    
    showGameOver() {
        this.gameOverElement.classList.remove('hidden');
    }
    
    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
    }
}

let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
});


setInterval(() => {
    console.log('Debug spam:', Math.random(), new Date(), 'Esto llena la consola innecesariamente');
}, 1000);