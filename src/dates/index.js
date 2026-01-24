// mix.js
const { getObjects } = require('./getDates.js');
const { processCSV } = require('./remplirJSON.js');
const fs = require('fs');
const path = require('path');

function areDatesEqual(date1, date2) {
  return date1.date.fromDate === date2.date.fromDate &&
         date1.date.toDate === date2.date.toDate &&
         date1.date.type === date2.date.type;
}

function removePassedDates(dates) {
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  console.log('Date d\'aujourd\'hui:', today);
  
  const filteredDates = dates.filter(date => date.date.fromDate >= today);
  
  console.log('Nombre de dates supprimées:', dates.length - filteredDates.length);
  return filteredDates;
}

function mergeDates(arr1, arr2) {
  console.log('Fusion des tableaux...');
  const mergedArray = [...arr1, ...arr2];
  console.log('Nombre total d\'éléments avant déduplication:', mergedArray.length);

  const uniqueDates = mergedArray.filter((date, index, self) =>
    index === self.findIndex((t) => areDatesEqual(t, date))
  );
  console.log('Nombre d\'éléments après déduplication:', uniqueDates.length);

  const sortedDates = uniqueDates.sort((a, b) => {
    if (a.date.type !== b.date.type) {
      return a.date.type - b.date.type;
    }
    return new Date(a.date.fromDate) - new Date(b.date.fromDate);
  });
  console.log('Tri terminé');

  return sortedDates;
}

async function main() {
  try {
    console.log('Début du traitement...');

    // Obtenir les objets de getDates.js
    const objects = await getObjects();
    console.log('Objects récupérés de getDates.js:', objects.length);

    // Obtenir les résultats de remplirJSON.js
    const results = await processCSV();
    console.log('Résultats récupérés de remplirJSON.js:', results.length);

    // Supprimer les dates passées
    const currentObjects = removePassedDates(objects);
    const currentResults = removePassedDates(results);

    // Fusionner, dédupliquer et trier les dates
    const finalDates = mergeDates(currentObjects, currentResults);
    console.log('Nombre total de dates après fusion et déduplication:', finalDates.length);

    // Enregistrer le résultat dans Dates.json
    fs.writeFileSync(path.join(__dirname, '../scraping/json/Dates.json'), JSON.stringify(finalDates, null, 2));
    console.log('Les dates finales ont été enregistrées dans Dates.json');

  } catch (error) {
    console.error('Erreur lors de la récupération ou du traitement des données:', error);
  }
}

(async () => {
  await main();
  console.log('Traitement terminé.');
})();