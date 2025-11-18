const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeHotels(ville, pays, lati, longi, paysXX, fromDate, toDate, typeDeReservation) {
    let browser;
    const currentDateTime = getCurrentDateTime();
    
    try {
        browser = await puppeteer.launch({
            userDataDir: "./user_data",
            defaultViewport: { width: 1680, height: 920 },
            headless: "new",
            args: [
                '--window-position=-32000,-32000',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
            //   headless: false,
            //   args: [
            //       '--window-position=-0,-0', 
            //       '--no-sandbox',
            //       '--disable-setuid-sandbox'
            //     ]
        });

        const page = await browser.newPage();

        // Définir les paramètres de recherche
        const city = ville;
        const country = pays;
        const destination = `${city},%20${country}`;
        const searchType = 'city';
        const searchId = '';
        const latitude = lati;
        const longitude = longi;
        const placeId = '';
        const googlePlacesCity = city;
        const googlePlacesCountry = paysXX;
        const adults = 2;
        const children = 0;
        const rooms = 1;
        const roomAdults = 2;
        const roomChildren = 0;
        const lang = 'FR';

        const url = `https://www.traveladvantage.com/hotel/search/${destination}?search_type=${searchType}&search_id=${searchId}&lat=${latitude}&lon=${longitude}&place_id=${placeId}&google_places_city=${googlePlacesCity}&google_places_country=${googlePlacesCountry}&from_date=${fromDate}&to_date=${toDate}&adults=${adults}&children=${children}&rooms=${rooms}&room_adults[]=${roomAdults}&room_children[]=${roomChildren}&submit=Rechercher&lang=${lang}`;

        console.log(`🌐 URL visitée: ${url}`);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
        console.log(`✅ Page chargée, titre: "${await page.title()}"`);

        // ### Screenshot AVANT recherche du sélecteur pour debug ###
        const screenshotDir = path.join('saveData','images','screenshots',ville,`screenshots_${currentDateTime.slice(0, 10)}` // Format YYYY-MM-DD
        );
        fs.mkdirSync(screenshotDir, { recursive: true });
        await page.screenshot({
            path: path.join(screenshotDir, `${ville}_${fromDate}_${toDate}.jpeg`),
            quality: 40, // Qualité entre 0-100[1]
            fullPage: true,
            clip: {
                x: 0,
                y: 0,
                width: 1680,
                height: 1440
            }
        });
        console.log(`Screenshot de debug sauvegardée dans: ${screenshotDir}`);

        await waitForSelector(page, '.hotel_search_list .list_card');

        // Extraire les données de tous les éléments .list_card visibles
        const visibleItems = await extractAllHotelData(page);

        // console.log(`Éléments visibles pour ${ville} du ${fromDate} au ${toDate}:`, visibleItems);

        // Créer l'objet JSON
        const hotelsData = {};
        visibleItems.forEach((item, index) => {
            hotelsData[`item${index + 1}`] = {
                ...item,
                fromDate: fromDate,
                toDate: toDate,
                typeDeReservation: typeDeReservation,
                vuLe: currentDateTime
            };
        });

        // Convertir l'objet en chaîne JSON
        const jsonData = JSON.stringify(hotelsData, null, 4);

        // Écrire les données JSON dans un fichier
        const jsonFilePath = path.join(__dirname, `./json/hotels_data.json`);
        fs.writeFileSync(jsonFilePath, jsonData);

        // Créer le dossier 'images' s'il n'existe pas
        // const imagesDir = path.join(__dirname, `images/${ville}/${fromDate}_${toDate}`);
        // if (!fs.existsSync(imagesDir)){
        //     fs.mkdirSync(imagesDir);
        // }

        // Enregistrer les images pour tous les éléments visibles
        // for (let i = 0; i < visibleItems.length; i++) {
        //     const item = visibleItems[i];
        //     if (item.imageUrl) {
        //         const fileName = `hotel_image_${i + 1}.png`;
        //         const filePath = path.join(imagesDir, fileName);
        //         await saveImage(page, item.imageUrl, filePath);
        //         console.log(`Image enregistrée : ${fileName}`);
        //     }
        // }

        return hotelsData; // Retourner les données des hôtels

    } catch (error) {
        console.error(`Une erreur est survenue pour ${ville} du ${fromDate} au ${toDate}:`, error);
        throw error; // Propager l'erreur pour la gestion dans main.js
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function waitForSelector(page, selector, timeout = 60000) {
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

            const getStars = () => {
                const starRating = item.querySelector('.list_details .star_rating');
                if (starRating) {
                    for (let i = 5; i >= 0; i--) {
                        if (starRating.classList.contains(`star_${i}`)) {
                            return i;
                        }
                    }
                }
                return 'Non spécifié';
            };

            return {
                nomHotel: getData('h4.not-select', 'Nom non disponible'),
                location: getData('p span.w-auto', 'Emplacement non disponible'),
                etoiles: getStars(),
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

function formatDate(date) {
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

function getCurrentDateTime() {
    const now = new Date();
    const date = formatDate(now);
    const time = now.toTimeString().split(' ')[0].slice(0, 5); // Format HH:mm
    return `${date} ${time}`;
}

// Exporter la fonction scrapeHotels pour l'utiliser dans main.js
module.exports = { scrapeHotels };

scrapeHotels('Londres', 'Royaume-Uni', '51.5073','-0.1276','GB','2025-01-15','2025-01-17', 1);

