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
            return Object.keys(obj).reduce((acc, k) => {// Utilise Object.keys pour obtenir un tableau de toutes les clés de l'objet                
                
                const pre = prefix.length ? prefix + '.' : ''; // Si un préfixe existe, ajoute un point à la fin, sinon utilise une chaîne vide       
                
                if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) { // Vérifie si la valeur associée à la clé est un objet (mais pas null ni un tableau)
                    Object.assign(acc, flattenObject(obj[k], pre + k));  // Si c'est un objet, appelle récursivement flattenObject pour aplatir cet objet ET Utilise Object.assign pour fusionner le résultat aplati dans l'accumulateur
                } else {                    
                    acc[pre + k] = obj[k];// Si ce n'est pas un objet, ajoute la paire clé-valeur à l'accumulateur
                }                
                return acc; // Retourne l'accumulateur mis à jour pour la prochaine itération

            }, {}); // Commence avec un accumulateur vide
        }

        // Déterminer les en-têtes en fonction de la structure du JSON
        let headers = new Set();
        let flattenedData = [];

        // Normaliser les données pour qu'elles soient toujours traitées comme un tableau
        const dataArray = Array.isArray(data) ? data : [data];

        // Aplatir les données et collecter les en-têtes
        dataArray.forEach(item => {
            const flattened = flattenObject(item);
            Object.keys(flattened).forEach(key => headers.add(key));
            flattenedData.push(flattened);
        });

        
        // Définir les colonnes
        worksheet.columns = Array.from(headers).map(header => ({
            header: header,
            key: header,
            width: 20
        }));

        // Ajouter les données et appliquer des styles
        flattenedData.forEach(item => {
            const row = worksheet.addRow(item);
            row.eachCell((cell) => {
                if (cell.value && cell.value.toString().includes('3')) {
                    cell.font = { bold: true }; // Mettre en gras si la cellule contient un '3'
                }
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
const jsonFilePath = 'itemTA.json'; // Remplacez par le chemin de votre fichier JSON
const excelFilePath = 'test.xlsx';
writeToExcel(jsonFilePath, excelFilePath);