const ExcelJS = require('exceljs');
const { scrapeHotels } = require('./scrapeHotels.js');

async function main() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('scrapSearch.xlsx');

    const worksheet = workbook.getWorksheet(1); // Obtient la première feuille

    // Boucle sur chaque ligne du fichier Excel
    for (let i = 2; i <= worksheet.rowCount; i++) { // Commence à 2 pour ignorer l'en-tête
        const row = worksheet.getRow(i);
        
        const ville = row.getCell(1).value;
        const fromDate = row.getCell(2).value;
        const toDate = row.getCell(3).value;
        const typeDeReservation = row.getCell(4).value;

        // Vérifier que toutes les données nécessaires sont présentes
        if (ville && fromDate && toDate && typeDeReservation) {
            console.log(`Scraping pour ${ville} du ${fromDate} au ${toDate}`);
            
            // Convertir les dates en format string si elles sont des objets Date
            const fromDateStr = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
            const toDateStr = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;

            await scrapeHotels(ville, fromDateStr, toDateStr, typeDeReservation);
        } else {
            console.log(`Données manquantes pour la ligne ${i}`);
        }
    }
}

main().catch(console.error);