const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { getCurrentDateTime } = require('./formatDate.js');

function addHotelsToWorksheet(worksheet, jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
        console.log("jsonData est vide ou n'est pas un objet valide");
        return;
    }

    const headers = ['Nom Hôtel', 'Location', 'Étoiles', 'Note', 'Réduction', 'Prix Travel',
        'Prix Concurrents', 'Économies Membres', 'Image URL', 'Date Début',
        'Date Fin', 'Type de Réservation', 'Vu Le'];

    const colors = {
        1: { header: 'FF32CD32', data: 'FFB2E6B2' }, // Vert
        2: { header: 'FF1E90FF', data: 'FFA4D8E1' }, // Bleu
        3: { header: 'FFFF8C00', data: 'FFF2C1A0' }  // Orange
    };

    Object.entries(jsonData).forEach(([type, hotels]) => {
        if (hotels && hotels.length) {
            // Prendre uniquement les 10 premiers hôtels
            const topHotels = hotels.slice(0, 10);
            const startRow = worksheet.rowCount + 1;
            worksheet.addRows([
                headers,
                ...topHotels.map(Object.values),
                []
            ]);

            // Colorer l'en-tête et les données
            for (let row = startRow; row < worksheet.rowCount; row++) {
                const isHeader = row === startRow;
                const color = colors[type][isHeader ? 'header' : 'data'];
                worksheet.getRow(row).eachCell((cell, colNumber) => {
                    if (colNumber <= 13) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
                        if (isHeader) {
                            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                        }
                    }
                });
            }
        }
    });

}

function addStatsResumeToWorksheet(worksheet, statsJson) {
    const maxReductions = { weekend: 0, semaine: 0, deuxSemaines: 0 };                      // Initialise les réductions maximales
    const types = { '1': 'weekend', '2': 'semaine', '3': 'deuxSemaines' };                  // Mapping des types de réservation
    const typeColors = { '1': 'FF32CD32', '2': 'FF1E90FF', '3': 'FFFF8C00' };               // Couleurs pour chaque type (vert, bleu, orange)

    // const cityStats = statsJson[city];
    // if (cityStats && cityStats[worksheet.name]) {
    //     const typesStats = cityStats[worksheet.name];
    Object.entries(statsJson).forEach(([type, stats]) => {
        if (stats.plage_reductions_page) {
            // Extrait la réduction maximale de la plage de la page
            const maxReduction = parseFloat(stats.plage_reductions_page.split(' - ')[1].replace(']', '').replace('%', ''));
            maxReductions[types[type]] = Math.max(maxReductions[types[type]], maxReduction);
        }
        if (stats.plage_reductions_top5) {
            // Extrait la réduction maximale de la plage du top 5
            const maxReductionTop5 = parseFloat(stats.plage_reductions_top5.split(' - ')[1].replace(']', '').replace('%', ''));
            maxReductions[types[type]] = Math.max(maxReductions[types[type]], maxReductionTop5);
        }
    });

    // Ajoute une nouvelle ligne au début de la feuille avec les réductions maximales
    worksheet.spliceRows(1, 0, [
        `${worksheet.name}`,
        `${maxReductions.weekend}%`,
        `${maxReductions.semaine}%`,
        `${maxReductions.deuxSemaines}%`
    ], []);

    // Applique le formatage à la nouvelle ligne
    const summaryRow = worksheet.getRow(1);
    summaryRow.eachCell((cell, colNumber) => {
        if (colNumber > 1 && colNumber <= 4) {
            const type = (colNumber - 1).toString();
            cell.font = { color: { argb: typeColors[type] }, bold: true };              // Applique la couleur et met en gras
        }
    });
}

function addStatsToWorksheet(worksheet, updatedStats) {
    // Vérification de la validité des données d'entrée
    if (!updatedStats || typeof updatedStats !== 'object') {
        console.log("updatedStats est vide ou n'est pas un objet valide");
        return;
    }

    // Définition des en-têtes pour les colonnes de statistiques
    const headers = [
        '', 'Moyenne(Reductions) 1ère page', 'Min-Max(Reductions) 1ère page',
        'Moyenne(Reductions) top5', 'Min-Max(Reductions) top5', 'Moyenne(Prix) 1ère page',
        'Min-Max(Prix) 1ère page', 'Moyenne(Prix) top5', 'Min-Max(Prix) top5', 'Moyenne(étoiles)',
        'Nombre d\'échantillons page', 'Nombre d\'échantillons top5'
    ];

    // Mapping des types de réservation numériques vers des labels lisibles
    const typeLabels = { '1': 'Weekend', '2': 'Semaine', '3': '2 Semaines' };
    const startRow = worksheet.rowCount + 1;     // Détermination de la ligne de départ pour l'ajout des statistiques

    worksheet.addRow(headers);

    // Mise en forme des en-têtes en gras
    const headerRow = worksheet.getRow(startRow);
    headerRow.eachCell(cell => {
        cell.font = { bold: true };
    });

    // Parcours des statistiques pour chaque type de réservation
    Object.entries(updatedStats).forEach(([type, stats]) => {
        // Préparation des valeurs pour une ligne de statistiques
        const rowValues = [
            typeLabels[type] || type, // Label du type de réservation
            stats.moyenne_reductions,
            stats.plage_reductions_page,
            stats.moyenne_reductions_top5,
            stats.plage_reductions_top5,
            stats.moyenne_prix,
            stats.plage_prix_page,
            stats.moyenne_prix_top5,
            stats.plage_prix_top5,
            stats.moyenne_etoiles,
            stats.nombre_echantillons_page,
            stats.nombre_echantillons_top5
        ];
        // Ajout de la ligne de statistiques à la feuille de calcul
        worksheet.addRow(rowValues);
    });
    worksheet.addRow([]);
}



async function excelOutput(ville, fromDateStr) {
    // Préparer le fichier Excel et obtenir la worksheet
    const { outputWorkbook, worksheet, excelFilePath } = await prepareExcelWorksheet(ville, fromDateStr);

    // Lire les données existantes
    await readExcelToJson(worksheet);

    // Effacer la worksheet pour les nouvelles données
    clearWorksheet(worksheet);

    return { outputWorkbook, worksheet, excelFilePath };
}

function clearWorksheet(worksheet) {
    // Effacer toutes les lignes
    while (worksheet.rowCount > 0) {
        worksheet.spliceRows(1, 1);
    }
}


function extractCityData(row) {
    const ville = row.getCell(1).value;
    const country = row.getCell(2).value;
    const latitude = row.getCell(3).value;
    const longitude = row.getCell(4).value;
    const googlePlacesCountry = row.getCell(5).value;

    if (!ville || !country || !latitude || !longitude || !googlePlacesCountry) {
        return null;
    }

    // Écrire la date et l'heure actuelles dans la colonne 7
    const currentDateTime = getCurrentDateTime();
    row.getCell(7).value = currentDateTime;

    return { ville, country, latitude, longitude, googlePlacesCountry };
}

async function readInputExcel(filename) {
    const inputWorkbook = new ExcelJS.Workbook();
    await inputWorkbook.xlsx.readFile(filename);
    return {
        inputWorkbook: inputWorkbook,
        inputWorksheet: inputWorkbook.getWorksheet(1)
    };
}
/*Lit une feuille de calcul Excel et convertit les données en format JSON.
 * @param {Worksheet} worksheet - La feuille de calcul Excel à lire.
 * @returns {Object} Un objet JSON contenant les données des hôtels. */
async function readExcelToJson(worksheet) {
    const jsonData = {};

    function formatValue(value, isPercentage = false) {
        if (typeof value === 'number') {
            return isPercentage ? `${(value * 100).toFixed(0)}%` : `${value.toFixed(2)}€`;  // Formate les nombres en pourcentage ou en euros
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);                                                  // Tente de convertir la chaîne en nombre
            if (!isNaN(num)) {
                return isPercentage ? `${num}%` : `${num.toFixed(2)}€`;                     // Formate si la conversion réussit
            }
            return value;                                                                   // Retourne la chaîne originale si la conversion échoue
        }
        return value;                                                                       // Retourne la valeur telle quelle si ce n'est ni un nombre ni une chaîne
    }

    worksheet.eachRow((row, rowNumber) => {
        const dateCell = row.getCell(10).value;                                             // Vérifie la 10ème colonne (J) pour une date valide
        if (dateCell && isValidDate(dateCell)) {
            const hotelData = {
                nomHotel: row.getCell(1).value,
                location: row.getCell(2).value,
                etoiles: row.getCell(3).value,
                note: row.getCell(4).value,
                reduction: formatValue(row.getCell(5).value, true),                         // Formate la réduction comme un pourcentage
                prixTravel: formatValue(row.getCell(6).value),                              // Formate les prix en euros
                prixConcurrents: formatValue(row.getCell(7).value),
                economiesMembres: formatValue(row.getCell(8).value),
                imageUrl: row.getCell(9).value,
                fromDate: dateCell,
                toDate: row.getCell(11).value,
                typeDeReservation: row.getCell(12).value,
                vuLe: row.getCell(13).value
            };
            jsonData[`item${rowNumber}`] = hotelData;                                       // Ajoute l'objet au jsonData avec une clé unique
        }
    });

    const jsonFilePath = path.join(__dirname, './json/saved_hotels.json');                         // Définit le chemin du fichier de sortie
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));                      // Écrit les données JSON dans le fichier

    return jsonData;
}



async function prepareExcelWorksheet(ville, fromDateStr) {
    // Déterminer le nom du mois et de l'année pour l'onglet Excel
    const [year, month] = fromDateStr.split('-');
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const sheetName = `${monthNames[parseInt(month) - 1]}_${year}`;

    try {
        const outputWorkbook = new ExcelJS.Workbook();
        const excelFilePath = path.join(__dirname, `saveData/datasVilles/${ville}.xlsx`);
    
        // Vérifier si le répertoire existe, sinon le créer
        const dir = path.dirname(excelFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    
        // Gestion du fichier
        if (fs.existsSync(excelFilePath)) {
            await outputWorkbook.xlsx.readFile(excelFilePath);
        } else {
            console.log(`Création d'un nouveau fichier Excel: ${excelFilePath}`);
        }
    
        // Gestion de l'onglet
        let worksheet = outputWorkbook.getWorksheet(sheetName);
        if (!worksheet) {
            worksheet = outputWorkbook.addWorksheet(sheetName);
            console.log(`Création d'un nouvel onglet : ${sheetName}`);

            // Définir 20 colonnes
            worksheet.columns = Array.from({ length: 20 }, (_, i) => ({
                key: `col${i + 1}`,
                width: 15
            }));

        }

        await outputWorkbook.xlsx.writeFile(excelFilePath);

        return { outputWorkbook, worksheet, excelFilePath };
    
    } catch (error) {
        console.error(`Erreur lors de la création/ouverture du fichier Excel: ${error.message}`);
        throw error;
    }

}

function isValidDate(value) {
    if (typeof value === 'string') {
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    } else if (value instanceof Date) {
        return true;
    }
    return false;
}

module.exports = { addHotelsToWorksheet, addStatsResumeToWorksheet, addStatsToWorksheet, excelOutput, readInputExcel, extractCityData };
