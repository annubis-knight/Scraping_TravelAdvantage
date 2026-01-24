# Story 4.1 - Logging Fichier avec Rotation

> **Epic:** [4 - Logging & Monitoring](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** M (2-4h)
> **Statut:** TODO

---

## Contexte

Les logs sont uniquement envoyés à la console. Après fermeture du terminal, tout l'historique est perdu.

## Solution Proposée

### Option A - Winston (Recommandé)

```bash
npm install winston winston-daily-rotate-file
```

```javascript
// src/scraping/logger.js
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) =>
            `${timestamp} [${level.toUpperCase()}] ${message}`
        )
    ),
    transports: [
        // Console (coloré)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Fichier rotatif par jour
        new winston.transports.DailyRotateFile({
            dirname: logDir,
            filename: 'scraping-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',  // Garder 14 jours
            maxSize: '20m'    // Max 20MB par fichier
        }),
        // Fichier erreurs séparé
        new winston.transports.DailyRotateFile({
            dirname: logDir,
            filename: 'errors-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '30d'
        })
    ]
});

module.exports = logger;
```

### Utilisation

```javascript
// Remplacer console.log par logger
const logger = require('./logger');

// Avant
console.log(`Scraping ${ville}...`);
console.error(`Erreur: ${error.message}`);

// Après
logger.info(`Scraping ${ville}...`);
logger.error(`Erreur: ${error.message}`);
```

### Option B - Solution légère (sans dépendance)

```javascript
// src/scraping/logger.js
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function getLogFile() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(logDir, `scraping-${date}.log`);
}

function log(level, message) {
    const timestamp = new Date().toISOString();
    const line = `${timestamp} [${level}] ${message}\n`;

    // Console
    console.log(line.trim());

    // Fichier
    fs.appendFileSync(getLogFile(), line);
}

module.exports = {
    info: (msg) => log('INFO', msg),
    warn: (msg) => log('WARN', msg),
    error: (msg) => log('ERROR', msg),
    debug: (msg) => log('DEBUG', msg)
};
```

---

## Fichiers à Créer/Modifier

| Fichier | Action |
|---------|--------|
| `src/scraping/logger.js` | Créer |
| `logs/` | Créer (dossier) |
| `logs/.gitkeep` | Créer |
| `.gitignore` | Ajouter `logs/*.log` |
| `src/scraping/index.js` | Remplacer console.log |
| `src/scraping/scrapeHotels.js` | Remplacer console.log |

---

## Critères d'Acceptation

- [ ] Dossier `logs/` créé automatiquement
- [ ] Fichier log créé avec date du jour
- [ ] Logs apparaissent en console ET dans fichier
- [ ] Rotation automatique (nouveau fichier chaque jour)
- [ ] Fichier d'erreurs séparé
- [ ] Anciens logs supprimés après 14 jours

---

## Format de Log

```
2026-01-24 10:30:45 [INFO] Démarrage scraping - 52 villes, 12 dates
2026-01-24 10:30:46 [INFO] [Paris] Début scraping 2026-02-07 → 2026-02-09
2026-01-24 10:31:15 [INFO] [Paris] ✓ 25 hôtels extraits
2026-01-24 10:31:16 [WARN] [Londres] Retry 1/3 - Timeout
2026-01-24 10:31:25 [ERROR] [Madrid] ✗ Échec définitif - Rate limited
```

---

## Liens

- [Epic 4 - Logging & Monitoring](README.md)
- [INDEX](../INDEX.md)
