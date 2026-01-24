const fs = require('fs');
const path = require('path');

function collectStatistiques(newHotels) {
    const statistics = {1: {}, 2: {}, 3: {}};

    for (const type of [1, 2, 3]) {
        const hotels = Object.values(newHotels).filter(hotel => hotel.typeDeReservation == type);
        
        if (hotels.length === 0) {
            continue;
        }

        const reductions = hotels.map(hotel => parseFloat(hotel.reduction.replace('%', '')));
        const prices = hotels.map(hotel => parseFloat(hotel.prixTravel.replace(/[€ ]/g, '')));
        const stars = hotels.map(hotel => parseFloat(hotel.etoiles));

        const sortedReductions = [...reductions].sort((a, b) => b - a);
        const sortedPrices = [...prices].sort((a, b) => b - a);

        const top5Count = Math.min(5, hotels.length);

        statistics[type] = {
            plage_reductions_page: `[${Math.min(...reductions)}% - ${Math.max(...reductions)}%]`,
            plage_prix_page: `[${Math.min(...prices)}€ - ${Math.max(...prices)}€]`,
            plage_reductions_top5: `[${Math.min(...sortedReductions.slice(0, top5Count))}% - ${Math.max(...sortedReductions.slice(0, top5Count))}%]`,
            plage_prix_top5: `[${Math.min(...sortedPrices.slice(0, top5Count))}€ - ${Math.max(...sortedPrices.slice(0, top5Count))}€]`,
            moyenne_reductions: `${mean(reductions).toFixed(2)}%`,
            moyenne_reductions_top5: `${mean(sortedReductions.slice(0, top5Count)).toFixed(2)}%`,
            moyenne_prix: `${mean(prices).toFixed(2)}€`,
            moyenne_prix_top5: `${mean(sortedPrices.slice(0, top5Count)).toFixed(2)}€`,
            moyenne_etoiles: mean(stars).toFixed(2),
            nombre_echantillons_page: hotels.length,
            nombre_echantillons_top5: top5Count
        };
    }

    return statistics;
}

function afficherStatistiquesConsole(statistiques) {
    console.log('\n=== STATISTIQUES ===\n');

    const labels = {
        plage_reductions_page: 'Plage des réductions (page)',
        plage_prix_page: 'Plage des prix (page)',
        plage_reductions_top5: 'Plage des réductions (top5)',
        plage_prix_top5: 'Plage des prix (top5)',
        moyenne_reductions: 'Moyenne(Réductions) 1ère page',
        moyenne_reductions_top5: 'Moyenne(Réductions) top5',
        moyenne_prix: 'Moyenne(Prix) 1ère page',
        moyenne_prix_top5: 'Moyenne(Prix) top5',
        moyenne_etoiles: 'Moyenne(étoiles)',
        nombre_echantillons_page: "Nombre d'échantillons page",
        nombre_echantillons_top5: "Nombre d'échantillons top5"
    };

    const maxLabelLength = Math.max(...Object.values(labels).map(l => l.length));

    console.log(`${'Statistique'.padEnd(maxLabelLength)} | Type 1 | Type 2 | Type 3`);
    console.log('-'.repeat(maxLabelLength + 28));

    for (const [key, label] of Object.entries(labels)) {
        let line = `${label.padEnd(maxLabelLength)} |`;
        for (let type = 1; type <= 3; type++) {
            const value = statistiques[type] && statistiques[type][key];
            if (value !== undefined) {
                if (key === 'nombre_echantillons_page' || key === 'nombre_echantillons_top5') {
                    line += ` ${value.toString().padStart(6)} |`;
                } else {
                    line += ` ${value.padStart(8)} |`;
                }
            } else {
                line += '    N/A   |';
            }
        }
        console.log(line);
    }

    console.log('\n');
}

function updateStatsJson(statsJson, statistiques, ville, date) {
    if (!statsJson[ville]) statsJson[ville] = {};
    if (!statsJson[ville][date]) statsJson[ville][date] = {1: {}, 2: {}, 3: {}};

    for (const type in statistiques) {
        const newStats = statistiques[type];
        if (!statsJson[ville][date][type]) {
            statsJson[ville][date][type] = newStats;
        } else {
            const oldStats = statsJson[ville][date][type];

            // Mise à jour des plages
            const updatePlage = (oldPlage, newPlage, unit) => {
                if (!newPlage) return oldPlage;
                const [oldMin, oldMax] = oldPlage ? oldPlage.replace(/[\[\]%€]/g, '').split(' - ').map(Number) : [Infinity, -Infinity];
                const [newMin, newMax] = newPlage.replace(/[\[\]%€]/g, '').split(' - ').map(Number);
                return `[${Math.min(oldMin, newMin)}${unit} - ${Math.max(oldMax, newMax)}${unit}]`;
            };

            oldStats.plage_reductions_page = updatePlage(oldStats.plage_reductions_page, newStats.plage_reductions_page, '%');
            oldStats.plage_prix_page = updatePlage(oldStats.plage_prix_page, newStats.plage_prix_page, '€');
            oldStats.plage_reductions_top5 = updatePlage(oldStats.plage_reductions_top5, newStats.plage_reductions_top5, '%');
            oldStats.plage_prix_top5 = updatePlage(oldStats.plage_prix_top5, newStats.plage_prix_top5, '€');

            // Mise à jour des moyennes
            const updateMoyenne = (oldVal, newVal, oldCount, newCount, unit) => {
                if (newVal === undefined) return oldVal;
                oldVal = parseFloat(oldVal) || 0;
                newVal = parseFloat(newVal);
                oldCount = oldCount || 0;
                newCount = newCount || 0;
                return ((oldVal * oldCount + newVal * newCount) / (oldCount + newCount)).toFixed(2) + unit;
            };

            oldStats.moyenne_reductions = updateMoyenne(oldStats.moyenne_reductions, newStats.moyenne_reductions, oldStats.nombre_echantillons_page, newStats.nombre_echantillons_page, '%');
            oldStats.moyenne_reductions_top5 = updateMoyenne(oldStats.moyenne_reductions_top5, newStats.moyenne_reductions_top5, oldStats.nombre_echantillons_top5, newStats.nombre_echantillons_top5, '%');
            oldStats.moyenne_prix = updateMoyenne(oldStats.moyenne_prix, newStats.moyenne_prix, oldStats.nombre_echantillons_page, newStats.nombre_echantillons_page, '€');
            oldStats.moyenne_prix_top5 = updateMoyenne(oldStats.moyenne_prix_top5, newStats.moyenne_prix_top5, oldStats.nombre_echantillons_top5, newStats.nombre_echantillons_top5, '€');
            oldStats.moyenne_etoiles = updateMoyenne(oldStats.moyenne_etoiles, newStats.moyenne_etoiles, oldStats.nombre_echantillons_page, newStats.nombre_echantillons_page, '');

            // Mise à jour des nombres d'échantillons
            oldStats.nombre_echantillons_page = (oldStats.nombre_echantillons_page || 0) + (newStats.nombre_echantillons_page || 0);
            oldStats.nombre_echantillons_top5 = (oldStats.nombre_echantillons_top5 || 0) + (newStats.nombre_echantillons_top5 || 0);
        }
    }

    // Sauvegarde des mises à jour
    fs.writeFileSync(path.join(__dirname, './json/statistiques.json'), JSON.stringify(statsJson, null, 2));

    return statsJson[ville][date];
}

// Fonctions auxiliaires pour les calculs statistiques
function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}


module.exports = { collectStatistiques, afficherStatistiquesConsole, updateStatsJson };