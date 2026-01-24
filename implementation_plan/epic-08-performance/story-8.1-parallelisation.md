# Story 8.1 - Parallélisation du Scraping

> **Epic:** [8 - Performance & Optimisation](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** XL (> 8h)
> **Statut:** TODO

---

## Contexte

Le scraping actuel est purement séquentiel : une ville après l'autre, une date après l'autre. Cela entraîne des temps d'exécution prohibitifs pour de nombreuses destinations.

## Problème

```javascript
// Actuellement dans index.js
for (const cityData of cities) {           // Séquentiel
    for (const date of dates) {            // Séquentiel
        await scrapeHotels(...);           // Bloquant
        await delay(1000);
    }
}
// 20 villes × 3 dates × 5min = 5 heures !
```

### Impact

| Nombre de villes | Temps séquentiel | Temps parallèle (3 workers) |
|------------------|------------------|----------------------------|
| 5 | ~25 min | ~10 min |
| 10 | ~50 min | ~20 min |
| 20 | ~100 min | ~35 min |
| 50 | ~250 min | ~85 min |

## Solution Proposée

Implémenter un système de workers parallèles avec une limite configurable.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Queue Manager                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Queue: [                                                  │
│     {ville: Paris, date: 01/02, type: 1},                   │
│     {ville: Paris, date: 01/02, type: 2},                   │
│     {ville: Londres, date: 01/02, type: 1},                 │
│     ...                                                     │
│   ]                                                         │
│                                                             │
│   Workers actifs: 3 / 3 max                                 │
│   Complétés: 12 / 45                                        │
│   Échecs: 1                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code - Gestionnaire de Queue

```javascript
// src/scraping/parallelScraper.js

const { scrapeWithRetry } = require('./index'); // Story 2.1

class ParallelScraper {
    constructor(options = {}) {
        this.maxWorkers = options.maxWorkers || 3;
        this.delayBetweenStarts = options.delayBetweenStarts || 5000; // 5s entre démarrages
        this.queue = [];
        this.activeWorkers = 0;
        this.results = { success: [], failed: [] };
    }

    /**
     * Ajoute les tâches à la queue
     */
    addTasks(cities, dates) {
        for (const city of cities) {
            for (const date of dates) {
                this.queue.push({
                    ville: city.ville,
                    pays: city.country,
                    lat: city.lat,
                    lon: city.lon,
                    fromDate: date.date.fromDate,
                    toDate: date.date.toDate,
                    type: date.date.type
                });
            }
        }
        console.log(`[PARALLEL] ${this.queue.length} tâches ajoutées à la queue`);
    }

    /**
     * Lance le scraping parallèle
     */
    async run() {
        const startTime = Date.now();
        console.log(`[PARALLEL] Démarrage avec ${this.maxWorkers} workers max`);

        const workers = [];

        // Démarrer les workers avec un délai entre chaque
        for (let i = 0; i < this.maxWorkers; i++) {
            if (this.queue.length === 0) break;

            workers.push(this.startWorker(i + 1));

            // Délai entre les démarrages pour éviter surcharge
            if (i < this.maxWorkers - 1 && this.queue.length > 0) {
                await this.delay(this.delayBetweenStarts);
            }
        }

        // Attendre que tous les workers terminent
        await Promise.all(workers);

        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        console.log(`[PARALLEL] Terminé en ${duration} minutes`);
        console.log(`[PARALLEL] Succès: ${this.results.success.length}, Échecs: ${this.results.failed.length}`);

        return this.results;
    }

    /**
     * Worker qui consomme la queue
     */
    async startWorker(workerId) {
        console.log(`[WORKER ${workerId}] Démarré`);
        this.activeWorkers++;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            const taskId = `${task.ville}-${task.fromDate}-T${task.type}`;

            console.log(`[WORKER ${workerId}] Traitement: ${taskId}`);
            console.log(`[PARALLEL] Queue restante: ${this.queue.length}, Workers actifs: ${this.activeWorkers}`);

            try {
                await scrapeWithRetry(task);
                this.results.success.push(taskId);
                console.log(`[WORKER ${workerId}] ✓ ${taskId}`);
            } catch (error) {
                this.results.failed.push({ taskId, error: error.message });
                console.error(`[WORKER ${workerId}] ✗ ${taskId}: ${error.message}`);
            }

            // Délai entre les tâches d'un même worker
            await this.delay(2000);
        }

        this.activeWorkers--;
        console.log(`[WORKER ${workerId}] Terminé`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { ParallelScraper };
```

### Utilisation dans index.js

```javascript
// Option A: Mode parallèle
const { ParallelScraper } = require('./parallelScraper');

async function runParallel(cities, dates) {
    const scraper = new ParallelScraper({
        maxWorkers: 3,           // Configurable
        delayBetweenStarts: 5000 // 5s entre démarrages
    });

    scraper.addTasks(cities, dates);
    const results = await scraper.run();

    // Afficher résumé
    console.log('\n=== RÉSUMÉ SCRAPING PARALLÈLE ===');
    console.log(`Succès: ${results.success.length}`);
    console.log(`Échecs: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\nÉchecs:');
        results.failed.forEach(f => console.log(`  - ${f.taskId}: ${f.error}`));
    }
}

// Option B: Garder le mode séquentiel disponible
const args = process.argv.slice(2);
if (args.includes('--parallel')) {
    runParallel(cities, dates);
} else {
    runSequential(cities, dates); // Code actuel
}
```

### Script npm

```json
{
    "scripts": {
        "2:scrape": "node src/scraping/index.js",
        "2:scrape-parallel": "node src/scraping/index.js --parallel",
        "2:scrape-parallel-5": "node src/scraping/index.js --parallel --workers=5"
    }
}
```

---

## Gestion Mémoire

### Problème Chrome/Puppeteer

Chaque instance Chrome consomme ~200-500 MB de RAM. Avec 5 workers :
- Minimum: 1 GB RAM
- Recommandé: 2+ GB RAM

### Solution: Réutilisation de navigateur

```javascript
// Alternative: un seul browser, plusieurs pages
class SingleBrowserParallelScraper {
    constructor(maxPages = 3) {
        this.browser = null;
        this.maxPages = maxPages;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-first-run']
        });
    }

    async scrapeTask(task) {
        const page = await this.browser.newPage();
        try {
            // Configurer la page
            await page.setUserAgent(getRandomUserAgent());
            // ... scraping logic
        } finally {
            await page.close(); // Libérer la mémoire
        }
    }

    async cleanup() {
        if (this.browser) await this.browser.close();
    }
}
```

---

## Fichiers à Modifier/Créer

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/scraping/parallelScraper.js` | Créer | Gestionnaire de queue parallèle |
| `src/scraping/index.js` | Modifier | Ajouter option --parallel |
| `package.json` | Modifier | Ajouter scripts npm |

---

## Critères d'Acceptation

- [ ] `npm run 2:scrape-parallel` lance le scraping en parallèle
- [ ] Maximum de workers configurable (défaut: 3)
- [ ] Chaque worker est identifié dans les logs
- [ ] Queue affiche la progression (X/Y complétés)
- [ ] Les échecs sont collectés et affichés en fin de run
- [ ] Le mode séquentiel reste disponible (`npm run 2:scrape`)
- [ ] La consommation mémoire reste raisonnable (< 2 GB pour 3 workers)

---

## Tests

### Test 1: Performance

```bash
# Mesurer le temps séquentiel
time npm run 2:scrape

# Mesurer le temps parallèle
time npm run 2:scrape-parallel

# Comparer les résultats
```

### Test 2: Gestion d'erreurs

```javascript
// Simuler des échecs aléatoires
// Vérifier que les autres tâches continuent
// Vérifier le rapport final
```

### Test 3: Mémoire

```bash
# Observer la consommation pendant l'exécution
# Sur Windows: Task Manager
# Sur Linux: htop ou top
```

---

## Dépendances

| Story | Raison |
|-------|--------|
| [2.1 - Retry Logic](../epic-02-robustesse-scraping/story-2.1-retry-logic.md) | Gestion des erreurs par worker |
| [2.3 - État de progression](../epic-02-robustesse-scraping/story-2.3-progression-state.md) | Reprise après interruption |
| [2.4 - User-Agent Rotation](../epic-02-robustesse-scraping/story-2.4-user-agent-rotation.md) | Éviter blocage multi-requêtes |

---

## Liens

- [Epic 8 - Performance](README.md)
- [INDEX](../INDEX.md)
