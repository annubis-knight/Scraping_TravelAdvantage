# Story 3.2 - Support Fichier .env

> **Epic:** [3 - Configuration](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** S (1-2h)
> **Statut:** TODO
> **Dépendances:** [Story 3.1](story-3.1-external-config.md)

---

## Contexte

Certaines valeurs de configuration peuvent varier selon la machine ou l'environnement (clés API, ports, chemins absolus).

## Solution Proposée

### 1. Installer dotenv

```bash
npm install dotenv
```

### 2. Créer .env.example

```env
# .env.example - À copier en .env

# Server
PORT=3000

# Scraping timeouts (ms)
TIMEOUT_PAGE_LOAD=60000
TIMEOUT_SELECTOR=240000
TIMEOUT_POST_SELECTOR=10000
DELAY_BETWEEN_SCRAPES=1000

# Retry
MAX_RETRIES=3

# Puppeteer
HEADLESS=false
SCREENSHOT_QUALITY=40

# API Keys (si besoin)
# NINJA_API_KEY=your_key_here
```

### 3. Modifier config.js

```javascript
// src/scraping/config.js
require('dotenv').config();

module.exports = {
    timeouts: {
        pageLoad: parseInt(process.env.TIMEOUT_PAGE_LOAD) || 60000,
        selector: parseInt(process.env.TIMEOUT_SELECTOR) || 240000,
        // ...
    },
    // ...
};
```

### 4. Ajouter .env au .gitignore

```gitignore
# .gitignore
.env
.env.local
```

---

## Fichiers à Créer/Modifier

| Fichier | Action |
|---------|--------|
| `.env.example` | Créer |
| `.env` | Créer (local, non versionné) |
| `.gitignore` | Modifier |
| `src/scraping/config.js` | Modifier |
| `package.json` | Ajouter dotenv |

---

## Critères d'Acceptation

- [ ] Package dotenv installé
- [ ] .env.example documenté avec toutes les variables
- [ ] .env ajouté au .gitignore
- [ ] config.js lit les variables d'environnement
- [ ] Valeurs par défaut si .env absent

---

## Liens

- [Epic 3 - Configuration](README.md)
- [Story 3.1 - Config externe](story-3.1-external-config.md)
- [INDEX](../INDEX.md)
