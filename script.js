const boardElement = document.getElementById('sudoku-board');
let cells = [];
let isLocked = false;
let cancelSolve = false; 
let cropper = null; 

// ==========================================
// 1. GRID INITIALIZATION & UI
// ==========================================
function createGrid() {
    boardElement.innerHTML = '';
    cells = [];
    cancelSolve = true; 
    
    for (let row = 0; row < 9; row++) {
        let rowArray = [];
        for (let col = 0; col < 9; col++) {
            const container = document.createElement('div');
            container.className = 'cell-container';
            
            let isDark1 = true;
            if ((row >= 3 && row < 6)) isDark1 = !isDark1;
            if ((col >= 3 && col < 6)) isDark1 = !isDark1;
            container.classList.add(isDark1 ? 'bg-dark1' : 'bg-dark2');

            const posDiv = document.createElement('div');
            posDiv.className = 'cell-possibilities';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'cell-input user-input';
            
            input.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^1-9]/g, '');
                e.target.value = val.length > 0 ? val[0] : '';
                cells[row][col].value = val.length > 0 ? parseInt(val[0]) : 0;
            });

            container.appendChild(posDiv);
            container.appendChild(input);
            boardElement.appendChild(container);

            rowArray.push({
                input: input,
                posDiv: posDiv,
                value: 0,
                possibilities: []
            });
        }
        cells.push(rowArray);
    }
}

function lockGrid() {
    isLocked = true;
    document.getElementById('btnLock').disabled = true;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            cells[r][c].input.readOnly = true;
            if (cells[r][c].value === 0) {
                cells[r][c].input.classList.remove('user-input');
            }
        }
    }
}

// ==========================================
// 2. POSSIBILITY MANAGEMENT
// ==========================================
function isValid(r, c, num) {
    for (let i = 0; i < 9; i++) {
        if (i !== c && cells[r][i].value === num) return false;
        if (i !== r && cells[i][c].value === num) return false;
    }
    let sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if ((sr+i !== r || sc+j !== c) && cells[sr+i][sc+j].value === num) return false;
        }
    }
    return true;
}

function initPossibilities() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value === 0) {
                cells[r][c].possibilities = [];
                for (let n = 1; n <= 9; n++) {
                    if (isValid(r, c, n)) cells[r][c].possibilities.push(n);
                }
            } else {
                cells[r][c].possibilities = [];
            }
        }
    }
    updatePossibilitiesUI();
}

function updatePossibilitiesUI() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value === 0) {
                let poss = cells[r][c].possibilities;
                let str = "";
                for(let i = 1; i <= 9; i++) {
                    str += poss.includes(i) ? i : "  ";
                    if (i % 3 === 0 && i !== 9) str += "\n";
                    else if (i !== 9) str += " ";
                }
                cells[r][c].posDiv.innerText = str;
            } else {
                cells[r][c].posDiv.innerText = "";
            }
        }
    }
}

function removePossibility(r, c, num) {
    if (cells[r][c].value === 0) {
        let idx = cells[r][c].possibilities.indexOf(num);
        if (idx !== -1) cells[r][c].possibilities.splice(idx, 1);
    }
}

function placeNumber(r, c, num, styleClass) {
    cells[r][c].value = num;
    cells[r][c].input.value = num;
    cells[r][c].input.className = `cell-input ${styleClass}`;
    cells[r][c].possibilities = [];

    for (let i = 0; i < 9; i++) {
        removePossibility(r, i, num);
        removePossibility(i, c, num);
    }
    let sr = Math.floor(r/3)*3, sc = Math.floor(c/3)*3;
    for(let i=0; i<3; i++) {
        for(let j=0; j<3; j++) removePossibility(sr+i, sc+j, num);
    }
    updatePossibilitiesUI();
}

// ==========================================
// 3. LOGIC ALGORITHMS (Now accepts dynamic color styles)
// ==========================================
function applyNakedSingles(currentStyle) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value === 0 && cells[r][c].possibilities.length === 1) {
                placeNumber(r, c, cells[r][c].possibilities[0], currentStyle);
                return true;
            }
        }
    }
    return false;
}

function applyHiddenSingles(currentStyle) {
    for(let num = 1; num <= 9; num++) {
        for(let b = 0; b < 9; b++) {
            let possibleCells = [];
            let sr = Math.floor(b/3)*3, sc = (b%3)*3;
            for(let i=0; i<3; i++) for(let j=0; j<3; j++) {
                if (cells[sr+i][sc+j].value === 0 && cells[sr+i][sc+j].possibilities.includes(num)) {
                    possibleCells.push({r:sr+i, c:sc+j});
                }
            }
            if (possibleCells.length === 1) { placeNumber(possibleCells[0].r, possibleCells[0].c, num, currentStyle); return true; }
        }
        for(let r = 0; r < 9; r++) {
            let possibleCells = [];
            for(let c=0; c<9; c++) {
                if (cells[r][c].value === 0 && cells[r][c].possibilities.includes(num)) possibleCells.push({r, c});
            }
            if (possibleCells.length === 1) { placeNumber(possibleCells[0].r, possibleCells[0].c, num, currentStyle); return true; }
        }
        for(let c = 0; c < 9; c++) {
            let possibleCells = [];
            for(let r=0; r<9; r++) {
                if (cells[r][c].value === 0 && cells[r][c].possibilities.includes(num)) possibleCells.push({r, c});
            }
            if (possibleCells.length === 1) { placeNumber(possibleCells[0].r, possibleCells[0].c, num, currentStyle); return true; }
        }
    }
    return false;
}

function applyNakedPairs() {
    let changed = false;
    function processGroup(group) {
        let unknown = group.filter(c => c.value === 0 && c.possibilities.length === 2);
        for (let i = 0; i < unknown.length; i++) {
            for (let j = i + 1; j < unknown.length; j++) {
                let p1 = unknown[i].possibilities, p2 = unknown[j].possibilities;
                if (p1[0] === p2[0] && p1[1] === p2[1]) {
                    for (let cell of group) {
                        if (cell !== unknown[i] && cell !== unknown[j] && cell.value === 0) {
                            let idx1 = cell.possibilities.indexOf(p1[0]);
                            if (idx1 !== -1) { cell.possibilities.splice(idx1, 1); changed = true; }
                            let idx2 = cell.possibilities.indexOf(p1[1]);
                            if (idx2 !== -1) { cell.possibilities.splice(idx2, 1); changed = true; }
                        }
                    }
                }
            }
        }
    }
    for (let r = 0; r < 9; r++) processGroup(cells[r]); 
    for (let c = 0; c < 9; c++) processGroup(cells.map(row => row[c])); 
    for (let b = 0; b < 9; b++) { 
        let group = [], sr = Math.floor(b/3)*3, sc = (b%3)*3;
        for(let i=0; i<3; i++) for(let j=0; j<3; j++) group.push(cells[sr+i][sc+j]);
        processGroup(group);
    }
    return changed;
}

function applyPointingPairs() {
    let changed = false;
    for (let b = 0; b < 9; b++) {
        let sr = Math.floor(b/3)*3, sc = (b%3)*3;
        for (let num = 1; num <= 9; num++) {
            let pRows = new Set(), pCols = new Set();
            for(let i=0; i<3; i++) for(let j=0; j<3; j++) {
                if (cells[sr+i][sc+j].value === 0 && cells[sr+i][sc+j].possibilities.includes(num)) {
                    pRows.add(sr+i); pCols.add(sc+j);
                }
            }
            if (pRows.size === 1) { 
                let r = Array.from(pRows)[0];
                for (let c = 0; c < 9; c++) {
                    if (Math.floor(c/3)*3 !== sc && cells[r][c].value === 0) {
                        let idx = cells[r][c].possibilities.indexOf(num);
                        if (idx !== -1) { cells[r][c].possibilities.splice(idx, 1); changed = true; }
                    }
                }
            }
            if (pCols.size === 1) { 
                let c = Array.from(pCols)[0];
                for (let r = 0; r < 9; r++) {
                    if (Math.floor(r/3)*3 !== sr && cells[r][c].value === 0) {
                        let idx = cells[r][c].possibilities.indexOf(num);
                        if (idx !== -1) { cells[r][c].possibilities.splice(idx, 1); changed = true; }
                    }
                }
            }
        }
    }
    return changed;
}

// ==========================================
// 4. SMART VISUAL SOLVER (Logic + Estimation)
// ==========================================

// Saves the full board state (including colors) to rollback if a guess is wrong
function saveState() {
    return cells.map(row => row.map(c => ({
        value: c.value,
        possibilities: [...c.possibilities],
        className: c.input.className
    })));
}

function restoreState(saved) {
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            cells[r][c].value = saved[r][c].value;
            cells[r][c].input.value = saved[r][c].value === 0 ? "" : saved[r][c].value;
            cells[r][c].input.className = saved[r][c].className;
            cells[r][c].possibilities = [...saved[r][c].possibilities];
        }
    }
    updatePossibilitiesUI();
}

// The core engine: runs logic. If stuck, makes ONE guess, then recurses to run logic again.
async function doSmartSolve(currentStyle) {
    if (cancelSolve) return false;

    // Phase 1: Run standard human logic rules
    let changed = true;
    while (changed && !cancelSolve) {
        await new Promise(res => setTimeout(res, 200)); 
        changed = false;

        if (applyNakedSingles(currentStyle)) { changed = true; continue; }
        if (applyHiddenSingles(currentStyle)) { changed = true; continue; }
        if (applyNakedPairs()) { updatePossibilitiesUI(); changed = true; continue; }
        if (applyPointingPairs()) { updatePossibilitiesUI(); changed = true; continue; }
    }

    if (cancelSolve) return false;

    // Phase 2: Check if solved, or find the best cell to guess
    let bestR = -1, bestC = -1, minP = 10;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value === 0) {
                let len = cells[r][c].possibilities.length;
                if (len === 0) return false; // Dead End! The guess was wrong.
                
                if (len < minP) {
                    minP = len;
                    bestR = r;
                    bestC = c;
                }
            }
        }
    }

    if (bestR === -1) return true; // Solved!

    // Phase 3: Estimation
    let poss = [...cells[bestR][bestC].possibilities]; 
    for (let num of poss) {
        let savedState = saveState(); 
        
        // Place the guess in Purple
        placeNumber(bestR, bestC, num, 'guess-input'); 
        await new Promise(res => setTimeout(res, 50));
        
        // Call the logic loop again, passing 'guess-input'. 
        // Any logic rules triggered by this guess will now be colored purple!
        if (await doSmartSolve('guess-input')) {
            return true;
        }
        
        // If we get here, the logic hit a dead end. Rollback and try the next possibility.
        restoreState(savedState);
        await new Promise(res => setTimeout(res, 20));
    }
    
    return false;
}

// ==========================================
// 5. MAIN SOLVE TRIGGERS
// ==========================================
async function visualSolve() {
    if (!isLocked) lockGrid();
    cancelSolve = false;
    initPossibilities();

    // Start the solve with standard blue text ('solved-input')
    const success = await doSmartSolve('solved-input');
    if (!success && !cancelSolve) alert("System Error: No valid solution found.");
    
    if (!cancelSolve) updatePossibilitiesUI(); 
}

// Fast solve cascades the answers from top-left to bottom-right instantly
async function fastSolve() {
    if (!isLocked) lockGrid();
    cancelSolve = true; 
    
    await new Promise(res => setTimeout(res, 50)); 
    cancelSolve = false; 

    let grid = [];
    for (let r = 0; r < 9; r++) {
        let row = [];
        for (let c = 0; c < 9; c++) row.push(cells[r][c].value);
        grid.push(row);
    }

    function fastIsValid(g, r, c, num) {
        for (let i = 0; i < 9; i++) if (g[r][i] === num || g[i][c] === num) return false;
        let sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g[sr + i][sc + j] === num) return false;
        return true;
    }

    function backtrack(g) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (g[r][c] === 0) {
                    for (let n = 1; n <= 9; n++) {
                        if (fastIsValid(g, r, c, n)) {
                            g[r][c] = n;
                            if (backtrack(g)) return true;
                            g[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    if (backtrack(grid)) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (cancelSolve) return; 
                
                if (cells[r][c].value === 0) {
                    placeNumber(r, c, grid[r][c], 'solved-input');
                    await new Promise(res => setTimeout(res, 30)); 
                }
            }
        }
        updatePossibilitiesUI(); 
    } else {
        alert("System Error: No valid solution found.");
    }
}

// ==========================================
// 6. IMAGE CROP, OCR LOGIC & REFERENCE
// ==========================================
function applyThresholding(ctx, width, height) {
    let imgData = ctx.getImageData(0, 0, width, height);
    let data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        let color = avg < 140 ? 0 : 255; 
        data[i] = data[i + 1] = data[i + 2] = color;
    }
    ctx.putImageData(imgData, 0, 0);
}

document.getElementById('imageUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const cropImage = document.getElementById('cropImage');
    cropImage.src = url;

    document.getElementById('cropOverlay').classList.add('active');

    if (cropper) cropper.destroy();

    cropImage.onload = () => {
        cropper = new Cropper(cropImage, {
            aspectRatio: 1, 
            viewMode: 1,
            autoCropArea: 0.9,
            background: false,
            zoomable: false
        });
    };
    event.target.value = ''; 
});

document.getElementById('btnCancelCrop').addEventListener('click', () => {
    document.getElementById('cropOverlay').classList.remove('active');
    if (cropper) cropper.destroy();
});

document.getElementById('btnConfirmCrop').addEventListener('click', async () => {
    if (!cropper) return;
    
    const croppedCanvas = cropper.getCroppedCanvas();
    document.getElementById('cropOverlay').classList.remove('active');
    if (cropper) cropper.destroy();

    const refPanel = document.getElementById('reference-panel');
    const refImg = document.getElementById('reference-image');
    refImg.src = croppedCanvas.toDataURL('image/png');
    refPanel.style.display = 'block';

    await runOCR(croppedCanvas);
});

async function runOCR(sourceCanvas) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    overlay.classList.add('active');

    try {
        const ctx = sourceCanvas.getContext('2d');
        applyThresholding(ctx, sourceCanvas.width, sourceCanvas.height);

        const cellW = sourceCanvas.width / 9, cellH = sourceCanvas.height / 9;

        loadingText.innerText = "LOADING OCR ENGINE...";
        const worker = await Tesseract.createWorker('eng');
        
        await worker.setParameters({ 
            tessedit_char_whitelist: '123456789',
            tessedit_pageseg_mode: 10 
        });

        createGrid();
        isLocked = false;
        document.getElementById('btnLock').disabled = false;

        let cellsProcessed = 0;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                loadingText.innerText = `SCANNING SECTOR [${cellsProcessed + 1}/81]...`;
                
                const cellCanvas = document.createElement('canvas');
                const paddingW = cellW * 0.20; 
                const paddingH = cellH * 0.20;
                
                cellCanvas.width = cellW - (paddingW * 2); 
                cellCanvas.height = cellH - (paddingH * 2);
                const cCtx = cellCanvas.getContext('2d');
                
                cCtx.drawImage(
                    sourceCanvas, 
                    (c * cellW) + paddingW, (r * cellH) + paddingH, cellCanvas.width, cellCanvas.height, 
                    0, 0, cellCanvas.width, cellCanvas.height
                );

                const { data: { text, confidence } } = await worker.recognize(cellCanvas);
                const num = text.replace(/[^1-9]/g, ''); 
                
                if (num && num.length > 0 && confidence > 40) {
                    cells[r][c].value = parseInt(num[0]);
                    cells[r][c].input.value = num[0];
                    cells[r][c].input.className = 'cell-input user-input'; 
                }
                cellsProcessed++;
            }
        }
        await worker.terminate();
        loadingText.innerText = "MATRIX DECODED.";

    } catch (err) {
        console.error("OCR Error:", err);
        alert("Scan Failed. System error during decoding.");
    } finally {
        setTimeout(() => { overlay.classList.remove('active'); }, 500);
    }
}

document.getElementById('btnCloseRef').addEventListener('click', () => {
    document.getElementById('reference-panel').style.display = 'none';
});

// ==========================================
// 7. BASE EVENT LISTENERS
// ==========================================
document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('btnLock').disabled = false;
    isLocked = false;
    createGrid();
    document.getElementById('reference-panel').style.display = 'none';
});

document.getElementById('btnLock').addEventListener('click', () => {
    lockGrid();
    initPossibilities(); 
});

document.getElementById('btnSolve').addEventListener('click', visualSolve);
document.getElementById('btnFastSolve').addEventListener('click', fastSolve);

// Prevent context menu (Save Image popup) during mobile cropping
document.getElementById('cropOverlay').addEventListener('contextmenu', event => event.preventDefault());

createGrid();

// ==========================================
// 8. MATRIX RAIN EFFECT (Cyberpunk Theme)
// ==========================================
const matrixCanvas = document.getElementById('matrix-bg');
const ctxMatrix = matrixCanvas.getContext('2d');

matrixCanvas.width = window.innerWidth;
matrixCanvas.height = window.innerHeight;

const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const alphabet = katakana + latin + nums;

const fontSize = 16;
const columns = matrixCanvas.width / fontSize;

const drops = [];
for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctxMatrix.fillStyle = 'rgba(15, 23, 42, 0.1)'; 
    ctxMatrix.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    ctxMatrix.fillStyle = '#14b8a6'; 
    ctxMatrix.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctxMatrix.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

window.addEventListener('resize', () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
});