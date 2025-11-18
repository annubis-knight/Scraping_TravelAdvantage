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

        // Fonction pour aplatir un objet
        function flattenObject(obj, prefix = '') {
            return Object.keys(obj).reduce((acc, k) => {
                const pre = prefix.length ? prefix + '.' : '';
                if (Array.isArray(obj[k])) {
                    acc[pre + k] = obj[k].join(', '); // Joindre les tableaux en chaîne
                } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                    Object.assign(acc, flattenObject(obj[k], pre + k));
                } else {
                    acc[pre + k] = obj[k];
                }
                return acc;
            }, {});
        }

        // Collecter tous les headers
        let headers = new Set();
        let flattenedData = [];

        // Normaliser les données pour qu'elles soient toujours traitées comme un tableau
        const dataArray = Array.isArray(data.villes) ? data.villes : [data.villes];

        // Aplatir les données et collecter les en-têtes
        dataArray.forEach(ville => {
            ville.hotels.forEach(hotel => {
                const flattened = flattenObject(hotel);
                Object.keys(flattened).forEach(key => headers.add(key));
                flattenedData.push({ ville: ville.nom, ...flattened });
            });
        });

        // Convertir le Set en tableau
        const headerArray = ['ville', ...Array.from(headers)];

        // Transposer les données
        headerArray.forEach((header, rowIndex) => {
            worksheet.getCell(rowIndex + 1, 1).value = header; // Placer le header dans la première colonne
            flattenedData.forEach((item, colIndex) => {
                worksheet.getCell(rowIndex + 1, colIndex + 2).value = item[header] || ''; // Placer la valeur
            });
        });

        // Sauvegarder le fichier Excel
        await workbook.xlsx.writeFile(excelFilePath);
        console.log(`Fichier Excel créé avec succès : ${excelFilePath}`);
    } catch (error) {
        console.error('Erreur lors de la création du fichier Excel:', error);
    }
}

// Utilisation de la fonction
const jsonFilePath = 'test.json'; // Remplacez par le chemin de votre fichier JSON
const excelFilePath = 'test.xlsx';
writeToExcel(jsonFilePath, excelFilePath);