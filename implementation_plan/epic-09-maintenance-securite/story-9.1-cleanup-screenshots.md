# Story 9.1 - Nettoyage Automatique des Screenshots

> **Epic:** [9 - Maintenance & Sécurité](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** S (1-2h)
> **Statut:** TODO

---

## Contexte

Le scraping génère des captures d'écran de debug pour chaque ville/date. Ces fichiers s'accumulent sans jamais être nettoyés.

## Problème

```
src/scraping/saveData/images/screenshots/
├── Paris/
│   ├── screenshots_2026-01-20/
│   │   ├── debug_001.jpg   (~500 KB)
│   │   └── debug_002.jpg
│   ├── screenshots_2026-01-21/
│   └── screenshots_2026-01-22/
├── Londres/
│   └── ...
└── ... (50+ villes)
```

### Impact

| Villes | Dates/mois | Taille/screenshot | Total/mois |
|--------|------------|-------------------|------------|
| 20 | 12 | 500 KB | ~120 MB |
| 50 | 30 | 500 KB | ~750 MB |

Après 6 mois : **plusieurs GB** de fichiers inutiles.

## Solution Proposée

Script de nettoyage qui supprime les screenshots plus vieux que N jours (configurable).

### Code

```javascript
// src/scraping/cleanupScreenshots.js

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'saveData', 'images', 'screenshots');
const DEFAULT_MAX_AGE_DAYS = 30;

/**
 * Supprime les dossiers de screenshots plus vieux que maxAgeDays
 */
async function cleanupScreenshots(maxAgeDays = DEFAULT_MAX_AGE_DAYS) {
    console.log(`[CLEANUP] Nettoyage des screenshots > ${maxAgeDays} jours`);
    console.log(`[CLEANUP] Dossier: ${SCREENSHOTS_DIR}`);

    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        console.log('[CLEANUP] Dossier screenshots inexistant, rien à nettoyer');
        return { deleted: 0, freedBytes: 0 };
    }

    const now = Date.now();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    let freedBytes = 0;

    // Parcourir les dossiers de villes
    const cityDirs = fs.readdirSync(SCREENSHOTS_DIR);

    for (const cityDir of cityDirs) {
        const cityPath = path.join(SCREENSHOTS_DIR, cityDir);

        if (!fs.statSync(cityPath).isDirectory()) continue;

        // Parcourir les dossiers de dates (screenshots_YYYY-MM-DD)
        const dateDirs = fs.readdirSync(cityPath);

        for (const dateDir of dateDirs) {
            const datePath = path.join(cityPath, dateDir);

            if (!fs.statSync(datePath).isDirectory()) continue;

            // Extraire la date du nom du dossier
            const dateMatch = dateDir.match(/screenshots_(\d{4}-\d{2}-\d{2})/);
            if (!dateMatch) continue;

            const folderDate = new Date(dateMatch[1]);
            const ageMs = now - folderDate.getTime();

            if (ageMs > maxAgeMs) {
                // Calculer la taille avant suppression
                const size = getDirSize(datePath);
                freedBytes += size;

                // Supprimer le dossier
                fs.rmSync(datePath, { recursive: true, force: true });
                deletedCount++;

                console.log(`[CLEANUP] Supprimé: ${cityDir}/${dateDir} (${formatBytes(size)})`);
            }
        }

        // Supprimer le dossier ville s'il est vide
        const remaining = fs.readdirSync(cityPath);
        if (remaining.length === 0) {
            fs.rmdirSync(cityPath);
            console.log(`[CLEANUP] Dossier ville vide supprimé: ${cityDir}`);
        }
    }

    console.log(`[CLEANUP] Terminé: ${deletedCount} dossiers supprimés, ${formatBytes(freedBytes)} libérés`);

    return { deleted: deletedCount, freedBytes };
}

/**
 * Calcule la taille d'un dossier récursivement
 */
function getDirSize(dirPath) {
    let size = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            size += getDirSize(filePath);
        } else {
            size += stat.size;
        }
    }

    return size;
}

/**
 * Formate les bytes en format lisible
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Exécution directe
if (require.main === module) {
    const days = parseInt(process.argv[2]) || DEFAULT_MAX_AGE_DAYS;
    cleanupScreenshots(days);
}

module.exports = { cleanupScreenshots };
```

### Script npm

```json
{
    "scripts": {
        "cleanup:screenshots": "node src/scraping/cleanupScreenshots.js",
        "cleanup:screenshots-7": "node src/scraping/cleanupScreenshots.js 7",
        "cleanup:screenshots-30": "node src/scraping/cleanupScreenshots.js 30"
    }
}
```

### Intégration au scraping (optionnel)

```javascript
// À la fin de index.js
const { cleanupScreenshots } = require('./cleanupScreenshots');

// Nettoyer les vieux screenshots après chaque run
await cleanupScreenshots(30);
```

---

## Fichiers à Créer/Modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/scraping/cleanupScreenshots.js` | Créer | Script de nettoyage |
| `package.json` | Modifier | Ajouter scripts npm |
| `src/scraping/index.js` | Modifier (optionnel) | Appeler cleanup après scraping |

---

## Critères d'Acceptation

- [ ] `npm run cleanup:screenshots` supprime les screenshots > 30 jours
- [ ] La durée de rétention est configurable (argument CLI)
- [ ] L'espace libéré est affiché en fin d'exécution
- [ ] Les dossiers de villes vides sont supprimés
- [ ] Pas d'erreur si le dossier screenshots n'existe pas
- [ ] Log clair de chaque dossier supprimé

---

## Tests Manuels

```bash
# Créer un dossier de test avec une vieille date
mkdir -p src/scraping/saveData/images/screenshots/TestVille/screenshots_2025-01-01
echo "test" > src/scraping/saveData/images/screenshots/TestVille/screenshots_2025-01-01/test.jpg

# Lancer le nettoyage
npm run cleanup:screenshots

# Vérifier que le dossier a été supprimé
ls src/scraping/saveData/images/screenshots/TestVille/
```

---

## Améliorations Futures

- Mode "dry-run" pour voir ce qui serait supprimé sans supprimer
- Rapport JSON exportable
- Intégration avec le système de logs (Epic 4)

---

## Liens

- [Epic 9 - Maintenance & Sécurité](README.md)
- [INDEX](../INDEX.md)
