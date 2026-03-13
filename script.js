const boardElement = document.getElementById('sudoku-board');
let cells = [];
let isLocked = false;
let cancelSolve = false; 
let cropper = null; 

// NEW: History State Array for Replay System
let solveHistory = [];
let currentStep = 0;
let autoPlayInterval = null;

// ==========================================
// 1. GRID INITIALIZATION & UI
// ==========================================
function createGrid() {
    boardElement.innerHTML = '';
    cells = [];
    cancelSolve = true; 
    if(autoPlayInterval) clearInterval(autoPlayInterval);
    
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

            rowArray.push({ input: input, posDiv: posDiv, value: 0, possibilities: [] });
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
            if (cells[r][c].value === 0) cells[r][c].input.classList.remove('user-input');
        }
    }
}

// ==========================================
// 2. POSSIBILITY MANAGEMENT & SNAPSHOTS
// ==========================================
function isValid(r, c, num) {
    for (let i = 0; i < 9; i++) {
        if (i !== c && cells[r][i].value === num) return false;
        if (i !== r && cells[i][c].value === num) return false;
    }
    let sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if ((sr+i !== r || sc+j !== c) && cells[sr+i][sc+j].value === num) return false;
    return true;
}

function initPossibilities() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value === 0) {
                cells[r][c].possibilities = [];
                for (let n = 1; n <= 9; n++) if (isValid(r, c, n)) cells[r][c].possibilities.push(n);
            } else cells[r][c].possibilities = [];
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
            } else cells[r][c].posDiv.innerText = "";
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
    for (let i = 0; i < 9; i++) { removePossibility(r, i, num); removePossibility(i, c, num); }
    let sr = Math.floor(r/3)*3, sc = Math.floor(c/3)*3;
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) removePossibility(sr+i, sc+j, num);
    updatePossibilitiesUI();
}

function saveState() {
    return cells.map(row => row.map(c => ({ value: c.value, possibilities: [...c.possibilities], className: c.input.className })));
}

function restoreState(saved) {
    for(let r=0; r<9; r++) for(let c=0; c<9; c++) {
        cells[r][c].value = saved[r][c].value;
        cells[r][c].input.value = saved[r][c].value === 0 ? "" : saved[r][c].value;
        cells[r][c].input.className = saved[r][c].className;
        cells[r][c].possibilities = [...saved[r][c].possibilities];
    }
    updatePossibilitiesUI();
}

// NEW: Record a snapshot for the timeline
function recordStep(message) {
    solveHistory.push({
        boardState: saveState(),
        message: message
    });
}

// ==========================================
// 3. LOGIC ALGORITHMS (Now records steps instantly)
// ==========================================
function applyNakedSingles(currentStyle) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value === 0 && cells[r][c].possibilities.length === 1) {
                let num = cells[r][c].possibilities[0];
                placeNumber(r, c, num, currentStyle);
                recordStep(`Naked Single: Placed ${num} at Row ${r+1}, Col ${c+1}.`);
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
            for(let i=0; i<3; i++) for(let j=0; j<3; j++) if (cells[sr+i][sc+j].value === 0 && cells[sr+i][sc+j].possibilities.includes(num)) possibleCells.push({r:sr+i, c:sc+j});
            if (possibleCells.length === 1) { 
                placeNumber(possibleCells[0].r, possibleCells[0].c, num, currentStyle); 
                recordStep(`Hidden Single: '${num}' must go in Block ${b+1} at Row ${possibleCells[0].r+1}, Col ${possibleCells[0].c+1}.`);
                return true; 
            }
        }
        for(let r = 0; r < 9; r++) {
            let possibleCells = [];
            for(let c=0; c<9; c++) if (cells[r][c].value === 0 && cells[r][c].possibilities.includes(num)) possibleCells.push({r, c});
            if (possibleCells.length === 1) { 
                placeNumber(possibleCells[0].r, possibleCells[0].c, num, currentStyle); 
                recordStep(`Hidden Single: '${num}' must go in Row ${possibleCells[0].r+1} at Col ${possibleCells[0].c+1}.`);
                return true; 
            }
        }
        for(let c = 0; c < 9; c++) {
            let possibleCells = [];
            for(let r=0; r<9; r++) if (cells[r][c].value === 0 && cells[r][c].possibilities.includes(num)) possibleCells.push({r, c});
            if (possibleCells.length === 1) { 
                placeNumber(possibleCells[0].r, possibleCells[0].c, num, currentStyle); 
                recordStep(`Hidden Single: '${num}' must go in Col ${possibleCells[0].c+1} at Row ${possibleCells[0].r+1}.`);
                return true; 
            }
        }
    }
    return false;
}

function applyNakedPairs() {
    function processGroup(group, groupName) {
        let unknown = group.filter(c => c.value === 0 && c.possibilities.length === 2);
        for (let i = 0; i < unknown.length; i++) {
            for (let j = i + 1; j < unknown.length; j++) {
                let p1 = unknown[i].possibilities, p2 = unknown[j].possibilities;
                if (p1[0] === p2[0] && p1[1] === p2[1]) {
                    let changed = false;
                    for (let cell of group) {
                        if (cell !== unknown[i] && cell !== unknown[j] && cell.value === 0) {
                            let idx1 = cell.possibilities.indexOf(p1[0]);
                            if (idx1 !== -1) { cell.possibilities.splice(idx1, 1); changed = true; }
                            let idx2 = cell.possibilities.indexOf(p1[1]);
                            if (idx2 !== -1) { cell.possibilities.splice(idx2, 1); changed = true; }
                        }
                    }
                    if (changed) {
                        updatePossibilitiesUI();
                        recordStep(`Naked Pair: [${p1[0]}, ${p1[1]}] found in ${groupName}. Eliminated from other cells.`);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    for (let r = 0; r < 9; r++) if(processGroup(cells[r], `Row ${r+1}`)) return true;
    for (let c = 0; c < 9; c++) if(processGroup(cells.map(row => row[c]), `Col ${c+1}`)) return true;
    for (let b = 0; b < 9; b++) { 
        let group = [], sr = Math.floor(b/3)*3, sc = (b%3)*3;
        for(let i=0; i<3; i++) for(let j=0; j<3; j++) group.push(cells[sr+i][sc+j]);
        if(processGroup(group, `Block ${b+1}`)) return true;
    }
    return false;
}

function applyPointingPairs() {
    for (let b = 0; b < 9; b++) {
        let sr = Math.floor(b/3)*3, sc = (b%3)*3;
        for (let num = 1; num <= 9; num++) {
            let pRows = new Set(), pCols = new Set();
            for(let i=0; i<3; i++) for(let j=0; j<3; j++) {
                if (cells[sr+i][sc+j].value === 0 && cells[sr+i][sc+j].possibilities.includes(num)) { pRows.add(sr+i); pCols.add(sc+j); }
            }
            if (pRows.size === 1) { 
                let r = Array.from(pRows)[0], changed = false;
                for (let c = 0; c < 9; c++) if (Math.floor(c/3)*3 !== sc && cells[r][c].value === 0) {
                    let idx = cells[r][c].possibilities.indexOf(num);
                    if (idx !== -1) { cells[r][c].possibilities.splice(idx, 1); changed = true; }
                }
                if (changed) {
                    updatePossibilitiesUI();
                    recordStep(`Pointing Pair: '${num}' is confined to Row ${r+1} inside Block ${b+1}. Eliminated from rest of row.`);
                    return true;
                }
            }
            if (pCols.size === 1) { 
                let c = Array.from(pCols)[0], changed = false;
                for (let r = 0; r < 9; r++) if (Math.floor(r/3)*3 !== sr && cells[r][c].value === 0) {
                    let idx = cells[r][c].possibilities.indexOf(num);
                    if (idx !== -1) { cells[r][c].possibilities.splice(idx, 1); changed = true; }
                }
                if (changed) {
                    updatePossibilitiesUI();
                    recordStep(`Pointing Pair: '${num}' is confined to Col ${c+1} inside Block ${b+1}. Eliminated from rest of col.`);
                    return true;
                }
            }
        }
    }
    return false;
}

// ==========================================
// 4. INSTANT BACKGROUND SOLVER
// ==========================================
function doSmartSolveSync(currentStyle) {
    if (cancelSolve) return false;
    
    // Safety cap
    if (solveHistory.length > 3000) {
        cancelSolve = true;
        recordStep("Memory Limit: Too many steps. Try providing more starting numbers.");
        return false;
    }

    let changed = true;
    while (changed && !cancelSolve) {
        changed = false;
        if (applyNakedSingles(currentStyle)) { changed = true; continue; }
        if (applyHiddenSingles(currentStyle)) { changed = true; continue; }
        if (applyNakedPairs()) { changed = true; continue; }
        if (applyPointingPairs()) { changed = true; continue; }
    }

    if (cancelSolve) return false;

    let bestR = -1, bestC = -1, minP = 10;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (cells[r][c].value === 0) {
                let len = cells[r][c].possibilities.length;
                if (len === 0) return false; 
                if (len < minP) { minP = len; bestR = r; bestC = c; }
            }
        }
    }

    if (bestR === -1) return true; // Solved

    let poss = [...cells[bestR][bestC].possibilities]; 
    for (let num of poss) {
        let savedState = saveState(); 
        placeNumber(bestR, bestC, num, 'guess-input'); 
        recordStep(`Logic Exhausted: Estimating and placing ${num} at Row ${bestR+1}, Col ${bestC+1}.`);
        
        if (doSmartSolveSync('guess-input')) return true;
        
        restoreState(savedState);
        recordStep(`Dead End Reached: Backtracked and reversed estimation of ${num} at Row ${bestR+1}, Col ${bestC+1}.`);
    }
    
    return false;
}

// ==========================================
// 5. PLAYBACK CONTROLS
// ==========================================
function applyHistoryStep(index) {
    if (index < 0 || index >= solveHistory.length) return;
    currentStep = index;
    restoreState(solveHistory[index].boardState);
    
    document.getElementById('step-message').innerText = `>_ [Step ${index + 1}/${solveHistory.length}]:\n${solveHistory[index].message}`;
    document.getElementById('btnPrevStep').disabled = (index === 0);
    document.getElementById('btnNextStep').disabled = (index === solveHistory.length - 1);
    document.getElementById('btnPlayPause').disabled = false;
    document.getElementById('stepSlider').value = index; // Move slider to current step
}

document.getElementById('btnNextStep').addEventListener('click', () => applyHistoryStep(currentStep + 1));
document.getElementById('btnPrevStep').addEventListener('click', () => applyHistoryStep(currentStep - 1));

document.getElementById('btnPlayPause').addEventListener('click', () => {
    const btn = document.getElementById('btnPlayPause');
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        btn.innerText = 'Auto-Play';
    } else {
        btn.innerText = 'Pause';
        if (currentStep >= solveHistory.length - 1) applyHistoryStep(0); 
        
        autoPlayInterval = setInterval(() => {
            if (currentStep < solveHistory.length - 1) {
                applyHistoryStep(currentStep + 1);
            } else {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                btn.innerText = 'Auto-Play';
            }
        }, 500); // Speed: 500ms per step
    }
});

// ==========================================
// 6. MAIN SOLVE TRIGGERS (UPDATED)
// ==========================================
function visualSolve() {
    if (!isLocked) lockGrid();
    cancelSolve = false;
    solveHistory = [];
    
    initPossibilities();
    recordStep("System Locked. Initial possibilities calculated.");

    // Solve instantly in background
    const success = doSmartSolveSync('solved-input');
    
    if (success) recordStep("Matrix Decoded. Grid successfully solved.");
    else if (!cancelSolve) recordStep("System Error: No valid solution found. Puzzle may be invalid.");
    
    // Show wrapper, trigger Replay Tab, load Step 0
    document.getElementById('side-panel-wrapper').style.display = 'block';
    document.getElementById('tabBtnReplay').click();
    // Setup the timeline slider
    const slider = document.getElementById('stepSlider');
    slider.max = solveHistory.length - 1;
    slider.disabled = false;
    slider.value = 0;
    applyHistoryStep(0); 
}

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
// 7. IMAGE CROP, OCR LOGIC & REFERENCE
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
        cropper = new Cropper(cropImage, { aspectRatio: 1, viewMode: 1, autoCropArea: 0.9, background: false, zoomable: false });
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

    document.getElementById('side-panel-wrapper').style.display = 'block';
    document.getElementById('tabBtnReference').click(); 
    
    const refImg = document.getElementById('reference-image');
    refImg.src = croppedCanvas.toDataURL('image/png');

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
        await worker.setParameters({ tessedit_char_whitelist: '123456789', tessedit_pageseg_mode: 10 });

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

// ==========================================
// 8. BASE EVENT LISTENERS
// ==========================================
document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('btnLock').disabled = false;
    isLocked = false;
    createGrid();
    document.getElementById('side-panel-wrapper').style.display = 'none';
    
    // Disable replay buttons on reset
    document.getElementById('btnPrevStep').disabled = true;
    document.getElementById('btnPlayPause').disabled = true;
    document.getElementById('btnNextStep').disabled = true;
    document.getElementById('step-message').innerText = ">_ SYSTEM READY";
    if(autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        document.getElementById('btnPlayPause').innerText = 'Auto-Play';
    }
    const slider = document.getElementById('stepSlider');
    slider.value = 0;
    slider.max = 0;
    slider.disabled = true;
});

document.getElementById('btnLock').addEventListener('click', () => {
    lockGrid();
    initPossibilities(); 
});

document.getElementById('btnSolve').addEventListener('click', visualSolve);
document.getElementById('btnFastSolve').addEventListener('click', fastSolve);
document.getElementById('cropOverlay').addEventListener('contextmenu', event => event.preventDefault());

// Timeline Slider Event
document.getElementById('stepSlider').addEventListener('input', (e) => {
    // If they drag the slider while Auto-Play is running, pause it automatically
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        document.getElementById('btnPlayPause').innerText = 'Auto-Play';
    }
    // Jump to the selected step
    applyHistoryStep(parseInt(e.target.value));
});

// ==========================================
// 9. SIDE PANEL TAB LOGIC
// ==========================================
document.getElementById('tabBtnReference').addEventListener('click', () => {
    document.getElementById('tabBtnReference').classList.add('active');
    document.getElementById('tabBtnReplay').classList.remove('active');
    document.getElementById('reference-panel').style.display = 'block';
    document.getElementById('terminal-panel').style.display = 'none';
});

document.getElementById('tabBtnReplay').addEventListener('click', () => {
    document.getElementById('tabBtnReplay').classList.add('active');
    document.getElementById('tabBtnReference').classList.remove('active');
    document.getElementById('terminal-panel').style.display = 'block';
    document.getElementById('reference-panel').style.display = 'none';
});

createGrid();