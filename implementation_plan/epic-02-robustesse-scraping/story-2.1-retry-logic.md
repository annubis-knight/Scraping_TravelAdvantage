# Story 2.1 - Retry Logic avec Backoff Exponentiel

> **Epic:** [2 - Robustesse Scraping](README.md)
> **Priorité:** 🟠 P1
> **Complexité:** M (2-4h)
> **Statut:** TODO

---

## Contexte

La documentation PRD (§7.5) mentionne un système de retry "max 3x" pour les erreurs de scraping. Cette fonctionnalité n'est pas implémentée.

## Problème

Actuellement, une erreur de scraping (timeout, erreur réseau, DOM non trouvé) entraîne simplement un log et le passage à la date suivante :

```javascript
// index.js lignes ~38-44
try {
    await scrapeHotels(...);
    await delay(1000);
} catch (error) {
    console.error(`Erreur lors du scraping pour ${cityData.ville}: ${error.message}`);
    // Pas de retry, on passe à la suite
}
```

### Impact

- Perte de données si erreur temporaire (réseau instable, page lente)
- Pas de distinction entre erreur récupérable et erreur fatale
- Impossible de savoir combien de tentatives ont été faites

## Solution Proposée

Implémenter un wrapper `scrapeWithRetry()` avec :
- Maximum 3 tentatives
- Backoff exponentiel (2s, 4s, 8s)
- Logging détaillé des tentatives
- Classification des erreurs (récupérable vs fatale)

### Code à implémenter

```javascript
// Nouvelle fonction dans src/scraping/index.js ou utils.js

const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // 2 secondes

/**
 * Types d'erreurs pour classification
 */
const ErrorType = {
    TIMEOUT: 'TIMEOUT',
    NETWORK: 'NETWORK',
    DOM_NOT_FOUND: 'DOM_NOT_FOUND',
    RATE_LIMITED: 'RATE_LIMITED',
    UNKNOWN: 'UNKNOWN'
};

/**
 * Classifie une erreur pour déterminer si retry possible
 */
function classifyError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
        return { type: ErrorType.TIMEOUT, retryable: true };
    }
    if (message.includes('net::') || message.includes('network')) {
        return { type: ErrorType.NETWORK, retryable: true };
    }
    if (message.includes('waiting for selector')) {
        return { type: ErrorType.DOM_NOT_FOUND, retryable: true };
    }
    if (message.includes('429') || message.includes('403') || message.includes('rate')) {
        return { type: ErrorType.RATE_LIMITED, retryable: true, extraDelay: 30000 };
    }

    return { type: ErrorType.UNKNOWN, retryable: false };
}

/**
 * Wrapper de scraping avec retry et backoff exponentiel
 */
async function scrapeWithRetry(scrapeParams, maxRetries = MAX_RETRIES) {
    const { ville, pays, lat, lon, fromDate, toDate, type } = scrapeParams;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[SCRAPE] Tentative ${attempt}/${maxRetries} - ${ville} (${fromDate} → ${toDate})`);

            const result = await scrapeHotels(ville, pays, lat, lon, fromDate, toDate, type);

            console.log(`[SCRAPE] ✓ Succès pour ${ville} à la tentative ${attempt}`);
            return result;

        } catch (error) {
            const classification = classifyError(error);

            console.error(`[SCRAPE] ✗ Échec tentative ${attempt}/${maxRetries} - ${ville}`);
            console.error(`[SCRAPE]   Type: ${classification.type}`);
            console.error(`[SCRAPE]   Message: ${error.message}`);

            // Dernière tentative ou erreur non récupérable
            if (attempt === maxRetries || !classification.retryable) {
                console.error(`[SCRAPE] ✗✗ Abandon après ${attempt} tentative(s) - ${ville}`);
                throw error; // Propager l'erreur pour tracking
            }

            // Calculer le délai avec backoff exponentiel
            let delay = BASE_DELAY * Math.pow(2, attempt - 1); // 2s, 4s, 8s

            // Ajouter délai supplémentaire si rate limited
            if (classification.extraDelay) {
                delay += classification.extraDelay;
                console.log(`[SCRAPE] Rate limit détecté, délai prolongé`);
            }

            console.log(`[SCRAPE] Retry dans ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = { scrapeWithRetry, classifyError, ErrorType };
```

### Modification dans index.js

```javascript
// Avant
try {
    await scrapeHotels(cityData.ville, cityData.country, ...);
    await delay(1000);
} catch (error) {
    console.error(`Erreur: ${error.message}`);
}

// Après
try {
    await scrapeWithRetry({
        ville: cityData.ville,
        pays: cityData.country,
        lat: cityData.lat,
        lon: cityData.lon,
        fromDate: date.fromDate,
        toDate: date.toDate,
        type: date.type
    });
    await delay(1000);
} catch (error) {
    // Erreur après toutes les tentatives
    console.error(`[FINAL] Échec définitif pour ${cityData.ville}: ${error.message}`);
    // Optionnel: tracker les échecs pour rapport final
    failedScrapes.push({ ville: cityData.ville, date: date.fromDate, error: error.message });
}
```

---

## Fichiers à Modifier

| Fichier | Modification | Lignes |
|---------|--------------|--------|
| `src/scraping/index.js` | Ajouter `scrapeWithRetry()` et `classifyError()` | Nouveau bloc |
| `src/scraping/index.js` | Modifier l'appel dans la boucle des dates | ~38-44 |

---

## Critères d'Acceptation

- [ ] En cas de timeout, le scraping est retenté jusqu'à 3 fois
- [ ] Le délai entre tentatives augmente (2s → 4s → 8s)
- [ ] Chaque tentative est loggée avec son numéro
- [ ] Les erreurs sont classifiées (TIMEOUT, NETWORK, DOM, RATE_LIMITED, UNKNOWN)
- [ ] Les erreurs non récupérables ne sont pas retentées
- [ ] Après 3 échecs, l'erreur est propagée et loggée clairement
- [ ] Le scraping continue avec les autres villes/dates après un échec définitif

---

## Tests Manuels

1. **Test timeout simulé:**
   ```javascript
   // Temporairement réduire le timeout à 1ms dans scrapeHotels.js
   // Vérifier que 3 tentatives sont faites
   // Restaurer le timeout original
   ```

2. **Test succès après retry:**
   ```javascript
   // Simuler un échec sur les 2 premières tentatives
   // Vérifier que la 3ème réussit
   // let attempts = 0;
   // if (++attempts < 3) throw new Error('timeout');
   ```

3. **Test erreur non récupérable:**
   ```javascript
   // Lancer avec une ville invalide
   // Vérifier qu'une seule tentative est faite (UNKNOWN)
   ```

---

## Configuration Suggérée

Pour flexibilité future (voir Epic 3), ces valeurs pourraient être externalisées :

```javascript
// config.js
module.exports = {
    retry: {
        maxAttempts: 3,
        baseDelayMs: 2000,
        rateLimitExtraDelayMs: 30000
    }
};
```

---

## Métriques à Tracker (Optionnel)

Pour le monitoring (voir Epic 4), considérer tracker :
- Nombre total de retries
- Taux de succès au 1er essai vs retry
- Types d'erreurs les plus fréquents
- Villes avec le plus d'échecs

---

## Liens

- [Epic 2 - Robustesse Scraping](README.md)
- [Story 2.2 - Rate Limiting](story-2.2-rate-limiting.md) (utilise cette base)
- [Epic 3 - Configuration](../epic-03-configuration/) (externaliser les paramètres)
- [INDEX](../INDEX.md)
