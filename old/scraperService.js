const puppeteer = require('puppeteer');

async function scrapeGoogleSearch(hotelName, city) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Construire la requête de recherche
        const searchQuery = `${hotelName} ${city}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        
        // Naviguer vers Google
        await page.goto(`https://www.google.com/search?q=${encodedQuery}`);
        
        // Attendre que les résultats de recherche soient chargés
        await page.waitForSelector('.g');
        
        // Extraire les résultats de recherche
        const searchResults = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('.g').forEach((result) => {
                const titleElement = result.querySelector('h3');
                const linkElement = result.querySelector('a');
                const snippetElement = result.querySelector('.VwiC3b');
                
                if (titleElement && linkElement && snippetElement) {
                    results.push({
                        title: titleElement.innerText,
                        link: linkElement.href,
                        snippet: snippetElement.innerText
                    });
                }
            });
            return results.slice(0, 5); // Retourner les 5 premiers résultats
        });
        
        // Fermer le navigateur
        await browser.close();
        
        // Retourner les résultats de recherche
        return searchResults;
    } catch (error) {
        console.error('Erreur lors du scraping:', error);
        await browser.close();
        throw error;
    }
}

module.exports = { scrapeGoogleSearch };