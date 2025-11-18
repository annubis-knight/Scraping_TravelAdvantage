const fs = require('fs').promises;                                      
const path = require('path');                                           
const ExcelJS = require('exceljs');                                     

const dossierVilles = path.join('../scraping/saveData/datasVilles');    
const donneesParMois = {};                                              

/*
 * Lit un fichier Excel et extrait les données pertinentes.
 * @param {string} fichier - Nom du fichier Excel à lire
 */
const lireFichierExcel = async (fichier) => {
    const workbook = new ExcelJS.Workbook();                            // Crée un nouveau classeur Excel
    await workbook.xlsx.readFile(path.join(dossierVilles, fichier));    // Lit le fichier Excel
    const nomVille = path.parse(fichier).name;                          // Extrait le nom de la ville du nom du fichier

    workbook.eachSheet((worksheet, sheetId) => {                        // Parcourt chaque feuille du classeur
        const nomOnglet = worksheet.name;
        if (nomOnglet.includes('_')) {                                  // Vérifie si l'onglet est un mois_année
            const [, ...premiereLigne] = worksheet.getRow(1).values.slice(1, 5);  // Extrait les valeurs B1, C1, D1
            (donneesParMois[nomOnglet] ??= []).push([nomVille, ...premiereLigne]);  // Ajoute les données au mois correspondant
        }
    });
};

/**
 * Crée le fichier Excel résultat avec les données collectées.
 */
const creerFichierResultat = async () => {
    const wbResultat = new ExcelJS.Workbook();                          // Crée un nouveau classeur pour le résultat
    
    Object.entries(donneesParMois).forEach(([moisAnnee, donnees]) => {  // Parcourt chaque mois et ses données
        const ws = wbResultat.addWorksheet(moisAnnee);                  // Crée un nouvel onglet pour chaque mois
        ws.addRow(['Ville', 'Weekend (%)', 'Semaine (%)', '2 Semaines (%)']);  // Ajoute l'en-tête
        
        donnees.forEach(ligne => {                                      // Parcourt chaque ligne de données
            const row = ws.addRow(ligne);                               // Ajoute la ligne à la feuille
            row.eachCell((cell, colNumber) => {                         // Parcourt chaque cellule de la ligne
                if (colNumber > 1 && parseFloat(cell.value) > 40) {     // Si c'est un pourcentage > 40%
                    cell.font = { bold: true };                         // Met en gras
                }
            });
        });
        
        ws.columns.forEach(column => column.width = 15);                // Ajuste la largeur des colonnes
    });

    await wbResultat.xlsx.writeFile('resultat.xlsx');                   // Écrit le fichier résultat
};

/**
 * Fonction principale qui orchestre le processus.
 */
const main = async () => {
    try {
        const fichiers = await fs.readdir(dossierVilles);               // Lit le contenu du dossier
        await Promise.all(fichiers.filter(f => f.endsWith('.xlsx'))     // Traite tous les fichiers Excel en parallèle
                                  .map(lireFichierExcel));
        await creerFichierResultat();                                   // Crée le fichier résultat
        console.log("Le fichier resultat.xlsx a été créé avec succès.");
    } catch (err) {
        console.error("Erreur lors de l'exécution du script:", err);    
    }
};

main();                                                                 