const canvas = document.getElementById("tetris");
const contex = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = 10;
const SQ = 20;
const EMPTY = "white";

//------------------Desenarea patratelor----------------------
function drawSquare(x, y, color) {
  contex.fillStyle = color;
  contex.fillRect(x * SQ, y * SQ, SQ, SQ);

  contex.strokeStyle = "green";
  contex.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

//------------------Creearea tablei---------------------------

let board = [];

for (r = 0; r < ROW; r++) {
  board[r] = [];
  for (c = 0; c < COL; c++) {
    board[r][c] = EMPTY;
  }
}

//------------------Desenarea tablei--------------------------
const drawBoard = () => {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
};

drawBoard();

//------------------Piesele si culoarea lor-------------------

const PIECES = [
  [Z, "orange"],
  [S, "yellow"],
  [T, "pink"],
  [O, "blue"],
  [L, "purple"],
  [I, "black"],
  [J, "red"],
];

const randomPiece = () => {
  let r = (randomNumber = Math.floor(Math.random() * PIECES.length));
  return new Piece(PIECES[r][0], PIECES[r][1]);
};

let p = randomPiece();

//------------------Creearea obiectului Piesa-----------------

function Piece(tetromino1, color) {
  this.tetromino = tetromino1;
  this.color = color;
  this.tetrominoNumber = 0; // z[0]
  this.activeTetromino = this.tetromino[this.tetrominoNumber];

  this.x = 3;
  this.y = -2;
}

Piece.prototype.rescriere = function (color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

//------------------Desenarea Piesei--------------------------

Piece.prototype.draw = function () {
  this.rescriere(this.color);
};

//------------------Stergerea Piesei--------------------------

Piece.prototype.unDraw = function () {
  this.rescriere(EMPTY);
};

//------------------Muta piesa in jos-------------------------

Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // blocam piesa si creez o noua piesa
    this.lock();
    p = randomPiece();
  }
};

//------------------Muta piesa la dreapta---------------------
Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
};

//------------------Muta piesa la stanga----------------------
Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
};

//------------------Schimba forma piesei----------------------
Piece.prototype.rotate = function () {
  let nextPattern =
    this.tetromino[(this.tetrominoNumber + 1) % this.tetromino.length];
  let move = 0;

  if (this.collision(0, 0, nextPattern)) {
    this.x > COL / 2 ? (move = -1) : (move = 1);
  }

  if (!this.collision(move, 0, nextPattern)) {
    this.unDraw();
    this.x += move;
    this.tetrominoNumber = (this.tetrominoNumber + 1) % this.tetromino.length; // (0+1)%4 => 1
    this.activeTetromino = this.tetromino[this.tetrominoNumber];
    this.draw();
  }
};

let score = 0;

//------------------Blocarea pieselor-------------------------
Piece.prototype.lock = function () {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // daca piesele ajung pana la y<0 , jocul se va opri
      if (this.y + r < 0) {
        alert("Game Over");
        gameOver = true;
        break;
      }
      // inchide piesa
      board[this.y + r][this.x + c] = this.color;
    }
  }
  // elimina daca se creeaza linia completa
  for (r = 0; r < ROW; r++) {
    let isRowFull = true;
    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && board[r][c] != EMPTY;
    }
    if (isRowFull) {
      //daca e true , mutam toate piesele mai jos
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      // the top row board[0][..] has no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = EMPTY;
      }

      score += 20;
    }
  }
  // update the board
  drawBoard();

  // update the score
  scoreElement.innerHTML = score;
};

//------------------Coliziunea pieselor-----------------------

Piece.prototype.collision = function (x, y, piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // daca piesa e goala , merge mai departe
      if (!piece[r][c]) {
        continue;
      }
      // noile coordonate ale piesei
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true;
      }

      if (newY < 0) {
        continue;
      }
      // verifica daca nu este o piesa ocupata
      if (board[newY][newX] != EMPTY) {
        return true;
      }
    }
  }
  return false;
};

//------------------Tastele de control------------------------

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
  if (event.keyCode == 37) {
    p.moveLeft();
  } else if (event.keyCode == 38) {
    p.rotate();
  } else if (event.keyCode == 39) {
    p.moveRight();
  } else if (event.keyCode == 40) {
    p.moveDown();
  }
}

//------------------Caderea pieselor 1s-----------------------

let gameOver = false;
let dropStart = Date.now();
// function drop(score) {
//   let now = Date.now();
//   let timer = now - dropStart;
//   if (timer > 1000) {
//     p.moveDown();
//     dropStart = Date.now();
//   }
//   if (!gameOver) {
//     requestAnimationFrame(drop);
//   }
// }

// drop();
