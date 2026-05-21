document.addEventListener('DOMContentLoaded', function () {

    // ── SETTINGS STORE ──────────────────────────────────────────────
    // Default values for every setting
    const DEFAULTS = {
        theme:      'dusk',
        searchMode: 'starts',
        favicon:    '/images/cuh.png',
        tabTitle:   'Home - Classroom',
        font:       "'Courier New', monospace",
        openMode:   'blank'
    };

    // Load saved settings from localStorage, fall back to defaults
    function loadSettings() {
        const saved = {};
        for (const key in DEFAULTS) {
            saved[key] = localStorage.getItem('cfg_' + key) ?? DEFAULTS[key];
        }
        return saved;
    }

    // Save a single setting to localStorage and update cfg
    function saveSetting(key, value) {
        cfg[key] = value;
        localStorage.setItem('cfg_' + key, value);
    }

    const cfg = loadSettings();

    // ── APPLY FUNCTIONS ──────────────────────────────────────────────
    // Each function applies one setting to the page

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    function applyFavicon(url) {
        document.getElementById('favicon').href = url;
    }

    function applyTitle(title) {
        document.title = title;
    }

    function applyFont(font) {
        document.body.style.fontFamily = font;
    }

    function applySearchMode(mode) {
        const toggle      = document.getElementById('toggle-search');
        const optStarts   = document.getElementById('opt-starts');
        const optContains = document.getElementById('opt-contains');
        if (mode === 'contains') {
            toggle.classList.add('on');
            optContains.classList.add('active');
            optStarts.classList.remove('active');
        } else {
            toggle.classList.remove('on');
            optStarts.classList.add('active');
            optContains.classList.remove('active');
        }
    }

    function applyOpenMode(mode) {
        const toggle    = document.getElementById('toggle-openmode');
        const optBlank  = document.getElementById('opt-blank');
        const optInsite = document.getElementById('opt-insite');
        if (mode === 'insite') {
            toggle.classList.add('on');
            optInsite.classList.add('active');
            optBlank.classList.remove('active');
        } else {
            toggle.classList.remove('on');
            optBlank.classList.add('active');
            optInsite.classList.remove('active');
        }
    }

    // Apply all settings at once (used on page load and reset)
    function applyAll() {
        applyTheme(cfg.theme);
        applyFavicon(cfg.favicon);
        applyTitle(cfg.tabTitle);
        applyFont(cfg.font);
        applySearchMode(cfg.searchMode);
        applyOpenMode(cfg.openMode);
    }

    applyAll();

    // ── POPULATE SETTINGS UI ─────────────────────────────────────────
    // Fill in saved values so the settings page shows current state
    document.getElementById('set-favicon').value = cfg.favicon === DEFAULTS.favicon ? '' : cfg.favicon;
    document.getElementById('set-title').value   = cfg.tabTitle === DEFAULTS.tabTitle ? '' : cfg.tabTitle;
    document.getElementById('set-font').value    = cfg.font;

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            saveSetting('theme', btn.dataset.theme);
            applyTheme(btn.dataset.theme);
        });
    });

    // Search mode toggle
    document.getElementById('toggle-search').addEventListener('click', () => {
        const next = cfg.searchMode === 'starts' ? 'contains' : 'starts';
        saveSetting('searchMode', next);
        applySearchMode(next);
    });

    // Open mode toggle
    document.getElementById('toggle-openmode').addEventListener('click', () => {
        const next = cfg.openMode === 'blank' ? 'insite' : 'blank';
        saveSetting('openMode', next);
        applyOpenMode(next);
    });

    // Favicon apply / reset
    document.getElementById('apply-favicon').addEventListener('click', () => {
        const val = document.getElementById('set-favicon').value.trim();
        if (val) { saveSetting('favicon', val); applyFavicon(val); }
    });
    document.getElementById('reset-favicon').addEventListener('click', () => {
        saveSetting('favicon', DEFAULTS.favicon);
        applyFavicon(DEFAULTS.favicon);
        document.getElementById('set-favicon').value = '';
    });

    // Tab title apply / reset
    document.getElementById('apply-title').addEventListener('click', () => {
        const val = document.getElementById('set-title').value.trim();
        if (val) { saveSetting('tabTitle', val); applyTitle(val); }
    });
    document.getElementById('reset-title').addEventListener('click', () => {
        saveSetting('tabTitle', DEFAULTS.tabTitle);
        applyTitle(DEFAULTS.tabTitle);
        document.getElementById('set-title').value = '';
    });

    // Font select
    document.getElementById('set-font').addEventListener('change', e => {
        saveSetting('font', e.target.value);
        applyFont(e.target.value);
    });

    // Reset all settings
    document.getElementById('reset-all').addEventListener('click', () => {
        for (const key in DEFAULTS) localStorage.removeItem('cfg_' + key);
        Object.assign(cfg, DEFAULTS);
        document.getElementById('set-favicon').value = '';
        document.getElementById('set-title').value   = '';
        document.getElementById('set-font').value    = DEFAULTS.font;
        applyAll();
    });

    // ── GAME OVERLAY ─────────────────────────────────────────────────
    const overlay   = document.getElementById('game-overlay');
    const gameFrame = document.getElementById('game-frame');
    const closeBtn  = document.getElementById('close-overlay');

    // Close button hides the overlay and stops the game
    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        gameFrame.src = '';
    });

    // Open a game either in about:blank or in the in-site overlay
    function openGame(game) {
        if (cfg.openMode === 'insite') {
            gameFrame.src = game.url;
            overlay.style.display = 'block';
        } else {
            const win = window.open('about:blank');
            fetch(game.url + '?cb=' + Date.now())
                .then(r => r.text())
                .then(html => {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                });
        }
    }

    // ── BUILD GAME CARDS ─────────────────────────────────────────────
    const container = document.getElementById('cards-container');

    function renderCards() {
        container.innerHTML = '';
        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'lesson-card';
            card.setAttribute('data-title', game.title.toLowerCase());
            card.onclick = () => openGame(game);

            const img = document.createElement('img');
            img.src = game.image;
            img.alt = game.title;

            const overlay = document.createElement('div');
            overlay.className = 'card-overlay';

            const title = document.createElement('h3');
            title.className = 'lesson-title';
            title.textContent = game.title;

            overlay.appendChild(title);
            card.appendChild(img);
            card.appendChild(overlay);
            container.appendChild(card);
        });

        document.querySelector('.games-loaded').textContent =
            `(${games.length}/${games.length} games loaded)`;
    }

    renderCards();

    // ── SEARCH ───────────────────────────────────────────────────────
    document.getElementById('searchBar').addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        document.querySelectorAll('.lesson-card').forEach(card => {
            const t = card.getAttribute('data-title') || '';
            const match = cfg.searchMode === 'contains'
                ? t.includes(query)
                : t.startsWith(query);
            card.style.display = match ? '' : 'none';
        });
    });

    // ── SPA NAVIGATION ───────────────────────────────────────────────
    const pageButtons  = document.querySelectorAll('.nav-button[data-page]');
    const pageSections = document.querySelectorAll('.page-section');

    function showPage(page) {
        const selected = page || 'home';
        pageSections.forEach(s => {
            s.classList.toggle('active', s.id === `${selected}-section`);
        });
        pageButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.page === selected);
        });
        if (history.replaceState) history.replaceState(null, '', `#${selected}`);
        else window.location.hash = selected;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    pageButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            showPage(btn.dataset.page);
        });
    });

    window.addEventListener('hashchange', () => {
        showPage(window.location.hash.replace('#', '') || 'home');
    });

    // Load the correct page based on the URL hash
    showPage(window.location.hash.replace('#', '') || 'home');
});