document.addEventListener('DOMContentLoaded', function() {
    const createButton = document.querySelector('.boton-crear');
    const nameInput = document.querySelector('.N_personaje');
    const photoInput = document.querySelector('.F_personaje');
    const descriptionInput = document.querySelector('.D_personaje');
    const personalityInput = document.querySelector('.P_personaje');

    const GITHUB_TOKEN = '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';
    const REPO_OWNER = 'Kyotodex';
    const REPO_NAME = 'Kyotodex.github.io';

    async function saveBot(botData) {
        const filename = `bots/${botData.name}.json`;
        
        // Subir imagen si existe
        if (botData.photo) {
            const imgData = await botData.photo.arrayBuffer();
            const imgFilename = `bot-img/${Date.now()}-${botData.photo.name}`;
            await uploadToGitHub(imgFilename, imgData);
            botData.photo = '/' + imgFilename;
        }

        // Subir datos del bot
        const content = JSON.stringify(botData, null, 2);
        await uploadToGitHub(filename, content);
    }

    async function uploadToGitHub(path, content) {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add/Update ${path}`,
                content: btoa(content),
                branch: 'main'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload to GitHub');
        }
    }

    createButton.addEventListener('click', async () => {
        const botData = {
            name: nameInput.value,
            photo: photoInput.files[0],
            description: descriptionInput.value,
            personality: personalityInput.value
        };
        
        try {
            await saveBot(botData);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving bot:', error);
            alert('Error saving bot');
        }
    });

    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.textContent = message;
        
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
        
        popup.classList.add('active');
        overlay.classList.add('active');
        
        setTimeout(() => {
            popup.remove();
            overlay.remove();
        }, 2000);
    }
});
