const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

async function generateMapData() {
    const workbook = new ExcelJS.Workbook();
    const resultatPath = path.join(__dirname, 'resultat.xlsx');
    const villesPath = path.join(__dirname, '../scraping/villesDeDestinations.xlsx');

    // Lire le fichier des villes de destinations
    const villesWorkbook = new ExcelJS.Workbook();
    await villesWorkbook.xlsx.readFile(villesPath);
    const villesSheet = villesWorkbook.getWorksheet(1);

    // Créer un map des villes avec leurs coordonnées et pays à partir de villesDeDestinations.xlsx
    const villesMap = new Map();
    villesSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Ignorer l'en-tête
            const ville = row.getCell(1).value;
            const country = row.getCell(2).value;
            const lat = row.getCell(3).value;
            const lon = row.getCell(4).value;
            villesMap.set(ville, { country, lat, lon });
        }
    });

    // Lire le fichier résultat, les villes doivent correspondent avec les villes dans villesDeDestination.xslx
    await workbook.xlsx.readFile(resultatPath);
    
    const mapData = {};

    workbook.eachSheet((worksheet, sheetId) => {
        const moisAnnee = worksheet.name;
        mapData[moisAnnee] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {  // Ignore la ligne d'en-tête
                const ville = row.getCell(1).value;
                const pourcentages = [
                    parseFloat(row.getCell(2).value),
                    parseFloat(row.getCell(3).value),
                    parseFloat(row.getCell(4).value)
                ];

                const coordonnees = villesMap.get(ville);
                if (coordonnees) {
                    mapData[moisAnnee].push({
                        ville,
                        country: coordonnees.country,
                        lat: coordonnees.lat,
                        lon: coordonnees.lon,
                        pourcentages
                    });
                } else {
                    console.warn(`Coordonnées non trouvées pour la ville: ${ville}`);
                }
            }
        });
    });

    const fileContent = `const mapData = ${JSON.stringify(mapData, null, 2)};`;
    await fs.writeFile(path.join(__dirname, 'mapData.js'), fileContent);
    console.log("Le fichier mapData.js a été créé avec succès.");
}

generateMapData().catch(console.error);