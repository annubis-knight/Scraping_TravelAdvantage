# Story 3.1 - Externaliser les Paramètres

> **Epic:** [3 - Configuration](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** M (2-4h)
> **Statut:** TODO

---

## Contexte

Les paramètres de scraping sont actuellement hardcodés à plusieurs endroits dans le code, rendant les ajustements difficiles sans modifier le source.

## Problème

```javascript
// scrapeHotels.js - valeurs en dur
await page.goto(url, { timeout: 60000 });  // ligne ~45
await page.waitForSelector('.list_card', { timeout: 240000 });  // ligne ~70
await delay(10000);  // ligne ~75
```

## Solution Proposée

Créer un fichier `config.js` centralisé :

```javascript
// src/scraping/config.js
module.exports = {
    timeouts: {
        pageLoad: 60000,
        selector: 240000,
        postSelector: 10000,
        betweenScrapes: 1000
    },
    retry: {
        maxAttempts: 3,
        baseDelay: 2000,
        rateLimitExtraDelay: 60000
    },
    puppeteer: {
        headless: false,
        viewport: { width: 1680, height: 920 },
        screenshotQuality: 40,
        userDataDir: './user_data'
    },
    paths: {
        datasVilles: './saveData/datasVilles',
        screenshots: './saveData/images/screenshots',
        json: './json'
    }
};
```

### Utilisation

```javascript
// scrapeHotels.js
const config = require('./config');

await page.goto(url, { timeout: config.timeouts.pageLoad });
await page.waitForSelector('.list_card', { timeout: config.timeouts.selector });
```

---

## Fichiers à Créer/Modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/scraping/config.js` | Créer | Configuration centralisée |
| `src/scraping/scrapeHotels.js` | Modifier | Utiliser config |
| `src/scraping/index.js` | Modifier | Utiliser config |

---

## Critères d'Acceptation

- [ ] Fichier config.js créé avec toutes les valeurs
- [ ] scrapeHotels.js utilise config.timeouts
- [ ] index.js utilise config.retry et config.paths
- [ ] Modification d'une valeur dans config.js appliquée partout
- [ ] Aucune régression fonctionnelle

---

## Liens

- [Epic 3 - Configuration](README.md)
- [Story 3.2 - Fichier .env](story-3.2-env-file.md)
- [INDEX](../INDEX.md)
