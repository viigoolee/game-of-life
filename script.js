class GameOfLife {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cellSize = 10;
        this.cols = Math.floor(width / this.cellSize);
        this.rows = Math.floor(height / this.cellSize);
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.grid = this.createGrid();
        this.running = false;
        this.animationFrame = null;
        
        this.setupEventListeners();
        this.loadFromLocalStorage();
    }
    
    createGrid() {
        return Array(this.rows).fill().map(() => 
            Array(this.cols).fill(0)
        );
    }
    
    randomizeGrid() {
        this.grid = this.grid.map(row => 
            row.map(() => Math.random() > 0.8 ? 1 : 0)
        );
        this.draw();
        this.saveToLocalStorage();
    }
    
    clearGrid() {
        this.grid = this.createGrid();
        this.draw();
        this.saveToLocalStorage();
    }
    
    saveToLocalStorage() {
        localStorage.setItem('gameOfLifeGrid', JSON.stringify(this.grid));
    }
    
    loadFromLocalStorage() {
        const savedGrid = localStorage.getItem('gameOfLifeGrid');
        if (savedGrid) {
            this.grid = JSON.parse(savedGrid);
            this.draw();
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / this.cellSize);
            const y = Math.floor((event.clientY - rect.top) / this.cellSize);
            
            this.grid[y][x] = 1 - this.grid[y][x];
            this.draw();
            this.saveToLocalStorage();
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('randomizeBtn').addEventListener('click', () => this.randomizeGrid());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearGrid());
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = 'black';
                    this.ctx.fillRect(
                        x * this.cellSize, 
                        y * this.cellSize, 
                        this.cellSize - 1, 
                        this.cellSize - 1
                    );
                }
            }
        }
    }
    
    countNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = (x + dx + this.cols) % this.cols;
                const newY = (y + dy + this.rows) % this.rows;
                
                count += this.grid[newY][newX];
            }
        }
        return count;
    }
    
    nextGeneration() {
        const newGrid = this.createGrid();
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const neighbors = this.countNeighbors(x, y);
                
                if (this.grid[y][x] && (neighbors === 2 || neighbors === 3)) {
                    newGrid[y][x] = 1;
                } else if (!this.grid[y][x] && neighbors === 3) {
                    newGrid[y][x] = 1;
                }
            }
        }
        
        this.grid = newGrid;
        this.draw();
        this.saveToLocalStorage();
    }
    
    start() {
        if (!this.running) {
            this.running = true;
            this.animate();
        }
    }
    
    stop() {
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    animate() {
        if (this.running) {
            this.nextGeneration();
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    }
}

// Initialize Game of Life
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameOfLife(800, 600);
});
