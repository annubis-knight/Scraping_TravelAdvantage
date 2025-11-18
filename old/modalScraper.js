// src/assets/js/modalScraper.js

function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button id="screenshot-btn" class="screenshot-btn">Screenshot</button>
                <span class="close">&times;</span>
            </div>
            <div id="search-results"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        const iframe = modal.querySelector('iframe');
        if (iframe) {
            iframe.src = 'about:blank';
        }
    };

    const screenshotBtn = modal.querySelector('#screenshot-btn');
    screenshotBtn.onclick = takeScreenshot;

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            const iframe = modal.querySelector('iframe');
            if (iframe) {
                iframe.src = 'about:blank';
            }
        }
    };

    return modal;
}

function showSearchResults(hotelName, city) {
    const modal = createModal();
    modal.style.display = 'block';

    const resultsContainer = modal.querySelector('#search-results');
    const searchQuery = encodeURIComponent(`${hotelName} ${city}`);
    const googleSearchUrl = `https://www.google.com/search?igu=1&q=${searchQuery}`;

    resultsContainer.innerHTML = `
        <iframe src="${googleSearchUrl}" style="width:100%; height:90vh; border:none;"></iframe>
    `;
}

function takeScreenshot() {
    const modal = document.querySelector('.modal-content');
    if (!modal) {
        console.error('Modal not found');
        return;
    }

    html2canvas(modal).then(canvas => {
        const image = canvas.toDataURL('image/png');
        
        // Envoyez l'image au serveur pour la sauvegarder
        fetch('/save-screenshot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: image }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Capture d\'écran sauvegardée avec succès !');
            } else {
                alert('Échec de la sauvegarde de la capture d\'écran.');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Une erreur s\'est produite lors de la sauvegarde de la capture d\'écran.');
        });
    });
}

// Exporter la fonction pour l'utiliser dans templateBrevo.js
window.showSearchResults = showSearchResults;