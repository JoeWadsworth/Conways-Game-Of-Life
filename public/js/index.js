const config = {
  WIDTH: 16,
  HEIGHT: 16,
  MARGIN: 1,
  ANIMATION: {
    MIN_INTERVAL: 0,
    MAX_INTERVAL: 500,
    DEFAULT_INTERVAL: 50
  },
  COLOUR: {
    LIVE_CELL: "#000",
    DEAD_CELL: "#FFF",
    BACKGROUND: "#FFF"
  }
};

const getXCoordinate = x => (config.MARGIN + config.WIDTH) * x + config.MARGIN;

const getYCoordinate = y => (config.MARGIN + config.HEIGHT) * y + config.MARGIN;

class GameOfLife {
  constructor(canvas, width, height, grid) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = canvas.getContext('2d');
    this.width = Math.round(width / (config.WIDTH + config.MARGIN));
    this.height = Math.round(height / (config.HEIGHT + config.MARGIN));
    this.grid = grid ? grid : createRandomGrid(this.width, this.height);
    this.speed = config.ANIMATION.DEFAULT_INTERVAL;
  };

  setSpeedController(speedController) {
    this.speedController = speedController;
    this.speedController.min = config.ANIMATION.MIN_INTERVAL;
    this.speedController.max = config.ANIMATION.MAX_INTERVAL;
    this.speedController.value = config.ANIMATION.MAX_INTERVAL - config.ANIMATION.DEFAULT_INTERVAL;
    return this;
  };

  getSpeed() {
    return this.speedController
      ? config.ANIMATION.MAX_INTERVAL - this.speedController.value
      : config.ANIMATION.DEFAULT_INTERVAL;
  }

  clear() {
    this.ctx.fillStyle = config.COLOUR.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };

  startAnimation() {
    if (!this.intervalKey) {
      this.drawSquares();
      this.intervalKey = window.setInterval(() => {
        this.grid = this.grid.map((cells, i) => cells.map((isAlive, j) => this.nextLife(j, i, isAlive)));
        this.drawSquares();

        if (this.speed !== this.speedController.value) {
          this.stopAnimation();
          this.startAnimation();
        }
      },
        this.getSpeed()
      );
    }
  };

  stopAnimation() {
    if (this.intervalKey !== null) {
      window.clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
  };

  drawSquare(x, y) {
    this.ctx.fillRect(getXCoordinate(x), getYCoordinate(y), config.WIDTH, config.HEIGHT);
  };

  drawSquares() {
    this.clear();
    this.grid.forEach((cells, y) => {
      cells.forEach((isAlive, x) => {
        this.ctx.fillStyle = isAlive ? config.COLOUR.LIVE_CELL : config.COLOUR.DEAD_CELL;
        this.drawSquare(x, y);
      });
    });
  }

  isAlive(x, y) {
    return this.grid[y] && this.grid[y][x] ? 1 : 0;
  }

  nextLife(x, y, isLive) {
    const numberOfLiveNeighbours = this.isAlive(x - 1, y - 1)
      + this.isAlive(x, y - 1)
      + this.isAlive(x + 1, y - 1)
      + this.isAlive(x - 1, y)
      + this.isAlive(x + 1, y)
      + this.isAlive(x - 1, y + 1)
      + this.isAlive(x, y + 1)
      + this.isAlive(x + 1, y + 1);

    return numberOfLiveNeighbours === 3 || (isLive && numberOfLiveNeighbours === 2) ? 1 : 0;
  }
}

const createRandomGrid = (width, height) => {
  let grid = [];

  for (let y = 0; y <= height; y++) {
    grid[y] = new Array(width);
    for (let x = 0; x <= width; x++) {
      grid[y][x] = Math.round(Math.random());
    }
  }

  return grid;
};

const canvas = document.getElementById("canvas");
const speedController = document.getElementById("speed-controller");

const engine = new GameOfLife(
  canvas,
  window.innerWidth,
  window.innerHeight - 56,
);

engine
  .setSpeedController(speedController)
  .startAnimation();