document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.querySelector('.boton-search');
    const searchInput = document.querySelector('.container-search input');
    const botsContainer = document.getElementById('bots-container');

    const GITHUB_TOKEN = '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';
    const REPO_OWNER = 'Kyotodex';
    const REPO_NAME = 'Kyotodex.github.io';

    async function loadBots() {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/bots`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load bots');
        }

        const files = await response.json();
        const botsContainer = document.getElementById('bots-container');
        
        for (const file of files) {
            if (file.name.endsWith('.json')) {
                const botResponse = await fetch(file.download_url);
                const botData = await botResponse.json();
                
                const botElement = document.createElement('div');
                botElement.className = 'bot-card';
                botElement.innerHTML = `
                    <img src="${botData.photo}" alt="${botData.name}">
                    <h3>${botData.name}</h3>
                    <p>${botData.description}</p>
                `;
                
                botsContainer.appendChild(botElement);
            }
        }
    }

    loadBots().catch(error => {
        console.error('Error loading bots:', error);
        alert('Error loading bots');
    });

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
