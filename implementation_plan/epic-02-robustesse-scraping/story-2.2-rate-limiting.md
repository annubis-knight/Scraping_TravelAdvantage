# Story 2.2 - Détection et Gestion Rate Limiting

> **Epic:** [2 - Robustesse Scraping](README.md)
> **Priorité:** 🟠 P1
> **Complexité:** M (2-4h)
> **Statut:** TODO
> **Dépendances:** [Story 2.1](story-2.1-retry-logic.md)

---

## Contexte

Les sites web comme TravelAdvantage.com peuvent détecter le scraping et bloquer les requêtes via des codes HTTP 429 (Too Many Requests) ou 403 (Forbidden). Sans gestion de ces cas, le scraping continue de tenter en vain.

## Problème

Actuellement, aucune détection ni gestion du rate limiting :

```javascript
// scrapeHotels.js - page.goto() sans interception des réponses HTTP
await page.goto(url, { timeout: 60000 });
// Si 429 ou 403, la page charge mais pas de données
// Le sélecteur timeout après 240s sans savoir pourquoi
```

### Symptômes

- Timeout à répétition sur plusieurs villes consécutives
- Page qui charge mais sans résultats
- Possibles messages d'erreur sur la page (captcha, blocage)

## Solution Proposée

### Partie 1: Interception des réponses HTTP

```javascript
// Dans scrapeHotels.js, après création de la page

// Intercepter les réponses pour détecter rate limiting
let isRateLimited = false;
let httpStatus = 200;

page.on('response', response => {
    const status = response.status();
    const url = response.url();

    // Vérifier la réponse principale
    if (url.includes('traveladvantage.com/hotel/search')) {
        httpStatus = status;

        if (status === 429) {
            console.log('[RATE] HTTP 429 - Too Many Requests détecté');
            isRateLimited = true;
        } else if (status === 403) {
            console.log('[RATE] HTTP 403 - Forbidden détecté');
            isRateLimited = true;
        }
    }
});
```

### Partie 2: Vérification avant extraction

```javascript
// Après page.goto(), vérifier le status
await page.goto(url, { timeout: 60000 });

if (isRateLimited) {
    const error = new Error(`Rate limited: HTTP ${httpStatus}`);
    error.isRateLimited = true;
    throw error;
}

// Vérifier aussi le contenu de la page pour captcha/blocage
const pageContent = await page.content();
if (pageContent.includes('captcha') ||
    pageContent.includes('blocked') ||
    pageContent.includes('too many requests')) {
    const error = new Error('Rate limited: Page content indicates blocking');
    error.isRateLimited = true;
    throw error;
}
```

### Partie 3: Gestion dans scrapeWithRetry (Story 2.1)

Modifier `classifyError()` pour mieux gérer le rate limiting :

```javascript
function classifyError(error) {
    // ... code existant ...

    // Détection explicite rate limiting
    if (error.isRateLimited ||
        message.includes('429') ||
        message.includes('403') ||
        message.includes('rate limit') ||
        message.includes('too many requests')) {
        return {
            type: ErrorType.RATE_LIMITED,
            retryable: true,
            extraDelay: 60000,  // 60 secondes de pause
            pauseAllScraping: true  // Pause globale recommandée
        };
    }

    // ... reste du code ...
}
```

### Partie 4: Pause globale si rate limit détecté

```javascript
// Dans index.js, variable globale
let globalRateLimitPause = false;

// Dans la boucle de scraping
if (globalRateLimitPause) {
    console.log('[RATE] Pause globale active, attente 2 minutes...');
    await delay(120000);
    globalRateLimitPause = false;
}

try {
    await scrapeWithRetry(scrapeParams);
} catch (error) {
    if (error.isRateLimited) {
        globalRateLimitPause = true;
        console.log('[RATE] Rate limiting détecté, activation pause globale');
    }
}
```

---

## Fichiers à Modifier

| Fichier | Modification | Lignes |
|---------|--------------|--------|
| `src/scraping/scrapeHotels.js` | Ajouter interception réponses HTTP | Après `newPage()` |
| `src/scraping/scrapeHotels.js` | Vérifier contenu page (captcha) | Après `goto()` |
| `src/scraping/index.js` | Améliorer `classifyError()` | Dans fonction |
| `src/scraping/index.js` | Ajouter gestion pause globale | Boucle scraping |

---

## Critères d'Acceptation

- [ ] HTTP 429 est détecté et loggé clairement
- [ ] HTTP 403 est détecté et loggé clairement
- [ ] Le scraping attend 60s minimum après détection rate limit
- [ ] Une pause globale est activée pour protéger les requêtes suivantes
- [ ] Les pages avec captcha/blocage sont détectées
- [ ] Le retry reprend après la pause
- [ ] Log clair du nombre de rate limits rencontrés en fin de run

---

## Tests Manuels

1. **Test détection 429:**
   ```javascript
   // Difficile à reproduire naturellement
   // Option: utiliser un proxy/mock qui retourne 429
   // Ou tester en réduisant fortement le délai entre requêtes
   ```

2. **Test détection contenu page:**
   ```javascript
   // Injecter temporairement une vérification:
   // if (pageContent.includes('test_block')) throw ...
   // Vérifier que l'erreur est bien classifiée
   ```

3. **Test pause globale:**
   ```javascript
   // Simuler une erreur rate limited sur la ville 1
   // Vérifier que les villes 2-5 attendent la pause
   // Vérifier que le scraping reprend après
   ```

---

## Indicateurs de Rate Limiting

### Signes dans les logs

```
[RATE] HTTP 429 - Too Many Requests détecté
[RATE] Rate limiting détecté, activation pause globale
[RATE] Pause globale active, attente 2 minutes...
```

### Signes sur la page

- Page blanche ou erreur
- Message "Too many requests"
- Captcha affiché
- Redirection vers page de blocage

---

## Stratégies Complémentaires

### Rotation User-Agent (optionnel)

```javascript
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
    // ...
];

await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
```

### Délai aléatoire entre requêtes

```javascript
// Au lieu de delay(1000) fixe
const randomDelay = 1000 + Math.random() * 2000; // 1-3 secondes
await delay(randomDelay);
```

---

## Notes d'Implémentation

- La détection HTTP 429/403 nécessite l'interception des réponses Puppeteer
- La détection par contenu est un fallback si le site retourne 200 avec page d'erreur
- La pause globale empêche de "griller" toutes les tentatives de retry
- Considérer sauvegarder l'état avant pause (voir Story 2.3) pour reprise

---

## Liens

- [Epic 2 - Robustesse Scraping](README.md)
- [Story 2.1 - Retry Logic](story-2.1-retry-logic.md) (pré-requis)
- [Story 2.3 - Progression State](story-2.3-progression-state.md) (complémentaire)
- [INDEX](../INDEX.md)
