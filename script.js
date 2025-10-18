const boardEl = document.getElementById("board");
const numbersEl = document.querySelector(".numbers");
const livesEl = document.getElementById("lives");
const diffButtons = document.querySelectorAll(".diff-btn");
const themeButtons = document.querySelectorAll(".theme-btn");

let board = [], solution = [], selectedCell = null;
let lives = 3, difficulty = "easy", theme = "dark";
let difficultyLevels = { easy: 30, medium: 40, hard: 50 };

// Genera Sudoku semplice
function generateSudokuWithSolution(diff) {
  const solved = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];
  const puzzle = solved.map(r => [...r]);
  let empty = difficultyLevels[diff];
  while (empty > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; empty--; }
  }
  return { puzzle, solved };
}

function startGame() {
  difficultyLevels[difficulty] = Math.max(20, difficultyLevels[difficulty] + 5);
  const { puzzle, solved } = generateSudokuWithSolution(difficulty);
  board = puzzle; solution = solved;
  lives = 3; livesEl.textContent = "❤️ Vite: " + lives;
  renderBoard(); renderNumbers();
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (board[r][c] !== 0) { cell.textContent = board[r][c]; cell.classList.add("base"); }
      cell.dataset.row = r; cell.dataset.col = c; cell.dataset.wrongNum = "";
      cell.addEventListener("click", () => selectCell(r, c));
      boardEl.appendChild(cell);
    }
  }
}

function renderNumbers() {
  numbersEl.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("div");
    btn.classList.add("num-btn"); btn.textContent = i; btn.id = "num-btn-" + i;
    btn.addEventListener("click", () => handleNumberInput(i));
    numbersEl.appendChild(btn);
  }
  updateNumberButtons();
}

function selectCell(r, c) {
  document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("selected", "highlight", "same-number"));
  const cell = getCell(r, c); selectedCell = { r, c };
  cell.classList.add("selected"); highlightRelated(r, c);
}

function highlightRelated(r, c) {
  const value = board[r][c];
  document.querySelectorAll(".cell").forEach(cell => {
    const row = +cell.dataset.row, col = +cell.dataset.col;
    if (row === r || col === c || (Math.floor(row / 3) === Math.floor(r / 3) && Math.floor(col / 3) === Math.floor(c / 3))) cell.classList.add("highlight");
    if (value !== 0 && board[row][col] === value) cell.classList.add("same-number");
  });
}

function getCell(r, c) { return document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`); }

function handleNumberInput(num) {
  if (!selectedCell) return;
  const { r, c } = selectedCell;
  const cell = getCell(r, c);
  if (cell.classList.contains("base")) return;

  if (cell.textContent == num) {
    cell.textContent = ""; cell.classList.remove("correct", "wrong"); cell.dataset.wrongNum = ""; board[r][c] = 0;
    updateNumberButtons(); return;
  }

  board[r][c] = num; cell.textContent = num;

  if (solution[r][c] === num) {
    cell.classList.add("correct"); cell.classList.remove("wrong"); cell.dataset.wrongNum = "";
  } else {
    if (cell.dataset.wrongNum !== "yes") { lives--; livesEl.textContent = "❤️ Vite: " + lives; cell.dataset.wrongNum = "yes"; }
    cell.classList.add("wrong");
    if (lives <= 0) { alert("Hai perso!"); startGame(); return; }
  }
  updateNumberButtons();
}

function updateNumberButtons() {
  const counts = Array(10).fill(0);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (solution[r][c] === board[r][c]) counts[board[r][c]]++;
  for (let i = 1; i <= 9; i++) {
    const btn = document.getElementById("num-btn-" + i);
    btn.style.display = counts[i] >= 9 ? "none" : "flex";
  }
}

document.addEventListener("keydown", e => {
  if (!selectedCell) return;
  if (/^[1-9]$/.test(e.key)) handleNumberInput(Number(e.key));
  if (e.key === "Backspace" || e.key === "0") {
    const { r, c } = selectedCell; const cell = getCell(r, c);
    if (!cell.classList.contains("base")) {
      board[r][c] = 0; cell.textContent = ""; cell.classList.remove("correct", "wrong"); cell.dataset.wrongNum = "";
      updateNumberButtons();
    }
  }
});

diffButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    diffButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected"); difficulty = btn.dataset.diff; startGame();
  });
});

themeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    themeButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected"); theme = btn.dataset.theme;
    document.body.className = "theme-" + theme;
  });
});

startGame();
