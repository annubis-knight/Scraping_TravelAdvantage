const ExcelJS = require('exceljs');
const fs = require('fs').promises;

async function writeToExcel(jsonFilePath, excelFilePath) {
    try {
        // Lire le fichier JSON
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
        const data = JSON.parse(jsonData);

        // Créer un nouveau workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Normaliser les données pour qu'elles soient toujours traitées comme un tableau
        const dataArray = Array.isArray(data.villes) ? data.villes : [data.villes];

        // Collecter tous les headers
        let headers = new Set();
        dataArray.forEach(ville => {
            ville.hotels.forEach(hotel => {
                Object.keys(hotel).forEach(key => {
                    if (typeof hotel[key] === 'object' && !Array.isArray(hotel[key])) {
                        Object.keys(hotel[key]).forEach(subKey => headers.add(`${key}.${subKey}`));
                    } else {
                        headers.add(key);
                    }
                });
            });
        });

        // Convertir le Set en tableau
        const headerArray = Array.from(headers);

        // Transposer les données
        let currentRow = 1;
        dataArray.forEach(ville => {
            worksheet.getCell(currentRow, 1).value = ville.nom; // Placer le nom de la ville
            currentRow++;

            headerArray.forEach((header, rowIndex) => {
                worksheet.getCell(currentRow + rowIndex, 1).value = header; // Placer le header dans la première colonne
                ville.hotels.forEach((hotel, hotelIndex) => {
                    const keyParts = header.split('.');
                    let value = hotel[keyParts[0]];
                    if (keyParts[1]) {
                        value = value ? value[keyParts[1]] : '';
                    }
                    worksheet.getCell(currentRow + rowIndex, hotelIndex + 2).value = value;
                });
            });

            currentRow += headerArray.length + 1; // Ajouter un espace entre les villes
        });

        // Sauvegarder le fichier Excel
        await workbook.xlsx.writeFile(excelFilePath);
        console.log(`Fichier Excel créé avec succès : ${excelFilePath}`);
    } catch (error) {
        console.error('Erreur lors de la création du fichier Excel:', error);
    }
}

// Utilisation de la fonction
const jsonFilePath = 'test.json'; // c'est le json de test que tu m'as généré
const excelFilePath = 'test.xlsx';
writeToExcel(jsonFilePath, excelFilePath);