// matrix.js — standalone matrix background
// Matches the exact effect from the reference site

const matrixState = {
    canvas: null,
    ctx: null,
    drops: [],
    columns: 0,
    fontSize: 14,
    rafId: null,
    lastColorKey: ''
};

// Get the current accent color from CSS variables
function getMatrixColor() {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim();
    // Fall back to blue if not set
    return raw || '#1585c2';
}

// Convert a hex color to r,g,b object
function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return { r: 21, g: 133, b: 194 };
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16)
    };
}

// Set up the drop positions for each column
function initDrops() {
    const cols = Math.max(1, Math.floor(window.innerWidth / matrixState.fontSize));
    matrixState.columns = cols;
    matrixState.drops = Array.from({ length: cols }, () =>
        Math.floor(Math.random() * window.innerHeight / matrixState.fontSize)
    );
}

// Resize the canvas to fill the window
function resizeCanvas() {
    const canvas = matrixState.canvas;
    const ctx = matrixState.ctx;
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// The main render loop — called every animation frame
function renderMatrix() {
    const canvas = matrixState.canvas;
    const ctx = matrixState.ctx;
    if (!canvas || !ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const fontSize = matrixState.fontSize;
    const hex = getMatrixColor();
    const colorKey = hex;

    // If the theme color changed, reset everything
    if (matrixState.lastColorKey !== colorKey) {
        matrixState.lastColorKey = colorKey;
        ctx.clearRect(0, 0, w, h);
        initDrops();
    }

    // Re-init columns if the window width changed
    const expectedCols = Math.max(1, Math.floor(w / fontSize));
    if (matrixState.columns !== expectedCols) {
        initDrops();
    }

    const { r, g, b } = hexToRgb(hex);

    // Draw a semi-transparent dark overlay to create the trail fade effect
    // Using a very dark version of the accent color (like the reference site)
    const trailR = Math.max(2, Math.round(r * 0.1));
    const trailG = Math.max(2, Math.round(g * 0.1));
    const trailB = Math.max(2, Math.round(b * 0.1));
    ctx.fillStyle = `rgba(${trailR}, ${trailG}, ${trailB}, 0.1)`;
    ctx.fillRect(0, 0, w, h);

    // Draw each falling character
    ctx.fillStyle = `rgb(${Math.min(255, r + 14)}, ${Math.min(255, g + 14)}, ${Math.min(255, b + 14)})`;
    ctx.font = fontSize + 'px monospace';

    const chars = ['0', '1'];

    for (let i = 0; i < matrixState.drops.length; i++) {
        // Pick a random 0 or 1
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = matrixState.drops[i] * fontSize;

        ctx.fillText(char, i * fontSize, y);

        // Reset drop to top randomly once it hits the bottom
        if (y > h && Math.random() > 0.972) {
            matrixState.drops[i] = 0;
        } else {
            matrixState.drops[i] += 0.90; 
        }
    }

    matrixState.rafId = requestAnimationFrame(renderMatrix);
}

// Start the matrix effect
function startMatrix() {
    // Create the canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '1';
    canvas.setAttribute('aria-hidden', 'true');

    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    matrixState.canvas = canvas;
    matrixState.ctx = ctx;

    resizeCanvas();
    initDrops();

    matrixState.rafId = requestAnimationFrame(renderMatrix);

    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        initDrops();
    });
}

// Update the matrix color when theme changes
// Call this whenever you change theme in app.js
function updateMatrixColor() {
    matrixState.lastColorKey = ''; // force a color reset on next frame
}

// Stop the matrix (cleanup)
function stopMatrix() {
    if (matrixState.rafId) {
        cancelAnimationFrame(matrixState.rafId);
        matrixState.rafId = null;
    }
    if (matrixState.canvas) {
        matrixState.canvas.remove();
        matrixState.canvas = null;
        matrixState.ctx = null;
    }
}

// Auto-start when the page loads
document.addEventListener('DOMContentLoaded', startMatrix);