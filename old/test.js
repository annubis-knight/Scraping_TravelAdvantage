const { processCsv } = require('./csvParser3.js');

async function main() {
    try {
        const dates = await processCsv('inputScrap.csv');
        // console.log('Dates extraites :', dates);

        // Exemple d'utilisation des dates
        dates.forEach(zoneData => {
            console.log(`Zone ${zoneData.zone}:`);
            for (let i = 0; i < zoneData.dates.fromDate.length; i++) {
                console.log(`from_to [ ${zoneData.dates.fromDate[i]} - ${zoneData.dates.toDate[i]} ]`);
            }
        });

        // Tu peux maintenant utiliser 'dates' dans le reste de ton script
    } catch (error) {
        console.error('Erreur lors du traitement du CSV:', error);
    }
}

main();