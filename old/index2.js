const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeHotels(ville, fromDate, toDate, typeDeReservation) {
    let browser;
    try {
        browser = await puppeteer.launch({
            userDataDir: "./user_data",
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            defaultViewport: { width: 1680, height: 920 }
        });

        const page = await browser.newPage();

        // Définir les paramètres de recherche
        const city = ville;
        const country = 'Monaco'; // Valeur en dur, à modifier si nécessaire
        const destination = `${city},%20${country}`;
        const searchType = 'city';
        const searchId = '';
        const latitude = '43.7384';
        const longitude = '7.4246';
        const placeId = 'ChIJMYU_e2_CzRIRVQmHbFYpAAS';
        const googlePlacesCity = city;
        const googlePlacesCountry = 'MC';
        const adults = 2;
        const children = 0;
        const rooms = 1;
        const roomAdults = 2;
        const roomChildren = 0;
        const lang = 'FR';

        const url = `https://www.traveladvantage.com/hotel/search/${destination}?search_type=${searchType}&search_id=${searchId}&lat=${latitude}&lon=${longitude}&place_id=${placeId}&google_places_city=${googlePlacesCity}&google_places_country=${googlePlacesCountry}&from_date=${fromDate}&to_date=${toDate}&adults=${adults}&children=${children}&rooms=${rooms}&room_adults[]=${roomAdults}&room_children[]=${roomChildren}&submit=Rechercher&lang=${lang}`;
        
        await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

        await waitForSelector(page, '.hotel_search_list .list_card');

        await page.screenshot({ path: `screenshot.png` });

        // Extraire les données de tous les éléments .list_card visibles
        const visibleItems = await extractAllHotelData(page);

        console.log('Éléments visibles:', visibleItems);

        // Créer l'objet JSON
        const hotelsData = {};
        visibleItems.forEach((item, index) => {
            hotelsData[`item${index + 1}`] = {
                ...item,
                typeDeReservation: typeDeReservation
            };
        });

        // Convertir l'objet en chaîne JSON
        const jsonData = JSON.stringify(hotelsData, null, 4);

        // Écrire les données JSON dans un fichier
        const jsonFilePath = path.join(__dirname, 'hotels_data.json');
        fs.writeFileSync(jsonFilePath, jsonData);
        console.log(`Données JSON enregistrées dans ${jsonFilePath}`);

        // Créer le dossier 'images' s'il n'existe pas
        const imagesDir = path.join(__dirname, 'images');
        if (!fs.existsSync(imagesDir)){
            fs.mkdirSync(imagesDir);
        }

        // Enregistrer les images pour tous les éléments visibles
        for (let i = 0; i < visibleItems.length; i++) {
            const item = visibleItems[i];
            if (item.imageUrl) {
                const fileName = `hotel_image_${i + 1}.png`;
                const filePath = path.join(imagesDir, fileName);
                await saveImage(page, item.imageUrl, filePath);
                console.log(`Image enregistrée : ${fileName}`);
            }
        }

    } catch (error) {
        console.error('Une erreur est survenue :', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function waitForSelector(page, selector, timeout = 30000) {
    try {
        await page.waitForSelector(selector, { timeout });
    } catch (error) {
        console.warn(`Le sélecteur "${selector}" n'a pas été trouvé dans le délai imparti.`);
    }
}

async function extractAllHotelData(page) {
    return await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.hotel_search_list .list_card'));
        return items.filter(item => getComputedStyle(item).display !== 'none').map(item => {
            const getData = (selector, defaultValue) => 
                item.querySelector(selector)?.innerText || defaultValue;

            return {
                nomHotel: getData('h4.not-select', 'Nom non disponible'),
                location: getData('p span.w-auto', 'Emplacement non disponible'),
                note: getData('.score span', 'Note non disponible'),
                reduction: getData('.saving_per span', 'Économies non disponibles'),
                prixTravel: getData('.list_price .price_pay li:last-child span', 'Prix non disponible'),
                prixConcurrents: getData('.price_detail li:first-child span', 'Prix normal non disponible'),
                economiesMembres: getData('.price_detail li:nth-child(2) span', 'Économies membres non disponibles'),
                imageUrl: item.querySelector('.list_img img')?.src || null
            };
        });
    });
}

async function saveImage(page, imageUrl, filePath) {
    const viewSource = await page.goto(imageUrl);
    const buffer = await viewSource.buffer();
    fs.writeFileSync(filePath, buffer);
}

// Appel de la fonction avec des valeurs en dur
scrapeHotels('Monaco', '2025-07-22', '2025-07-26', 1);