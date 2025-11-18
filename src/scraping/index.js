const { scrapeHotels } = require('./scrapeHotels.js');
const fs = require('fs');
const path = require('path');
const { collectStatistiques, afficherStatistiquesConsole, updateStatsJson } = require('./stats.js');
const { addHotelsToWorksheet, addStatsResumeToWorksheet, addStatsToWorksheet, excelOutput, readInputExcel, extractCityData } = require('./xslxHandle.js');
const { formatDate } = require('./formatDate.js');

async function main() {
    try {
        // EXCEL INPUT (Villes)
        const { inputWorkbook, inputWorksheet } = await readInputExcel('./villesDeDestinations.xlsx');

        // JSON INPUT (Dates)
        const dates = require('./json/Dates.json');

        // BOUCLE 1 (Selection de chaque ville)
        for (let i = 2; i <= inputWorksheet.rowCount; i++) {
            const cityData = extractCityData(inputWorksheet.getRow(i));
            await inputWorkbook.xlsx.writeFile('./villesDeDestinations.xlsx');

            if (!cityData) {
                console.log(`Données manquantes pour la ligne ${i}`);
                continue;
            }

            // BOUCLE 2 (Selection de chaque date)
            // await processCityForAllDates(cityData, dates);
            for (const item of dates) {
                const { fromDate, toDate, type: typeDeReservation } = item.date;
                if (!fromDate || !toDate || !typeDeReservation) continue;

                console.log(`Scraping pour ${cityData.ville} du ${fromDate} au ${toDate}`);

                const fromDateStr = formatDate(fromDate);
                const toDateStr = formatDate(toDate);

                // SCRAPING
                try {
                    await scrapeHotels(cityData.ville, cityData.country, cityData.latitude, cityData.longitude, cityData.googlePlacesCountry, fromDateStr, toDateStr, typeDeReservation);

                    await delay(1000);
                } catch (error) {
                    console.error(`Erreur lors du scraping pour ${cityData.ville}: ${error.message}`);
                }

                // EXCEL OUTPUT PREPARATION
                const { outputWorkbook, worksheet, excelFilePath } = await excelOutput(cityData.ville, fromDateStr);

                // TRIER HOTELS
                const savedHotels = readJsonFile('./json/saved_hotels.json');
                // const newHotels = readJsonFile('./json/hotels_data.json');
                const newHotels = filterHotels(readJsonFile('./json/hotels_data.json'));
                const uniqueHotels = removeDuplicates(newHotels, savedHotels);       

                // STATISTIQUES
                const oldStatsJson = readJsonFile('./json/statistiques.json');
                const currentStatsScraped = collectStatistiques(newHotels);
                const updatedStatsJson = updateStatsJson(oldStatsJson, currentStatsScraped, cityData.ville, worksheet.name);

                // afficherStatistiquesConsole(currentStatsScraped);
                // console.log(`Stats UPDATED:` + JSON.stringify(updatedStatsJson, null, 2));

                // WRITE & SAVE HOTELS
                addStatsToWorksheet(worksheet, updatedStatsJson);
                addStatsResumeToWorksheet(worksheet, updatedStatsJson);
                addHotelsToWorksheet(worksheet, uniqueHotels);

                await outputWorkbook.xlsx.writeFile(excelFilePath);
                console.log(`Données ajoutées au fichier Excel: ${excelFilePath}`);
            }

        }
    } catch (error) {
        console.error('Erreur lors du traitement:', error);
    }
}



function readJsonFile(filename) {
    const filePath = path.join(__dirname, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



function compareHotels(hotel1, hotel2) {
    if (hotel1.typeDeReservation !== hotel2.typeDeReservation) {
        return 0; // Hôtels non comparables si types de réservation différents
    }

    const reduction1 = parseFloat(hotel1.reduction);
    const reduction2 = parseFloat(hotel2.reduction);
    const prix1 = parseFloat(hotel1.prixTravel);
    const prix2 = parseFloat(hotel2.prixTravel);

    if (isNaN(reduction1) || isNaN(reduction2) || isNaN(prix1) || isNaN(prix2)) {
        return 0; // Valeurs non valides, considérer comme équivalents
    }

    if (reduction1 !== reduction2) {
        return reduction2 - reduction1; // Réduction plus élevée en premier
    }

    return prix1 - prix2; // Prix plus bas en premier si réductions égales
}

function removeDuplicates(newHotels, savedHotels) {
    const uniqueHotels = new Map();
    let addedCount = 0, updatedCount = 0;

    [...Object.values(savedHotels), ...Object.values(newHotels)]
        .filter(hotel => hotel.nomHotel)
        .forEach(hotel => {
            const key = `${hotel.nomHotel.toLowerCase()}_${hotel.typeDeReservation}`;
            if (!uniqueHotels.has(key) || compareHotels(hotel, uniqueHotels.get(key)) < 0) {
                uniqueHotels.set(key, hotel);
                uniqueHotels.has(key) ? updatedCount++ : addedCount++;
            }
        });

    const result = { 1: [], 2: [], 3: [] };

    Array.from(uniqueHotels.values()).forEach(hotel => {
        const type = hotel.typeDeReservation;
        if (result[type]) {
            result[type].push(hotel);
        }
    });

    // Fonction pour extraire le pourcentage de réduction
    const parseReduction = (reduction) => parseFloat(reduction.replace('%', '')) || 0;

    // Trier chaque tableau par réduction décroissante
    for (const type in result) {
        result[type].sort((a, b) => parseReduction(b.reduction) - parseReduction(a.reduction));
    }

    return result;
}

function filterHotels(hotels) {
    const prices = Object.values(hotels).map(hotel => parseFloat(hotel.prixTravel.replace(' €', '')));
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    console.log('moyenne de la page : ' + averagePrice);
    return Object.fromEntries(
        Object.entries(hotels).filter(([_, hotel]) => 
            parseFloat(hotel.prixTravel.replace(' €', '')) <= 2 * averagePrice
        )
    );
}



main().catch(console.error);