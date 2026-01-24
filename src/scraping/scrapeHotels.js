const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeHotels(ville, pays, lati, longi, paysXX, fromDate, toDate, typeDeReservation) {
    let browser;
    const currentDateTime = getCurrentDateTime();
    
    try {
        browser = await puppeteer.launch({
            userDataDir: path.join(__dirname, "user_data"),
            defaultViewport: { width: 1680, height: 920 },
            headless: false,
            args: [
                '--window-position=0,0',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--disable-extensions',
                '--disable-default-apps'
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
        console.log(`⏳ Chargement de la page (timeout: 60s)...`);
        const gotoStart = Date.now();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        const gotoElapsed = ((Date.now() - gotoStart) / 1000).toFixed(1);
        console.log(`✅ Page chargée en ${gotoElapsed}s, titre: "${await page.title()}"`);

        // ### Screenshot AVANT recherche du sélecteur pour debug ###
        const screenshotDir = path.join(__dirname, 'saveData','images','screenshots',ville,`screenshots_${currentDateTime.slice(0, 10)}` // Format YYYY-MM-DD
        );
        fs.mkdirSync(screenshotDir, { recursive: true });
        await page.screenshot({
            path: path.join(screenshotDir, `${ville}_${fromDate}_${toDate}.jpeg`),
            quality: 40, // Qualité entre 0-100
            fullPage: true
        });
        console.log(`Screenshot de debug sauvegardée dans: ${screenshotDir}`);

        console.log(`⏳ Attente des résultats d'hôtels (timeout: 240s)...`);
        await waitForSelector(page, '.hotel_search_list .list_card');

        // Attendre que les données se chargent complètement
        console.log(`⏳ Attente de 10s pour le chargement des données...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log(`✅ Délai terminé, extraction des données...`);

        // Extraire les données de tous les éléments .list_card visibles
        const visibleItems = await extractAllHotelData(page);

        // Afficher les données récupérées de manière structurée
        logHotelData(visibleItems, ville, fromDate, toDate);

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

async function waitForSelector(page, selector, timeout = 240000) {
    const startTime = Date.now();
    try {
        await page.waitForSelector(selector, { timeout });
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Sélecteur trouvé en ${elapsed}s`);
    } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.warn(`⚠️ Timeout après ${elapsed}s - Sélecteur "${selector}" non trouvé`);
    }
}

async function extractAllHotelData(page) {
    const result = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.hotel_search_list .list_card'));
        const visibleItems = items.filter(item => getComputedStyle(item).display !== 'none');

        const selectorsConfig = {
            nomHotel: { selector: 'h4.not-select', default: 'Nom non disponible' },
            location: { selector: 'p span.w-auto', default: 'Emplacement non disponible' },
            note: { selector: '.score span', default: 'Note non disponible' },
            reduction: { selector: '.saving_per span', default: 'Économies non disponibles' },
            prixTravel: { selector: '.list_price .price_pay li:last-child span', default: 'Prix non disponible' },
            prixConcurrents: { selector: '.price_detail li:first-child span', default: 'Prix normal non disponible' },
            economiesMembres: { selector: '.price_detail li:nth-child(2) span', default: 'Économies membres non disponibles' }
        };

        const hotels = [];
        const missingSelectors = [];

        visibleItems.forEach((item, index) => {
            const hotelData = {};

            // Extraire chaque champ avec tracking des sélecteurs manquants
            for (const [field, config] of Object.entries(selectorsConfig)) {
                const element = item.querySelector(config.selector);
                if (element) {
                    hotelData[field] = element.innerText;
                } else {
                    hotelData[field] = config.default;
                    missingSelectors.push({ hotel: index + 1, field, selector: config.selector });
                }
            }

            // Étoiles (logique spéciale)
            const starRating = item.querySelector('.list_details .star_rating');
            if (starRating) {
                let stars = 'Non spécifié';
                for (let i = 5; i >= 0; i--) {
                    if (starRating.classList.contains(`star_${i}`)) {
                        stars = i;
                        break;
                    }
                }
                hotelData.etoiles = stars;
            } else {
                hotelData.etoiles = 'Non spécifié';
                missingSelectors.push({ hotel: index + 1, field: 'etoiles', selector: '.list_details .star_rating' });
            }

            // Image URL
            const imgElement = item.querySelector('.list_img img');
            hotelData.imageUrl = imgElement?.src || null;
            if (!imgElement) {
                missingSelectors.push({ hotel: index + 1, field: 'imageUrl', selector: '.list_img img' });
            }

            hotels.push(hotelData);
        });

        return { hotels, missingSelectors, totalCards: visibleItems.length };
    });

    // Afficher les informations de débogage
    console.log(`📊 ${result.totalCards} cartes d'hôtels trouvées`);

    if (result.missingSelectors.length > 0) {
        console.warn(`⚠️ ${result.missingSelectors.length} sélecteurs manquants:`);
        result.missingSelectors.forEach(m => {
            console.warn(`   Hôtel #${m.hotel} - ${m.field}: "${m.selector}" non trouvé`);
        });
    } else {
        console.log(`✅ Tous les sélecteurs ont été trouvés`);
    }

    return result.hotels;
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

function logHotelData(hotels, ville, fromDate, toDate) {
    // Couleurs ANSI
    const colors = {
        reset: '\x1b[0m',
        cyan: '\x1b[36m',
        yellow: '\x1b[33m',
        green: '\x1b[32m',
        magenta: '\x1b[35m',
        white: '\x1b[37m',
        dim: '\x1b[2m',
        bright: '\x1b[1m'
    };

    const c = colors;

    console.log(`\n${c.cyan}${c.bright}╔════════════════════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.cyan}${c.bright}║${c.reset}  ${c.yellow}📍 ${ville}${c.reset} ${c.dim}│${c.reset} ${c.white}${fromDate} → ${toDate}${c.reset}`);
    console.log(`${c.cyan}${c.bright}╠════════════════════════════════════════════════════════════════╣${c.reset}`);

    if (hotels.length === 0) {
        console.log(`${c.cyan}║${c.reset}  ${c.yellow}⚠️ Aucun hôtel récupéré${c.reset}`);
    } else {
        hotels.forEach((hotel, index) => {
            console.log(`${c.cyan}║${c.reset} ${c.magenta}${c.bright}#${index + 1}${c.reset} ${c.green}${hotel.nomHotel}${c.reset}`);
            console.log(`${c.cyan}║${c.reset}    ${c.dim}📍 Location:${c.reset} ${hotel.location}`);
            console.log(`${c.cyan}║${c.reset}    ${c.dim}⭐ Étoiles:${c.reset} ${hotel.etoiles} ${c.dim}│${c.reset} ${c.dim}📊 Note:${c.reset} ${hotel.note}`);
            console.log(`${c.cyan}║${c.reset}    ${c.dim}💰 Prix Travel:${c.reset} ${c.green}${hotel.prixTravel}${c.reset} ${c.dim}│${c.reset} ${c.dim}Prix Concurrent:${c.reset} ${hotel.prixConcurrents}`);
            console.log(`${c.cyan}║${c.reset}    ${c.dim}🏷️ Réduction:${c.reset} ${c.yellow}${hotel.reduction}${c.reset} ${c.dim}│${c.reset} ${c.dim}Économies:${c.reset} ${hotel.economiesMembres}`);
            if (index < hotels.length - 1) {
                console.log(`${c.cyan}║${c.reset}    ${c.dim}────────────────────────────────────────${c.reset}`);
            }
        });
    }

    console.log(`${c.cyan}${c.bright}╚════════════════════════════════════════════════════════════════╝${c.reset}\n`);
}

// Exporter la fonction scrapeHotels pour l'utiliser dans main.js
module.exports = { scrapeHotels };

// Test standalone (décommenter pour tester)
// scrapeHotels('Londres', 'Royaume-Uni', '51.5073','-0.1276','GB','2025-01-15','2025-01-17', 1);

