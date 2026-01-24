# Story 2.4 - Rotation des User-Agents

> **Epic:** [2 - Robustesse Scraping](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** S (1-2h)
> **Statut:** TODO

---

## Contexte

TravelAdvantage peut détecter et bloquer les requêtes automatisées en analysant le User-Agent. Actuellement, Puppeteer utilise le User-Agent par défaut de Chrome headless, facilement identifiable.

## Problème

```javascript
// Actuellement dans scrapeHotels.js
const browser = await puppeteer.launch({
    // Pas de configuration User-Agent
    // Utilise le UA par défaut: "HeadlessChrome/..."
});
```

### Impact

- Risque de blocage par TravelAdvantage (détection bot)
- Tous les scrapes utilisent le même fingerprint
- Facilement identifiable comme automatisation

## Solution Proposée

Implémenter une rotation de User-Agents réalistes pour chaque session de scraping.

### Liste de User-Agents

```javascript
// src/scraping/userAgents.js

const USER_AGENTS = [
    // Chrome Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    // Chrome Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    // Firefox Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',

    // Firefox Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',

    // Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',

    // Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

/**
 * Retourne un User-Agent aléatoire
 */
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Retourne un User-Agent de manière round-robin (plus prévisible pour debug)
 */
let currentIndex = 0;
function getNextUserAgent() {
    const ua = USER_AGENTS[currentIndex];
    currentIndex = (currentIndex + 1) % USER_AGENTS.length;
    return ua;
}

module.exports = { USER_AGENTS, getRandomUserAgent, getNextUserAgent };
```

### Modification de scrapeHotels.js

```javascript
// Avant
const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, "user_data"),
    headless: false,
    args: ['--no-first-run', '--disable-extensions']
});

// Après
const { getRandomUserAgent } = require('./userAgents');

const userAgent = getRandomUserAgent();
console.log(`[SCRAPE] User-Agent: ${userAgent.substring(0, 50)}...`);

const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, "user_data"),
    headless: false,
    args: [
        '--no-first-run',
        '--disable-extensions',
        `--user-agent=${userAgent}`
    ]
});

// Alternative: configurer au niveau de la page
const page = await browser.newPage();
await page.setUserAgent(userAgent);
```

---

## Fichiers à Modifier

| Fichier | Modification | Type |
|---------|--------------|------|
| `src/scraping/userAgents.js` | Créer le fichier avec la liste des UA | Nouveau |
| `src/scraping/scrapeHotels.js` | Ajouter rotation UA au lancement | Modifier |

---

## Critères d'Acceptation

- [ ] Fichier `userAgents.js` créé avec au moins 5 User-Agents différents
- [ ] Chaque session de scraping utilise un User-Agent aléatoire
- [ ] Le User-Agent utilisé est loggé (version tronquée pour lisibilité)
- [ ] Les User-Agents sont récents (versions Chrome/Firefox 2024-2025)
- [ ] Option de mode round-robin disponible pour debug

---

## Tests Manuels

1. **Vérifier la rotation:**
   ```bash
   # Lancer plusieurs scrapes et vérifier les logs
   npm run 2:scrape-test
   # Observer les différents User-Agents dans les logs
   ```

2. **Vérifier côté serveur:**
   - Ouvrir les DevTools sur la page scrapée
   - Onglet Network → Headers → User-Agent
   - Vérifier qu'il correspond au log

---

## Améliorations Futures

- Ajouter des headers supplémentaires (Accept-Language, etc.)
- Implémenter un système de "fingerprint" complet
- Tracker quel UA a le meilleur taux de succès

---

## Liens

- [Epic 2 - Robustesse Scraping](README.md)
- [Story 2.2 - Rate Limiting](story-2.2-rate-limiting.md)
- [INDEX](../INDEX.md)
