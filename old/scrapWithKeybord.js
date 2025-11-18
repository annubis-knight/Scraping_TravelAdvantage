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

    const url = `https://www.traveladvantage.com`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

    const iframeElement = await page.waitForSelector('iframe'); 
    const iframe = await iframeElement.contentFrame();
    await iframe.waitForSelector('span#recaptcha-anchor');
    await iframe.click('span#recaptcha-anchor');


    // Tapez "Londres" dans le champ de destination
      await page.type('#hotel_destination', 'Londres', { delay: 100 });

    // Utiliser les touches fléchées pour naviguer dans la liste
      await page.keyboard.press('ArrowDown'); 
      await page.keyboard.press('Enter'); 

});
