// matrix.js — extracted from the reference site's main.js

const canvas = document.createElement('canvas');
canvas.id = 'matrix-bg';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.setAttribute('aria-hidden', 'true');
document.body.insertBefore(canvas, document.body.firstChild);

const ctx = canvas.getContext('2d');

const matrixState = {
    drops: [],
    columns: 0,
    fontSize: 14,
    resetFrames: 0,
    lastColorKey: ''
};

let rafId = null;

function hexToRgbObject(hex) {
    const cleanHex = (hex || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) return { r: 21, g: 133, b: 194 };
    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16)
    };
}

function getMatrixColor() {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim();
    return raw || '#1585c2';
}

function resizeCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initMatrixDrops(forceReset = false) {
    const fontSize = matrixState.fontSize;
    matrixState.columns = Math.max(1, Math.floor(window.innerWidth / fontSize));
    matrixState.drops = Array.from({ length: matrixState.columns }, () =>
        Math.floor((Math.random() * window.innerHeight) / fontSize)
    );
    if (forceReset) {
        matrixState.resetFrames = 14;
    }
}

function renderMatrix() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const hex = getMatrixColor();
    const { r, g, b } = hexToRgbObject(hex);
    const colorKey = `${r},${g},${b}`;

    if (!matrixState.drops.length || matrixState.columns !== Math.max(1, Math.floor(width / matrixState.fontSize))) {
        initMatrixDrops();
    }

    if (matrixState.lastColorKey !== colorKey) {
        matrixState.lastColorKey = colorKey;
        matrixState.resetFrames = Math.max(matrixState.resetFrames, 22);
        initMatrixDrops();
        ctx.clearRect(0, 0, width, height);
    }

    const trailR = Math.max(2, Math.round(r * 0.1));
    const trailG = Math.max(2, Math.round(g * 0.1));
    const trailB = Math.max(2, Math.round(b * 0.1));
    const clearingAlpha = matrixState.resetFrames > 0 ? 0.46 : 0.1;

    ctx.fillStyle = `rgba(${trailR}, ${trailG}, ${trailB}, ${clearingAlpha})`;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = `rgb(${Math.min(255, r + 14)}, ${Math.min(255, g + 14)}, ${Math.min(255, b + 14)})`;
    ctx.font = `${matrixState.fontSize}px monospace`;

    const chars = ['0', '1'];
    const advance = 1.06;

    for (let i = 0; i < matrixState.drops.length; i++) {
        const text = chars[(Math.random() * chars.length) | 0];
        const y = matrixState.drops[i] * matrixState.fontSize;
        ctx.fillText(text, i * matrixState.fontSize, y);
        if (y > height && Math.random() > 0.972) {
            matrixState.drops[i] = 0;
        } else {
            matrixState.drops[i] += advance;
        }
    }

    if (matrixState.resetFrames > 0) {
        matrixState.resetFrames -= 1;
    }

    rafId = requestAnimationFrame(renderMatrix);
}

function updateMatrixColor() {
    matrixState.lastColorKey = '';
}

function stopMatrix() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initMatrixDrops(true);
});

document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    initMatrixDrops(true);
    rafId = requestAnimationFrame(renderMatrix);
});