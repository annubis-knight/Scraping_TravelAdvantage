const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const getReservationType = (typeValue) => {
    switch(typeValue) {
        case 1: return 'Weekend';
        case 2: return 'Semaine';
        case 3: return '2 Semaines';
        default: return 'Inconnu';
    }
};

async function processExcelData(selectedCities) {
    console.log("Objet reçu par le client:", JSON.stringify(selectedCities, null, 2));
    console.log("Début de processExcelData avec:", selectedCities);
    const results = [];

    // Charger les données JSON des villes
    const citiesDataPath = path.join(__dirname, 'villesDeDestinations.json');
    const citiesData = JSON.parse(fs.readFileSync(citiesDataPath, 'utf8'));

    for (const month in selectedCities) {
        console.log(`Traitement du mois: ${month}`);
        for (const [ville, data] of Object.entries(selectedCities[month])) {
            console.log(`Traitement de la ville: ${ville}`);
            const filePath = path.join(__dirname, '..', '..', 'scraping', 'saveData', 'datasVilles', `${ville}.xlsx`);
            console.log(`Tentative d'ouverture du fichier: ${filePath}`);
            
            try {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(filePath);
                console.log(`Fichier ouvert avec succès: ${filePath}`);

                const worksheet = workbook.getWorksheet(month);
                if (!worksheet) {
                    console.log(`Onglet non trouvé: ${month}`);
                    throw new Error(`Onglet ${month} non trouvé pour ${ville}`);
                }
                console.log(`Onglet trouvé: ${month}`);

                // Récupérer les données JSON de la ville
                const cityJsonData = citiesData[ville] || {};

                data.types.forEach(typeData => {
                    const type = typeData.type;
                    const pourcentage = typeData.pourcentage;
                    console.log(`Traitement du type: ${type}, Pourcentage: ${pourcentage}`);
                    const typeValue = type === 'Weekend' ? 1 : (type === 'Semaine' ? 2 : 3);
                    let excelData = [];

                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber > 1) {
                            const typeCell = row.getCell(12).value;
                            let percentageCell = row.getCell(5).value;
                            
                            // Convertir la cellule de pourcentage en nombre si c'est une chaîne
                            if (typeof percentageCell === 'string') {
                                percentageCell = parseFloat(percentageCell.replace('%', ''));
                            }

                            console.log(`Ligne ${rowNumber}: Type=${typeCell}, Pourcentage=${percentageCell}, Recherché: Type=${typeValue}, Pourcentage=${pourcentage}`);

                            // Si les types de réservations correspondent et les pourcentages correspondent, ajouter les données Excel à la liste des données
                            if (typeCell === typeValue && percentageCell === pourcentage) {
                                
                                // Extraire les données de la ligne courante et des lignes supplémentaires si nécessaire pour le type de réservation spécifique (Weekend, Semaine, 2 Semaines)
                                excelData.push(...[0, 1, 2].map(offset => {
                                    const currentRow = worksheet.getRow(rowNumber + offset);
                                    return currentRow ? {
                                        typeDeReservation: getReservationType(typeValue),
                                        data: currentRow.values.slice(1)
                                    } : null;
                                }).filter(Boolean));
                            }
                        }
                    });

                    console.log(`Données trouvées pour ${ville}, ${type}:`, excelData);

                    results.push({
                        ville,
                        dateAnnee: month,
                        typeDeReservation: getReservationType(typeValue),
                        pourcentage: pourcentage,
                        excelData,
                        // Ajouter les données JSON de la ville
                        country: cityJsonData.country,
                        latitude: cityJsonData.latitude,
                        longitude: cityJsonData.longitude,
                        googlePlacesCountry: cityJsonData.googlePlacesCountry
                    });
                });
            } catch (error) {
                console.error(`Erreur lors du traitement du fichier pour ${ville}:`, error);
                results.push({
                    ville,
                    dateAnnee: month,
                    error: `Erreur lors du traitement: ${error.message}`
                });
            }
        }
    }

    console.log("Résultats finaux:", JSON.stringify(results, null, 2));
    return results;
}

module.exports = { processExcelData };