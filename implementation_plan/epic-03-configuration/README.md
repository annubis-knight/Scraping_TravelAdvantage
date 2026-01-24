# Epic 3 - Configuration & Environnement

> **Priorité:** 🟡 P2 - Moyenne
> **Statut:** TODO
> **Stories:** 3

## Description

Externaliser les paramètres hardcodés pour faciliter la maintenance et permettre différentes configurations selon l'environnement.

## Problèmes Identifiés

1. **Timeouts hardcodés** dans scrapeHotels.js (60s, 240s, 10s)
2. **Pas de fichier .env** pour les variables sensibles ou configurables
3. **Pas de distinction dev/prod** pour les logs, délais, etc.

## Stories

| Story | Titre | Complexité | Statut | Dépendances |
|-------|-------|------------|--------|-------------|
| [3.1](story-3.1-external-config.md) | Externaliser les paramètres | M | TODO | - |
| [3.2](story-3.2-env-file.md) | Support fichier .env | S | TODO | 3.1 |
| [3.3](story-3.3-dev-prod-mode.md) | Mode dev/prod | S | TODO | 3.1, 3.2 |

## Valeurs à Externaliser

```javascript
// Timeouts
PAGE_LOAD_TIMEOUT: 60000
SELECTOR_TIMEOUT: 240000
POST_SELECTOR_DELAY: 10000
BETWEEN_SCRAPES_DELAY: 1000

// Retry
MAX_RETRIES: 3
BASE_RETRY_DELAY: 2000
RATE_LIMIT_EXTRA_DELAY: 60000

// Puppeteer
HEADLESS: false
VIEWPORT_WIDTH: 1680
VIEWPORT_HEIGHT: 920
SCREENSHOT_QUALITY: 40

// Server
PORT: 3000
```
