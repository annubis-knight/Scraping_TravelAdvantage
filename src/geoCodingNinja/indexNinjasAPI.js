const ExcelJS = require('exceljs');
const fetch = require('node-fetch');
const path = require('path');

const API_KEY = 'pKvAWwcx6JOzxHTTBoQtDg==e5zixKgloq6yFp1q';
const API_URL = 'https://api.api-ninjas.com/v1/geocoding';

async function getLocation(city) {
  try {
    const response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.length > 0) {
      const location = data[0];
      console.log(`Résultats pour ${city}:`);
      console.log(`Nom: ${location.name}`);
      console.log(`Latitude: ${location.latitude}`);
      console.log(`Longitude: ${location.longitude}`);
      console.log(`Pays: ${location.country}`);
      return location;
    } else {
      console.log(`Aucun résultat trouvé pour ${city}`);
      return null;
    }
  } catch (error) {
    console.error('Une erreur est survenue:', error);
    return null;
  }
}

async function updateExcelWithLocations() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, '..', 'scraping/villesDeDestinations.xlsx'));
  const worksheet = workbook.getWorksheet(1);

  // Trouver la dernière ligne non vide
  let lastRow = worksheet.rowCount;
  while (lastRow > 1 && worksheet.getRow(lastRow).getCell(1).value == null) {
    lastRow--;
  }

  for (let i = 2; i <= lastRow; i++) {
    const city = worksheet.getCell(`A${i}`).value;
    const existingLatitude = worksheet.getCell(`C${i}`).value;
    const existingLongitude = worksheet.getCell(`D${i}`).value;
  
    if (city && (existingLatitude == null || existingLongitude == null)) {
      console.log(`Recherche des coordonnées pour ${city}...`);
      const location = await getLocation(city);
      if (location) {
        // Convertir les valeurs en chaînes et remplacer la virgule par un point
        const latitudeStr = location.latitude.toFixed(4).replace(',', '.');
        const longitudeStr = location.longitude.toFixed(4).replace(',', '.');
        
        worksheet.getCell(`C${i}`).value = latitudeStr;
        worksheet.getCell(`D${i}`).value = longitudeStr;
        worksheet.getCell(`E${i}`).value = location.country;
        // console.log(`Coordonnées mises à jour pour ${city}`);
      } else {
        // console.log(`Impossible de trouver les coordonnées pour ${city}`);
      }
    } else if (city) {
      // console.log(`Coordonnées déjà existantes pour ${city}, pas de mise à jour nécessaire`);
    }
  }

  await workbook.xlsx.writeFile(path.join(__dirname, '..', 'scraping/villesDeDestinations.xlsx'));
  console.log('Fichier Excel mis à jour avec succès.');
}

updateExcelWithLocations().catch(console.error);