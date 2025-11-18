// Initialiser la carte
const map = L.map('map').setView([20, 0], 2); // Vue initiale centrée sur le monde

// Ajouter le fond de carte
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let currentMarkers = L.markerClusterGroup();
const monthsData = {};
let currentMonth;
let selectedCities = {};

let filters = {
    weekend: true,
    week: true,
    twoweeks: true
};

// Fonction pour déterminer la couleur en fonction du pourcentage
function getColor(percentage) {
    if (percentage >= 40) return '#ff0000'; // Rouge pour >= 40%
    if (percentage >= 30) return '#ff7f00'; // Orange pour >= 30%
    if (percentage >= 20) return '#ffff00'; // Jaune pour >= 20%
    return '#00ff00'; // Vert pour < 20%
}

// Organiser les données par mois
Object.keys(mapData).forEach(month => {
    monthsData[month] = mapData[month];
});

function createMarkers(data) {
    const markers = L.markerClusterGroup();
    data.forEach(ville => {
        const filteredPercentages = ville.pourcentages.filter((_, index) => 
            (index === 0 && filters.weekend) || 
            (index === 1 && filters.week) || 
            (index === 2 && filters.twoweeks)
        );
        const maxPercentage = Math.max(...filteredPercentages);
        const marker = L.circleMarker([ville.lat, ville.lon], {
            radius: 8,
            fillColor: getColor(maxPercentage),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        marker.bindPopup(() => {
            const popupContent = document.createElement('div');
            popupContent.innerHTML = `<b>${ville.ville} (${ville.country})</b><br>`;
            ['Weekend', 'Semaine', '2 Semaines'].forEach((type, index) => {
                if ((index === 0 && filters.weekend) || 
                    (index === 1 && filters.week) || 
                    (index === 2 && filters.twoweeks)) {
                    const label = document.createElement('label');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'percentage-checkbox';
                    checkbox.setAttribute('data-ville', ville.ville);
                    checkbox.setAttribute('data-country', ville.country);
                    checkbox.setAttribute('data-index', index);
                    checkbox.checked = selectedCities[currentMonth] && 
                                       selectedCities[currentMonth][ville.ville] && 
                                       selectedCities[currentMonth][ville.ville].types.includes(type);
                    checkbox.addEventListener('change', handleCheckboxClick);
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(` ${type}: ${ville.pourcentages[index]}%`));
                    popupContent.appendChild(label);
                    popupContent.appendChild(document.createElement('br'));
                }
            });
            return popupContent;
        });
        
        markers.addLayer(marker);
    });
    return markers;
}

function updateMap(month, adjustView = false) {
    currentMonth = month;
    if (currentMarkers) {
        map.removeLayer(currentMarkers);
    }
    currentMarkers = createMarkers(monthsData[month]);
    map.addLayer(currentMarkers);

    if (adjustView) {
        const group = L.featureGroup(currentMarkers.getLayers());
        map.fitBounds(group.getBounds().pad(0.1));
    }

    document.querySelectorAll('#month-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#month-buttons button[data-month="${month}"]`).classList.add('active');

    updateSelectedCitiesList();
}

function updateFilters() {
    filters.weekend = document.getElementById('weekend-checkbox').checked;
    filters.week = document.getElementById('week-checkbox').checked;
    filters.twoweeks = document.getElementById('twoweeks-checkbox').checked;
    updateMap(currentMonth, false);
}

function handleCheckboxClick(e) {
    const checkbox = e.target;
    const ville = checkbox.getAttribute('data-ville');
    const country = checkbox.getAttribute('data-country');
    const index = parseInt(checkbox.getAttribute('data-index'));
    const type = ['Weekend', 'Semaine', '2 Semaines'][index];
    
    if (!selectedCities[currentMonth]) {
        selectedCities[currentMonth] = {};
    }
    
    if (checkbox.checked) {
        if (!selectedCities[currentMonth][ville]) {
            selectedCities[currentMonth][ville] = { country: country, types: [] };
        }
        if (!selectedCities[currentMonth][ville].types.includes(type)) {
            selectedCities[currentMonth][ville].types.push(type);
        }
    } else {
        if (selectedCities[currentMonth][ville]) {
            selectedCities[currentMonth][ville].types = selectedCities[currentMonth][ville].types.filter(t => t !== type);
            if (selectedCities[currentMonth][ville].types.length === 0) {
                delete selectedCities[currentMonth][ville];
            }
        }
    }
    
    updateSelectedCitiesList();
}

function updateSelectedCitiesList() {
    const listContainer = document.getElementById('selected-cities-list');
    listContainer.innerHTML = '';
    
    if (selectedCities[currentMonth]) {
        Object.entries(selectedCities[currentMonth]).forEach(([ville, data]) => {
            const villeData = monthsData[currentMonth].find(v => v.ville === ville);
            data.types.forEach(type => {
                const li = document.createElement('li');
                const index = ['Weekend', 'Semaine', '2 Semaines'].indexOf(type);
                li.textContent = `${ville} (${data.country}): ${type} (${villeData.pourcentages[index]}%)`;
                
                const removeButton = document.createElement('span');
                removeButton.textContent = '×';
                removeButton.className = 'remove-city';
                removeButton.onclick = (e) => {
                    e.stopPropagation();
                    removeSelectedCity(ville, type);
                };
                
                li.appendChild(removeButton);
                listContainer.appendChild(li);
            });
        });
    }
    
    if (listContainer.children.length === 0) {
        const li = document.createElement('li');
        li.textContent = "Aucune ville sélectionnée pour ce mois";
        listContainer.appendChild(li);
    }

    // Mettre à jour la visibilité du bouton
    const createTemplateButton = document.getElementById('create-template-button');
    if (createTemplateButton) {
        createTemplateButton.style.display = listContainer.children.length > 0 ? 'block' : 'none';
    }
}

function removeSelectedCity(ville, type) {
    if (selectedCities[currentMonth] && selectedCities[currentMonth][ville]) {
        selectedCities[currentMonth][ville].types = selectedCities[currentMonth][ville].types.filter(t => t !== type);
        if (selectedCities[currentMonth][ville].types.length === 0) {
            delete selectedCities[currentMonth][ville];
        }
        if (Object.keys(selectedCities[currentMonth]).length === 0) {
            delete selectedCities[currentMonth];
        }
    }
    
    const marker = findMarkerByVille(ville);
    if (marker) {
        const popup = marker.getPopup();
        const content = popup.getContent();
        const index = ['Weekend', 'Semaine', '2 Semaines'].indexOf(type);
        
        if (typeof content === 'string') {
            const newContent = content.replace(
                new RegExp(`<input[^>]*data-ville="${ville}"[^>]*data-index="${index}"[^>]*checked[^>]*>`),
                match => match.replace('checked', '')
            );
            popup.setContent(newContent);
        } else if (content instanceof Element) {
            const checkbox = content.querySelector(`input[data-ville="${ville}"][data-index="${index}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    }
    
    updateSelectedCitiesList();
}

function findMarkerByVille(ville) {
    let foundMarker = null;
    currentMarkers.eachLayer((layer) => {
        const popupContent = layer.getPopup().getContent();
        if (typeof popupContent === 'string') {
            if (popupContent.includes(`<b>${ville}`)) {
                foundMarker = layer;
            }
        } else if (popupContent instanceof Element) {
            const villeElement = popupContent.querySelector('b');
            if (villeElement && villeElement.textContent.startsWith(ville)) {
                foundMarker = layer;
            }
        }
    });
    return foundMarker;
}

// Créer les boutons pour chaque mois
const buttonContainer = document.getElementById('month-buttons');
Object.keys(monthsData).forEach(month => {
    const button = document.createElement('button');
    button.textContent = month;
    button.setAttribute('data-month', month);
    button.onclick = () => updateMap(month, false);
    buttonContainer.appendChild(button);
});

// Ajouter un bouton pour réinitialiser la vue
const resetViewButton = document.createElement('button');
resetViewButton.textContent = 'Réinitialiser la vue';
resetViewButton.onclick = () => {
    const group = L.featureGroup(currentMarkers.getLayers());
    map.fitBounds(group.getBounds().pad(0.1));
};
buttonContainer.appendChild(resetViewButton);

// Ajouter des écouteurs d'événements pour les cases à cocher
document.getElementById('weekend-checkbox').addEventListener('change', updateFilters);
document.getElementById('week-checkbox').addEventListener('change', updateFilters);
document.getElementById('twoweeks-checkbox').addEventListener('change', updateFilters);

// Ajouter une légende
const legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 20, 30, 40];
    const labels = [];

    div.innerHTML += '<h4>Réduction max</h4>';

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '%<br>' : '+%');
    }

    return div;
};

legend.addTo(map);

// Fonction pour créer le bouton "Créer Template"
function createTemplateButton() {
    const container = document.getElementById('create-template-container');
    container.innerHTML = ''; // Nettoyer le contenu existant
    
    const button = document.createElement('button');
    button.textContent = 'Créer Template';
    button.id = 'create-template-button';
    button.addEventListener('click', handleCreateTemplate);
    
    container.appendChild(button);
}

// Fonction pour gérer le clic sur le bouton "Créer Template"
function handleCreateTemplate() {
    const templateData = [];

    Object.entries(selectedCities).forEach(([month, cities]) => {
        Object.entries(cities).forEach(([ville, data]) => {
            const villeData = monthsData[month].find(v => v.ville === ville);
            data.types.forEach(type => {
                const typeDeReservation = type === 'Weekend' ? 1 : (type === 'Semaine' ? 2 : 3);
                const index = ['Weekend', 'Semaine', '2 Semaines'].indexOf(type);
                templateData.push({
                    nomVille: ville,
                    typeDeReservation: typeDeReservation,
                    pourcentage: villeData.pourcentages[index],
                    dateAnnee: month
                });
            });
        });
    });

    // Stocker les données dans localStorage
    localStorage.setItem('selectedCitiesData', JSON.stringify(templateData));

    // Ouvrir templateBrevo.html dans un nouvel onglet
    window.open('templateBrevo.html', '_blank');
}

// Afficher le premier mois par défaut
const firstMonth = Object.keys(monthsData)[0];
updateMap(firstMonth, true);  // Ajuster la vue seulement pour l'affichage initial

// Créer le bouton "Créer Template"
createTemplateButton();