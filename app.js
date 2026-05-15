// app.js: builds game cards, enables search, and handles single-page navigation

document.addEventListener('DOMContentLoaded', function() {
    // Build all game cards from games.js into the home section
    const container = document.getElementById('cards-container');
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.onclick = () => {
            const win = window.open('about:blank');
            fetch(game.url + '?cb=' + Date.now())
                .then(r => r.text())
                .then(html => {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                });
        };

        const img = document.createElement('img');
        img.src = game.image;
        img.alt = game.title;

        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        card.setAttribute('data-title', game.title.toLowerCase());

        const title = document.createElement('h3');
        title.className = 'lesson-title';
        title.textContent = game.title;

        overlay.appendChild(title);
        card.appendChild(img);
        card.appendChild(overlay);
        container.appendChild(card);
    });

    // Show how many games are loaded
    document.querySelector('.games-loaded').textContent = `(${games.length}/${games.length} games loaded)`;

    // Search behavior for the Home game cards
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('input', function () {
        const query = searchBar.value.toLowerCase().trim();
        document.querySelectorAll('.lesson-card').forEach(function (card) {
            const title = card.getAttribute('data-title') || '';
            card.style.display = title.startsWith(query) ? '' : 'none';
        });
    });

    // SPA navigation: buttons and sections
    const pageButtons = document.querySelectorAll('.nav-button[data-page]');
    const pageSections = document.querySelectorAll('.page-section');

    function showPage(page) {
        const selected = page || 'home';

        // Show only the active page section
        pageSections.forEach(section => {
            section.classList.toggle('active', section.id === `${selected}-section`);
        });

        // Highlight the active nav button
        pageButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.page === selected);
        });

        // Update the URL hash without reloading the page
        if (history.replaceState) {
            history.replaceState(null, '', `#${selected}`);
        } else {
            window.location.hash = selected;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    pageButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            showPage(button.dataset.page);
        });
    });

    // Keep page state in sync with the browser hash
    window.addEventListener('hashchange', function() {
        const current = window.location.hash.replace('#', '') || 'home';
        showPage(current);
    });

    // Initialize page based on the current hash
    const initialPage = window.location.hash.replace('#', '') || 'home';
    showPage(initialPage);
});