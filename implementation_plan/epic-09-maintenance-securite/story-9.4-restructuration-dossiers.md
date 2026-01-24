# Story 9.4 - Restructuration des Dossiers de Données

> **Epic:** [9 - Maintenance & Sécurité](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** L (4-8h)
> **Statut:** TODO

---

## Contexte

La structure actuelle des dossiers de données est confuse : fichiers JSON dans `json/`, fichiers Excel dans `saveData/datasVilles/`, statistiques à part, etc. Cette organisation rend difficile la compréhension et la maintenance.

## Problème

### Structure actuelle

```
src/scraping/
├── json/
│   ├── Dates.json              # Config (entrée)
│   ├── hotels_data.json        # Temporaire
│   ├── saved_hotels.json       # Temporaire
│   └── statistiques.json       # Résultat (sortie)
├── saveData/
│   ├── datasVilles/            # Résultats Excel
│   │   ├── Paris.xlsx
│   │   └── ...
│   └── images/
│       └── screenshots/        # Debug
├── villesDeDestinations.xlsx   # Config (entrée) - à la racine !
└── user_data/                  # Session Chrome
```

### Problèmes identifiés

| Problème | Impact |
|----------|--------|
| Mélange entrées/sorties/temp dans `json/` | Confusion sur ce qui est quoi |
| `villesDeDestinations.xlsx` à la racine | Incohérent avec autres configs |
| `saveData` contient à la fois résultats et debug | Pas de séparation claire |
| Pas de dossier dédié pour les backups | Où mettre les sauvegardes ? |

## Solution Proposée

### Structure cible

```
src/scraping/
├── core/                       # Code métier (inchangé)
│   ├── index.js
│   ├── scrapeHotels.js
│   ├── stats.js
│   └── ...
│
├── config/                     # NOUVEAU: Configuration
│   ├── villesDeDestinations.xlsx
│   ├── Dates.json
│   └── config.js               # (Epic 3)
│
├── data/                       # NOUVEAU: Toutes les données
│   ├── temp/                   # Temporaire (gitignored)
│   │   ├── hotels_data.json
│   │   ├── saved_hotels.json
│   │   └── screenshots/
│   │
│   ├── output/                 # Résultats persistants
│   │   ├── villes/             # Excel par ville
│   │   │   ├── Paris.xlsx
│   │   │   └── ...
│   │   └── statistiques.json
│   │
│   └── backup/                 # Sauvegardes (Story 9.2)
│       └── ...
│
└── user_data/                  # Session Chrome (inchangé, gitignored)
```

### Avantages

| Aspect | Avant | Après |
|--------|-------|-------|
| Clarté | Mélange de tout | Séparation claire |
| Git | Difficile à ignorer correctement | Ignorer `data/temp/` simplement |
| Backup | Pas de dossier dédié | `data/backup/` prêt |
| Config | Dispersée | Centralisée dans `config/` |

---

## Plan de Migration

### Étape 1 : Créer la nouvelle structure

```bash
# Créer les nouveaux dossiers
mkdir -p src/scraping/config
mkdir -p src/scraping/data/temp
mkdir -p src/scraping/data/output/villes
mkdir -p src/scraping/data/backup
```

### Étape 2 : Déplacer les fichiers de configuration

```bash
# Déplacer les configs
mv src/scraping/villesDeDestinations.xlsx src/scraping/config/
mv src/scraping/json/Dates.json src/scraping/config/
```

### Étape 3 : Déplacer les fichiers de données

```bash
# Déplacer les résultats
mv src/scraping/saveData/datasVilles/* src/scraping/data/output/villes/
mv src/scraping/json/statistiques.json src/scraping/data/output/

# Déplacer les temporaires
mv src/scraping/json/hotels_data.json src/scraping/data/temp/
mv src/scraping/json/saved_hotels.json src/scraping/data/temp/
mv src/scraping/saveData/images/screenshots src/scraping/data/temp/
```

### Étape 4 : Mettre à jour les chemins dans le code

#### Fichiers à modifier

| Fichier | Chemin à modifier |
|---------|-------------------|
| `src/scraping/index.js` | `villesDeDestinations.xlsx`, `Dates.json`, `hotels_data.json`, etc. |
| `src/scraping/scrapeHotels.js` | Chemin screenshots |
| `src/scraping/stats.js` | `statistiques.json` |
| `src/scraping/xslxHandle.js` | Chemins Excel |
| `src/MapLeaflet/index1_generateResume.js` | Chemin datasVilles |
| `server.js` | Chemins pour lecture |

### Étape 5 : Créer un module de chemins centralisé

```javascript
// src/scraping/config/paths.js

const path = require('path');

const SCRAPING_ROOT = path.join(__dirname, '..');

module.exports = {
    // Configuration
    CONFIG_DIR: path.join(SCRAPING_ROOT, 'config'),
    VILLES_FILE: path.join(SCRAPING_ROOT, 'config', 'villesDeDestinations.xlsx'),
    DATES_FILE: path.join(SCRAPING_ROOT, 'config', 'Dates.json'),

    // Données temporaires
    TEMP_DIR: path.join(SCRAPING_ROOT, 'data', 'temp'),
    HOTELS_DATA_FILE: path.join(SCRAPING_ROOT, 'data', 'temp', 'hotels_data.json'),
    SAVED_HOTELS_FILE: path.join(SCRAPING_ROOT, 'data', 'temp', 'saved_hotels.json'),
    SCREENSHOTS_DIR: path.join(SCRAPING_ROOT, 'data', 'temp', 'screenshots'),

    // Résultats
    OUTPUT_DIR: path.join(SCRAPING_ROOT, 'data', 'output'),
    VILLES_OUTPUT_DIR: path.join(SCRAPING_ROOT, 'data', 'output', 'villes'),
    STATS_FILE: path.join(SCRAPING_ROOT, 'data', 'output', 'statistiques.json'),

    // Backup
    BACKUP_DIR: path.join(SCRAPING_ROOT, 'data', 'backup'),

    // Session Chrome
    USER_DATA_DIR: path.join(SCRAPING_ROOT, 'user_data'),

    // Helper pour obtenir le chemin d'un fichier ville
    getVilleFile: (ville) => path.join(SCRAPING_ROOT, 'data', 'output', 'villes', `${ville}.xlsx`),

    // Helper pour obtenir le dossier screenshots d'une ville/date
    getScreenshotDir: (ville, date) => path.join(SCRAPING_ROOT, 'data', 'temp', 'screenshots', ville, `screenshots_${date}`)
};
```

### Étape 6 : Utiliser le module paths.js

```javascript
// Avant (dans index.js)
const villesPath = path.join(__dirname, 'villesDeDestinations.xlsx');
const datesPath = path.join(__dirname, 'json', 'Dates.json');
const outputPath = path.join(__dirname, 'saveData', 'datasVilles', `${ville}.xlsx`);

// Après
const paths = require('./config/paths');

const villesPath = paths.VILLES_FILE;
const datesPath = paths.DATES_FILE;
const outputPath = paths.getVilleFile(ville);
```

---

## Fichiers à Créer/Modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/scraping/config/paths.js` | Créer | Module de chemins centralisé |
| `src/scraping/index.js` | Modifier | Utiliser paths.js |
| `src/scraping/scrapeHotels.js` | Modifier | Utiliser paths.js |
| `src/scraping/stats.js` | Modifier | Utiliser paths.js |
| `src/scraping/xslxHandle.js` | Modifier | Utiliser paths.js |
| `src/MapLeaflet/index1_generateResume.js` | Modifier | Mettre à jour chemins |
| `src/MapLeaflet/generateMap.js` | Modifier | Mettre à jour chemins |
| `server.js` | Modifier | Mettre à jour chemins |
| `.gitignore` | Modifier | Ignorer `data/temp/` et `data/backup/` |

---

## Critères d'Acceptation

- [ ] Nouvelle structure de dossiers créée
- [ ] Fichiers déplacés aux bons emplacements
- [ ] Module `paths.js` créé avec tous les chemins
- [ ] Tous les scripts utilisent `paths.js`
- [ ] `npm run 2:scrape` fonctionne avec la nouvelle structure
- [ ] `npm start` fonctionne avec la nouvelle structure
- [ ] `.gitignore` mis à jour pour la nouvelle structure
- [ ] Aucune régression fonctionnelle

---

## Risques et Mitigation

| Risque | Mitigation |
|--------|------------|
| Casser des scripts existants | Tester chaque script après migration |
| Perdre des données | Backup complet avant migration (Story 9.2) |
| Oublier des chemins | Recherche grep de tous les chemins avant/après |

### Commande de vérification

```bash
# Trouver toutes les références aux anciens chemins
grep -r "saveData" src/ --include="*.js"
grep -r "json/" src/ --include="*.js"
grep -r "villesDeDestinations" src/ --include="*.js"
```

---

## Rollback

En cas de problème, restaurer depuis le backup :

```bash
npm run backup:restore <nom_du_backup>
git checkout -- .  # Restaurer le code
```

---

## Dépendances

| Story | Raison |
|-------|--------|
| [9.2 - Backup](story-9.2-backup-automatique.md) | Faire un backup avant migration |
| [9.3 - .gitignore](story-9.3-gitignore-securite.md) | Mettre à jour pour nouvelle structure |

---

## Liens

- [Epic 9 - Maintenance & Sécurité](README.md)
- [Epic 3 - Configuration](../epic-03-configuration/) (config.js complémentaire)
- [INDEX](../INDEX.md)
