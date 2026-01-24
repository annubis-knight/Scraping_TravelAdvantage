# Story 3.3 - Mode Dev/Prod

> **Epic:** [3 - Configuration](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** S (1-2h)
> **Statut:** TODO
> **Dépendances:** [Story 3.1](story-3.1-external-config.md), [Story 3.2](story-3.2-env-file.md)

---

## Contexte

En développement, on veut des logs verbeux, des délais courts, le mode non-headless. En production, on veut l'inverse.

## Solution Proposée

### Variable NODE_ENV

```env
# .env
NODE_ENV=development  # ou production
```

### Config par environnement

```javascript
// src/scraping/config.js
require('dotenv').config();

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
    isDev,
    timeouts: {
        pageLoad: isDev ? 30000 : 60000,
        selector: isDev ? 120000 : 240000,
        betweenScrapes: isDev ? 500 : 1000
    },
    puppeteer: {
        headless: isDev ? false : true,
        // ...
    },
    logging: {
        verbose: isDev,
        saveToFile: !isDev
    }
};
```

### Scripts npm

```json
{
  "scripts": {
    "2:scrape": "cross-env NODE_ENV=production node src/scraping/index.js",
    "2:scrape-dev": "cross-env NODE_ENV=development node src/scraping/index.js"
  }
}
```

---

## Fichiers à Modifier

| Fichier | Modification |
|---------|--------------|
| `src/scraping/config.js` | Ajouter logique isDev |
| `package.json` | Ajouter scripts dev/prod |
| `.env.example` | Ajouter NODE_ENV |

---

## Critères d'Acceptation

- [ ] `npm run 2:scrape` = mode production
- [ ] `npm run 2:scrape-dev` = mode développement
- [ ] Logs plus verbeux en dev
- [ ] Délais réduits en dev pour tests rapides

---

## Liens

- [Epic 3 - Configuration](README.md)
- [INDEX](../INDEX.md)
