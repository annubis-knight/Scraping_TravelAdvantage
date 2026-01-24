# Story 2.3 - Gestion État de Progression (Reprise)

> **Epic:** [2 - Robustesse Scraping](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** L (4-8h)
> **Statut:** TODO

---

## Contexte

Un cycle complet de scraping peut durer plusieurs heures (50+ villes × multiple dates × ~5min/requête). Une interruption (crash, coupure réseau, arrêt manuel) oblige à tout recommencer.

## Problème

Aucun mécanisme de sauvegarde de progression :

```javascript
// index.js - Pas de checkpoint
for (const row of worksheet.eachRow) {  // Villes
    for (const date of dates) {         // Dates
        await scrapeHotels(...);        // Si crash ici
        // Aucune trace de où on en était
    }
}
```

### Impact

- Perte de temps si interruption à 80% du scraping
- Impossibilité de reprendre là où on s'est arrêté
- Stress utilisateur de ne pas pouvoir arrêter/reprendre

## Solution Proposée

Implémenter un système de checkpoint avec fichier `progress.json` :

### Structure du fichier progress.json

```json
{
  "startedAt": "2026-01-24T10:00:00.000Z",
  "lastUpdated": "2026-01-24T12:30:00.000Z",
  "status": "in_progress",
  "totalCities": 52,
  "totalDates": 12,
  "completed": [
    { "ville": "Paris", "dates": ["2026-02-07", "2026-02-14", "2026-02-21"] },
    { "ville": "Londres", "dates": ["2026-02-07", "2026-02-14"] }
  ],
  "current": {
    "ville": "Londres",
    "dateIndex": 2,
    "date": "2026-02-21"
  },
  "failed": [
    { "ville": "Madrid", "date": "2026-02-07", "error": "Timeout", "attempts": 3 }
  ],
  "stats": {
    "successCount": 156,
    "failCount": 3,
    "retryCount": 12
  }
}
```

### Code de gestion de progression

```javascript
// src/scraping/progressManager.js

const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, 'json/progress.json');

class ProgressManager {
    constructor() {
        this.progress = this.load();
    }

    /**
     * Charge la progression existante ou initialise
     */
    load() {
        if (fs.existsSync(PROGRESS_FILE)) {
            try {
                return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
            } catch (e) {
                console.log('[PROGRESS] Fichier corrompu, réinitialisation');
            }
        }
        return this.createNew();
    }

    /**
     * Crée une nouvelle progression
     */
    createNew() {
        return {
            startedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            status: 'not_started',
            totalCities: 0,
            totalDates: 0,
            completed: [],
            current: null,
            failed: [],
            stats: { successCount: 0, failCount: 0, retryCount: 0 }
        };
    }

    /**
     * Initialise pour un nouveau run
     */
    init(cities, dates) {
        this.progress = this.createNew();
        this.progress.totalCities = cities.length;
        this.progress.totalDates = dates.length;
        this.progress.status = 'in_progress';
        this.save();
    }

    /**
     * Vérifie si une ville/date a déjà été traitée
     */
    isCompleted(ville, date) {
        const cityEntry = this.progress.completed.find(c => c.ville === ville);
        return cityEntry && cityEntry.dates.includes(date);
    }

    /**
     * Marque le début du traitement
     */
    startProcessing(ville, dateIndex, date) {
        this.progress.current = { ville, dateIndex, date };
        this.progress.lastUpdated = new Date().toISOString();
        this.save();
    }

    /**
     * Marque un succès
     */
    markSuccess(ville, date) {
        let cityEntry = this.progress.completed.find(c => c.ville === ville);
        if (!cityEntry) {
            cityEntry = { ville, dates: [] };
            this.progress.completed.push(cityEntry);
        }
        if (!cityEntry.dates.includes(date)) {
            cityEntry.dates.push(date);
        }
        this.progress.stats.successCount++;
        this.progress.current = null;
        this.progress.lastUpdated = new Date().toISOString();
        this.save();
    }

    /**
     * Marque un échec définitif
     */
    markFailed(ville, date, error, attempts) {
        this.progress.failed.push({
            ville,
            date,
            error: error.substring(0, 200), // Limiter la taille
            attempts,
            timestamp: new Date().toISOString()
        });
        this.progress.stats.failCount++;
        this.progress.current = null;
        this.progress.lastUpdated = new Date().toISOString();
        this.save();
    }

    /**
     * Incrémente le compteur de retry
     */
    incrementRetry() {
        this.progress.stats.retryCount++;
        this.save();
    }

    /**
     * Termine le run
     */
    complete() {
        this.progress.status = 'completed';
        this.progress.completedAt = new Date().toISOString();
        this.save();
    }

    /**
     * Sauvegarde dans le fichier
     */
    save() {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
    }

    /**
     * Retourne un résumé pour affichage
     */
    getSummary() {
        const p = this.progress;
        const completedCount = p.completed.reduce((sum, c) => sum + c.dates.length, 0);
        const total = p.totalCities * p.totalDates;
        const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        return {
            status: p.status,
            progress: `${completedCount}/${total} (${percent}%)`,
            successes: p.stats.successCount,
            failures: p.stats.failCount,
            retries: p.stats.retryCount,
            duration: this.getDuration()
        };
    }

    getDuration() {
        const start = new Date(this.progress.startedAt);
        const now = new Date();
        const diffMs = now - start;
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    /**
     * Réinitialise la progression (nouveau run from scratch)
     */
    reset() {
        this.progress = this.createNew();
        this.save();
    }
}

module.exports = new ProgressManager();
```

### Intégration dans index.js

```javascript
const progressManager = require('./progressManager');

async function main() {
    const cities = await loadCities();
    const dates = loadDates();

    // Demander si reprise ou nouveau run
    if (progressManager.progress.status === 'in_progress') {
        const summary = progressManager.getSummary();
        console.log(`[PROGRESS] Run précédent détecté: ${summary.progress}`);
        console.log('[PROGRESS] Reprise automatique...');
        // Optionnel: demander confirmation via readline
    } else {
        progressManager.init(cities, dates);
    }

    for (const city of cities) {
        for (const date of dates) {
            // Skip si déjà traité
            if (progressManager.isCompleted(city.ville, date.fromDate)) {
                console.log(`[SKIP] ${city.ville} - ${date.fromDate} (déjà traité)`);
                continue;
            }

            progressManager.startProcessing(city.ville, dates.indexOf(date), date.fromDate);

            try {
                await scrapeWithRetry({ ...city, ...date });
                progressManager.markSuccess(city.ville, date.fromDate);
            } catch (error) {
                progressManager.markFailed(city.ville, date.fromDate, error.message, 3);
            }

            // Affichage progression périodique
            if (progressManager.progress.stats.successCount % 10 === 0) {
                const summary = progressManager.getSummary();
                console.log(`[PROGRESS] ${summary.progress} | ${summary.duration}`);
            }
        }
    }

    progressManager.complete();
    console.log('[PROGRESS] Scraping terminé!');
    console.log(progressManager.getSummary());
}
```

---

## Fichiers à Créer/Modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/scraping/progressManager.js` | Créer | Classe de gestion progression |
| `src/scraping/json/progress.json` | Auto-créé | Fichier de checkpoint |
| `src/scraping/index.js` | Modifier | Intégrer ProgressManager |

---

## Critères d'Acceptation

- [ ] `progress.json` est créé/mis à jour à chaque ville/date traitée
- [ ] Un run interrompu peut être repris là où il s'est arrêté
- [ ] Les villes/dates déjà traitées sont skippées au redémarrage
- [ ] Un résumé de progression est affiché périodiquement
- [ ] Les échecs sont trackés avec leur erreur
- [ ] Le fichier progress.json est lisible et complet
- [ ] Option pour forcer un nouveau run (ignorer progression existante)

---

## Tests Manuels

1. **Test reprise:**
   ```bash
   # Lancer le scraping
   npm run 2:scrape
   # Interrompre après quelques villes (Ctrl+C)
   # Relancer
   npm run 2:scrape
   # Vérifier que les villes précédentes sont skippées
   ```

2. **Test progression affichée:**
   ```bash
   # Lancer et observer les logs [PROGRESS]
   # Vérifier que le pourcentage augmente
   ```

3. **Test nouveau run forcé:**
   ```bash
   # Supprimer progress.json
   rm src/scraping/json/progress.json
   # Relancer - doit commencer du début
   ```

---

## Interface CLI (Optionnel)

Ajouter des options en ligne de commande :

```bash
# Forcer nouveau run
npm run 2:scrape -- --fresh

# Afficher status actuel
npm run 2:scrape -- --status

# Reprendre run interrompu (défaut)
npm run 2:scrape -- --resume
```

```javascript
// En début de index.js
const args = process.argv.slice(2);

if (args.includes('--status')) {
    console.log(progressManager.getSummary());
    process.exit(0);
}

if (args.includes('--fresh')) {
    progressManager.reset();
}
```

---

## Notes d'Implémentation

- Le fichier progress.json est écrit fréquemment (à chaque succès/échec)
- Considérer un debounce si performance problématique
- La taille du fichier peut grandir avec beaucoup d'échecs
- Optionnel: archiver progress.json à la fin du run

---

## Liens

- [Epic 2 - Robustesse Scraping](README.md)
- [Story 2.1 - Retry Logic](story-2.1-retry-logic.md)
- [Story 2.2 - Rate Limiting](story-2.2-rate-limiting.md)
- [INDEX](../INDEX.md)
