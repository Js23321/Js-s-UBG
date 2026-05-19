const canvas = document.getElementById('matrix-bg');
const ctx = canvas ? canvas.getContext('2d') : null;

const matrixState = {
    drops: [], columns: 0, fontSize: 14, resetFrames: 0, lastColorKey: ''
};

function hexToRgbObject(hex) {
    const c = (hex || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(c)) return { r: 21, g: 133, b: 194 };
    return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}

function getMatrixColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1585c2';
}

function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initMatrixDrops(forceReset = false) {
    matrixState.columns = Math.max(1, Math.floor(window.innerWidth / matrixState.fontSize));
    matrixState.drops = Array.from({ length: matrixState.columns }, () =>
        Math.floor(Math.random() * window.innerHeight / matrixState.fontSize)
    );
    if (forceReset) matrixState.resetFrames = 14;
}

function renderMatrix() {
    if (!canvas || !ctx) return;
    const w = window.innerWidth, h = window.innerHeight;
    const { r, g, b } = hexToRgbObject(getMatrixColor());
    const colorKey = `${r},${g},${b}`;

    if (!matrixState.drops.length || matrixState.columns !== Math.max(1, Math.floor(w / matrixState.fontSize))) {
        initMatrixDrops();
    }
    if (matrixState.lastColorKey !== colorKey) {
        matrixState.lastColorKey = colorKey;
        matrixState.resetFrames = Math.max(matrixState.resetFrames, 22);
        initMatrixDrops();
        ctx.clearRect(0, 0, w, h);
    }

    const trailR = Math.max(2, Math.round(r * 0.1));
    const trailG = Math.max(2, Math.round(g * 0.1));
    const trailB = Math.max(2, Math.round(b * 0.1));
    ctx.fillStyle = `rgba(${trailR}, ${trailG}, ${trailB}, ${matrixState.resetFrames > 0 ? 0.46 : 0.1})`;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = `rgb(${Math.min(255,r+14)}, ${Math.min(255,g+14)}, ${Math.min(255,b+14)})`;
    ctx.font = `${matrixState.fontSize}px monospace`;

    for (let i = 0; i < matrixState.drops.length; i++) {
        const text = Math.random() < 0.5 ? '0' : '1';
        const y = matrixState.drops[i] * matrixState.fontSize;
        ctx.fillText(text, i * matrixState.fontSize, y);
        if (y > h && Math.random() > 0.972) matrixState.drops[i] = 0;
        else matrixState.drops[i] += 1.06;
    }
    if (matrixState.resetFrames > 0) matrixState.resetFrames -= 1;

    requestAnimationFrame(renderMatrix);
}

function updateMatrixColor() { matrixState.lastColorKey = ''; }

window.addEventListener('resize', () => { resizeCanvas(); initMatrixDrops(true); });

document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    initMatrixDrops(true);
    requestAnimationFrame(renderMatrix);
});