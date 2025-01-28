document.addEventListener('DOMContentLoaded', function() {
    const createButton = document.querySelector('.boton-crear');
    const nameInput = document.querySelector('.N_personaje');
    const photoInput = document.querySelector('.F_personaje');
    const descriptionInput = document.querySelector('.D_personaje');
    const personalityInput = document.querySelector('.P_personaje');

    createButton.addEventListener('click', function() {
        const formData = new FormData();
        formData.append('name', nameInput.value);
        formData.append('photo', photoInput.files[0]);
        formData.append('description', descriptionInput.value);
        formData.append('personality', personalityInput.value);

        fetch('/save-character', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showPopup('¡Bot creado con éxito!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        })
        .catch(error => {
            showPopup('Error al crear el bot');
            console.error('Error:', error);
        });
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
