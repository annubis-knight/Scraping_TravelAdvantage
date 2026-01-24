# Story 4.2 - Métriques de Performance

> **Epic:** [4 - Logging & Monitoring](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** M (2-4h)
> **Statut:** TODO
> **Dépendances:** [Story 4.1](story-4.1-file-logging.md)

---

## Contexte

Actuellement impossible de mesurer la performance du scraping : temps moyen par ville, taux de succès, tendances.

## Solution Proposée

### Fichier metrics.json

```json
{
  "lastRun": {
    "date": "2026-01-24",
    "duration": "2h 15m",
    "cities": 52,
    "dates": 12,
    "totalRequests": 624,
    "successCount": 618,
    "failCount": 6,
    "retryCount": 23,
    "successRate": "99.04%",
    "avgTimePerRequest": "13.2s"
  },
  "history": [
    { "date": "2026-01-23", "successRate": "98.5%", "avgTime": "14.1s" },
    { "date": "2026-01-22", "successRate": "97.2%", "avgTime": "15.3s" }
  ],
  "byCity": {
    "Paris": { "avgTime": "11.2s", "failRate": "0%" },
    "Madrid": { "avgTime": "18.5s", "failRate": "5.2%" }
  }
}
```

### Classe MetricsCollector

```javascript
// src/scraping/metricsCollector.js
class MetricsCollector {
    constructor() {
        this.currentRun = {
            startTime: Date.now(),
            requests: [],
            byCity: {}
        };
    }

    recordRequest(city, duration, success, retries) {
        this.currentRun.requests.push({ city, duration, success, retries, timestamp: Date.now() });

        if (!this.currentRun.byCity[city]) {
            this.currentRun.byCity[city] = { total: 0, success: 0, totalTime: 0 };
        }
        const cityStats = this.currentRun.byCity[city];
        cityStats.total++;
        if (success) cityStats.success++;
        cityStats.totalTime += duration;
    }

    getSummary() {
        const requests = this.currentRun.requests;
        const successCount = requests.filter(r => r.success).length;
        const totalTime = requests.reduce((sum, r) => sum + r.duration, 0);

        return {
            totalRequests: requests.length,
            successCount,
            failCount: requests.length - successCount,
            successRate: `${((successCount / requests.length) * 100).toFixed(2)}%`,
            avgTimePerRequest: `${(totalTime / requests.length / 1000).toFixed(1)}s`,
            totalDuration: this.formatDuration(Date.now() - this.currentRun.startTime)
        };
    }

    formatDuration(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    save() {
        // Sauvegarder dans metrics.json
    }
}
```

---

## Fichiers à Créer/Modifier

| Fichier | Action |
|---------|--------|
| `src/scraping/metricsCollector.js` | Créer |
| `src/scraping/json/metrics.json` | Auto-généré |
| `src/scraping/index.js` | Intégrer MetricsCollector |

---

## Critères d'Acceptation

- [ ] Temps de chaque requête mesuré
- [ ] Résumé affiché en fin de run
- [ ] Historique conservé (30 derniers runs)
- [ ] Stats par ville disponibles
- [ ] Fichier metrics.json lisible

---

## Affichage Fin de Run

```
╔════════════════════════════════════════════════════════╗
║                    RÉSUMÉ SCRAPING                      ║
╠════════════════════════════════════════════════════════╣
║  Durée totale     : 2h 15m                             ║
║  Requêtes         : 624 (618 ✓ / 6 ✗)                  ║
║  Taux de succès   : 99.04%                             ║
║  Temps moyen      : 13.2s/requête                      ║
║  Retries          : 23                                  ║
╠════════════════════════════════════════════════════════╣
║  Top 3 plus lentes : Madrid (18.5s), Rome (16.2s)...   ║
║  Top 3 échecs      : Madrid (3), Berlin (2), Rome (1)  ║
╚════════════════════════════════════════════════════════╝
```

---

## Liens

- [Epic 4 - Logging & Monitoring](README.md)
- [INDEX](../INDEX.md)
