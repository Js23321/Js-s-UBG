// Card Creator
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('cards-container');
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.onclick = () => {
            var win = window.open('about:blank');
            fetch(game.url + '?cb=' + Date.now())
                .then(function(r){ return r.text(); })
                .then(function(html){
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
        card.setAttribute("data-title", game.title.toLowerCase());
        
        const title = document.createElement('h3');
        title.className = 'lesson-title';
        title.textContent = game.title;
        
        overlay.appendChild(title);
        card.appendChild(img);
        card.appendChild(overlay);
        container.appendChild(card);
    });
    // Search Bar
    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener("input", function () {
        const query = searchBar.value.toLowerCase().trim();
        document.querySelectorAll(".lesson-card").forEach(function (card) {
            const title = card.getAttribute("data-title") || "";
            card.style.display = title.startsWith(query) ? "" : "none";
        });
    });
});