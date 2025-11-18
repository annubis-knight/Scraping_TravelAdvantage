let citiesData = {};
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'hotel-item';
        
        let content = `
            <h2>${item.ville} (${item.dateAnnee})</h2>
            <p>Type de réservation : ${item.typeDeReservation}</p>
            <p>Pourcentage : ${item.pourcentage}%</p>
        `;

        if (item.excelData && item.excelData.length > 0) {
            content += '<h3>Hôtels correspondants :</h3>';
            content += '<div class="table-container"><table class="hotel-data"><thead><tr>';
            const headers = [
                'Hôtel', 'Étoiles', 'Réduction', 'Prix affiché', 
                'Date début', 'Date fin', 'Vu le', 'Actions'
            ];
            headers.forEach(header => {
                content += `<th>${header}</th>`;
            });
            content += '</tr></thead><tbody>';
            
            item.excelData.forEach((row, index) => {
                const hotelData = row.data;
                content += `
                    <tr class="hotel-row" data-hotel-index="${index}" data-city="${item.ville}">
                        <td><strong>${hotelData[0]}</strong></td>
                        <td>${'⭐'.repeat(hotelData[2])}</td>
                        <td class="reduction">${hotelData[4]}</td>
                        <td class="price">${hotelData[5]}</td>
                        <td>${hotelData[9]}</td>
                        <td>${hotelData[10]}</td>
                        <td>${hotelData[12]}</td>
                        <td>
                            <span class="delete-hotel">❌</span>
                            <span class="open-new-tab" title="Ouvrir dans un nouvel onglet">🔗</span>
                        </td>
                    </tr>
                `;
            });
            content += '</tbody></table></div>';
        } else {
            content += '<p>Aucun hôtel correspondant trouvé.</p>';
        }

        itemDiv.innerHTML = content;
        resultsDiv.appendChild(itemDiv);
    });

    addEventListeners();
    addExportButtonListener();
}

function addEventListeners() {
    const hotelRows = document.querySelectorAll('.hotel-row');
    hotelRows.forEach(row => {
        const deleteButton = row.querySelector('.delete-hotel');
        deleteButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Êtes-vous sûr de vouloir supprimer cet hôtel ?')) {
                row.remove();
            }
        });

        const openNewTabButton = row.querySelector('.open-new-tab');
        openNewTabButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const hotelName = row.querySelector('td:first-child').textContent;
            const city = row.dataset.city;
            const searchQuery = encodeURIComponent(`${hotelName} ${city}`);
            window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
        });
    });
}

function generateExportData() {
    const exportData = {
        exportDate: new Date().toISOString(),
        hotels: []
    };

    document.querySelectorAll('.hotel-item').forEach(hotelItem => {
        const cityInfo = hotelItem.querySelector('h2').textContent.match(/(.+) \((.+)\)/);
        const ville = cityInfo[1];
        const dateAnnee = cityInfo[2];
        const typeDeReservation = hotelItem.querySelector('p:nth-of-type(1)').textContent.split(': ')[1];
        const pourcentageReduction = parseInt(hotelItem.querySelector('p:nth-of-type(2)').textContent.split(': ')[1]);

        // Récupérer les données JSON de la ville
        const cityJsonData = citiesData[ville] || {};

        hotelItem.querySelectorAll('.hotel-row').forEach(row => {
            const hotel = {
                nom: row.querySelector('td:nth-child(1)').textContent,
                ville: ville,
                dateAnnee: dateAnnee,
                typeDeReservation: typeDeReservation,
                pourcentageReduction: pourcentageReduction,
                etoiles: row.querySelector('td:nth-child(2)').textContent.length,
                reduction: row.querySelector('td:nth-child(3)').textContent,
                prixAffiche: row.querySelector('td:nth-child(4)').textContent,
                dateDebut: row.querySelector('td:nth-child(5)').textContent,
                dateFin: row.querySelector('td:nth-child(6)').textContent,
                vuLe: row.querySelector('td:nth-child(7)').textContent,
                // Ajouter les données JSON de la ville
                country: cityJsonData.country,
                latitude: cityJsonData.latitude,
                longitude: cityJsonData.longitude,
                googlePlacesCountry: cityJsonData.googlePlacesCountry,
                titreCard:"Lorem ipsum",
                urlImage: "https://via.placeholder.com/300",
                infoPrice:"Jusqu'à ",
                infoButton:"Découvrir"
            };
            exportData.hotels.push(hotel);
        });
    });

    return exportData;
}

function exportToJSON() {
    const data = generateExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json;charset=utf-8"});
    saveAs(blob, "hotels_export.json");
}

function addExportButtonListener() {
    const exportButton = document.getElementById('export-button');
    if (exportButton) {
        exportButton.addEventListener('click', exportToJSON);
    }
}

// Fonction pour charger les données initiales
function loadInitialData() {
    
    Promise.all([
        fetch('/getHotelsData'),
        fetch('/getCitiesData')
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([hotelsData, citiesJsonData]) => {
        citiesData = citiesJsonData; // Initialise la variable globale
        displayResults(hotelsData);
    })
    .catch(error => {
        console.error('Erreur lors du chargement des données:', error);
        document.getElementById('error').textContent = 'Erreur lors du chargement des données.';
    })
    .finally(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

// Appel de la fonction de chargement des données au chargement de la page
document.addEventListener('DOMContentLoaded', loadInitialData);