const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "./user_data",
        headless: false
    });


    const page = await browser.newPage();
    await page.setViewport({ width: 1680, height: 920 });


    // Définir les paramètres de recherche
    const city = 'Monaco';
    const country = 'Monaco';
    const destination = `${city},%20${country}`; // Concaténer la ville et le pays avec '%20' pour l'espace
    const searchType = 'city';
    const searchId = '';
    const latitude = '48.8566';
    const longitude = '2.3522';
    const placeId = 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ';
    const googlePlacesCity = 'Paris';
    const googlePlacesCountry = 'FR';
    const fromDate = '2025-07-22';
    const toDate = '2025-07-26';
    const adults = 2;
    const children = 0;
    const rooms = 1;
    const roomAdults = 2; // Nombre d'adultes pour une chambre
    const roomChildren = 0; // Nombre d'enfants pour une chambre
    const lang = 'FR';

    const url = `https://www.traveladvantage.com/hotel/search/${destination}?search_type=${searchType}&search_id=${searchId}&lat=${latitude}&lon=${longitude}&place_id=${placeId}&google_places_city=${googlePlacesCity}&google_places_country=${googlePlacesCountry}&from_date=${fromDate}&to_date=${toDate}&adults=${adults}&children=${children}&rooms=${rooms}&room_adults[]=${roomAdults}&room_children[]=${roomChildren}&submit=Rechercher&lang=${lang}`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

    await page.waitForSelector('.hotel_search_list .list_card');

    await page.screenshot({ path: `ss.png` });


    // Extraire les données du premier élément .list_card visible
    const firstVisibleItem = await page.evaluate(() => {
        const items = document.querySelectorAll('.hotel_search_list .list_card');
        const visibleItems = Array.from(items).filter(item => {
            return getComputedStyle(item).display !== 'none';
        });

        if (visibleItems.length === 0) {
            return null; // Aucun élément visible trouvé
        }


        const item = visibleItems[0]; // Prendre le premier élément visible
        const nomHotel = item.querySelector('h4.not-select') ? item.querySelector('h4.not-select').innerText : 'Nom non disponible';
        const location = item.querySelector('p span.w-auto') ? item.querySelector('p span.w-auto').innerText : 'Emplacement non disponible';
        const note = item.querySelector('.score span') ? item.querySelector('.score span').innerText : 'Note non disponible';
        const reduction = item.querySelector('.saving_per span') ? item.querySelector('.saving_per span').innerText : 'Économies non disponibles';
        const prixTravel = item.querySelector('.list_price .price_pay li:last-child span') ? item.querySelector('.list_price .price_pay li:last-child span').innerText : 'Prix non disponible';
        const prixConcurrents = item.querySelector('.price_detail li:first-child span') ? item.querySelector('.price_detail li:first-child span').innerText : 'Prix normal non disponible';
        const economiesMembres = item.querySelector('.price_detail li:nth-child(2) span') ? item.querySelector('.price_detail li:nth-child(2) span').innerText : 'Économies membres non disponibles';
        const imageUrl = item.querySelector('.list_img img') ? item.querySelector('.list_img img').src : null;

        return {
            nomHotel,
            location,
            note,
            reduction,
            prixTravel,
            prixConcurrents,
            economiesMembres,
            imageUrl
        };
    });

    console.log('Premier élément visible:', firstVisibleItem);

    // Enregistrer l'image si l'URL est disponible
    if (firstVisibleItem && firstVisibleItem.imageUrl) {
        const viewSource = await page.goto(firstVisibleItem.imageUrl);
        const buffer = await viewSource.buffer();
        fs.writeFileSync(path.join(__dirname, 'test.png'), buffer);
        console.log('Image enregistrée sous le nom de test.png');
    }

    await browser.close();
})();