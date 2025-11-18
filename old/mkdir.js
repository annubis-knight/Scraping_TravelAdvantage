const fs = require('fs').promises;
const path = require('path');

async function createScreenshotFolders() {
  try {
    // Lire tous les fichiers xlsx du dossier dataVilles
    const filesPath = path.join(__dirname, 'saveData', 'datasVilles');
    const screenshotsPath = path.join(__dirname, 'saveData', 'images', 'screenshots');
    
    const files = await fs.readdir(filesPath);
    const xlsxFiles = files.filter(file => file.endsWith('.xlsx'));
    
    // Créer les dossiers correspondants
    for (const file of xlsxFiles) {
      const cityName = path.parse(file).name; // Récupère le nom sans extension
      const cityFolderPath = path.join(screenshotsPath, cityName);
      
      try {
        await fs.mkdir(cityFolderPath);
        console.log(`Dossier créé pour ${cityName}`);
      } catch (err) {
        if (err.code !== 'EEXIST') { // Ignore l'erreur si le dossier existe déjà
          console.error(`Erreur pour ${cityName}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
}

createScreenshotFolders();