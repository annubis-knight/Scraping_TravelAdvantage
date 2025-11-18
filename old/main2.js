const ExcelJS = require('exceljs');
const { scrapeHotels } = require('./scrapeHotels.js');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const inputWorkbook = new ExcelJS.Workbook();
        await inputWorkbook.xlsx.readFile('villesDeDestinations.xlsx');

        const inputWorksheet = inputWorkbook.getWorksheet(1); // Obtient la première feuille
        console.log('nombre de lignes non vides' + inputWorksheet.rowCount);

        // Boucle sur chaque ligne du fichier Excel d'entrée
        for (let i = 2; i < inputWorksheet.rowCount; i++) { // Commence à 2 pour ignorer l'en-tête
            const row = inputWorksheet.getRow(i);
            
            const ville = row.getCell(1).value;
            const country = row.getCell(2).value; 
            const latitude = row.getCell(3).value;
            const longitude = row.getCell(4).value;
            const googlePlacesCountry = row.getCell(5).value;


            // Boucle fromDate et toDate sur le fichier Dates.json
            const dates = require('./Dates.json');
            for (const item of dates) {
                const fromDate = item.date.fromDate;
                const toDate = item.date.toDate;
                const typeDeReservation = item.date.type;

                // Vérifier que toutes les données nécessaires sont présentes
                if (ville && fromDate && toDate && typeDeReservation) {
                    console.log(`Scraping pour ${ville} du ${fromDate} au ${toDate}`);
                    
                    // Convertir les dates en format string si elles sont des objets Date
                    const fromDateStr = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
                    const toDateStr = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;
                    
                    // Exécuter le scraping
                    try {
                        await scrapeHotels(ville, country, latitude, longitude, googlePlacesCountry, fromDateStr, toDateStr, typeDeReservation);
                      } catch (error) {
                        console.error(`Erreur lors du scraping pour ${ville}: ${error.message}`);
                        continue; // Passe à la prochaine itération
                      }

                    // Lire le fichier JSON généré
                    const jsonFilePath = path.join(__dirname, `hotels_data.json`);
                    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

                    // Préparation de l'Excel
                    const { outputWorkbook, worksheet, excelFilePath } = await prepareExcelWorksheet(ville, fromDateStr);

                    // Ajouter les données des hôtels
                    Object.values(jsonData).forEach(hotel => {
                        worksheet.addRow([
                            hotel.nomHotel,
                            hotel.location,
                            hotel.note,
                            hotel.reduction,
                            hotel.prixTravel,
                            hotel.prixConcurrents,
                            hotel.economiesMembres,
                            hotel.imageUrl,
                            hotel.fromDate,
                            hotel.toDate,
                            hotel.typeDeReservation
                        ]);
                    });

                    // Sauvegarder le fichier Excel
                    await outputWorkbook.xlsx.writeFile(excelFilePath);
                    console.log(`Données ajoutées au fichier Excel: ${excelFilePath}`);

                    // Ajouter un délai optionnel entre chaque scraping
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Délai de 1 seconde

                } else {
                    console.log(`Données manquantes pour la ligne ${i}`);
                }
            };            
        }

    } catch (error) {
        console.error('Erreur lors du traitement:', error);
    }
}

async function prepareExcelWorksheet(ville, fromDateStr) {
    // Déterminer le nom du mois et de l'année pour l'onglet Excel
    const [year, month] = fromDateStr.split('-');
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const sheetName = `${monthNames[parseInt(month) - 1]}_${year}`;

    // Préparer le fichier Excel de sortie
    const outputWorkbook = new ExcelJS.Workbook();
    const excelFilePath = path.join(__dirname, `${ville}.xlsx`);

    // Vérifier si le fichier Excel existe déjà
    if (fs.existsSync(excelFilePath)) {
        await outputWorkbook.xlsx.readFile(excelFilePath);
    }

    // Obtenir ou créer l'onglet
    let worksheet = outputWorkbook.getWorksheet(sheetName);
    if (!worksheet) {
        worksheet = outputWorkbook.addWorksheet(sheetName);
        // Ajouter les en-têtes si c'est un nouvel onglet
        worksheet.addRow(['Nom Hôtel', 'Location', 'Note', 'Réduction', 'Prix Travel', 'Prix Concurrents', 'Économies Membres', 'Image URL', 'fromDate','toDate','Type de Réservation']);
    }

    return { outputWorkbook, worksheet, excelFilePath };
}

main().catch(console.error);