// 1. INJECT THE CSS STYLES DIRECTLY FROM JAVASCRIPT
const matrixStyles = document.createElement('style');
matrixStyles.innerHTML = `
    #matrix-bg {
        position: fixed;
        top: 0; 
        left: 0; 
        width: 100vw; 
        height: 100vh;
        z-index: -1; 
        pointer-events: none; /* Lets you click through the canvas */
    }
`;
document.head.appendChild(matrixStyles); // Adds the CSS to the webpage

// 2. RUN THE MATRIX ANIMATION LOGIC
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
for (let x = 0; x < columns; x++) drops[x] = 1;

function drawMatrix() {
    ctxMatrix.fillStyle = 'rgba(15, 23, 42, 0.1)'; 
    ctxMatrix.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctxMatrix.fillStyle = '#14b8a6'; 
    ctxMatrix.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctxMatrix.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 35);

window.addEventListener('resize', () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
});