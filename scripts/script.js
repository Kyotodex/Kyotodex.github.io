document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.querySelector('.boton-search');
    const searchInput = document.querySelector('.container-search input');
    const botsContainer = document.getElementById('bots-container');

    // Cargar bots
    fetch('/get-bots')
        .then(response => response.json())
        .then(bots => {
            displayBots(bots);
        })
        .catch(error => console.error('Error:', error));

    // Búsqueda
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase();
        searchBots(query);
    });

    function displayBots(bots) {
        botsContainer.innerHTML = '';
        bots.forEach(bot => {
            const botCard = document.createElement('div');
            botCard.className = 'bot-card';
            botCard.innerHTML = `
                <img src="${bot.photo}" alt="${bot.name}" style="width:100%; height:200px; object-fit:cover;">
                <h3>${bot.name}</h3>
                <p>${bot.description}</p>
            `;
            botCard.addEventListener('click', () => {
                window.location.href = `bot_info.html?bot=${bot.name}`;
            });
            botsContainer.appendChild(botCard);
        });
    }

    function searchBots(query) {
        const botCards = document.querySelectorAll('.bot-card');
        botCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            if (name.includes(query) || description.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
});
