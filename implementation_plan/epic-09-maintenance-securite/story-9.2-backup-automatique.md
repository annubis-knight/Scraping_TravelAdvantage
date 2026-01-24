# Story 9.2 - Backup Automatique des Données

> **Epic:** [9 - Maintenance & Sécurité](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** M (2-4h)
> **Statut:** TODO

---

## Contexte

Les fichiers Excel générés par le scraping représentent des heures de travail. En cas de corruption, suppression accidentelle ou bug, ces données sont perdues sans possibilité de récupération.

## Problème

```
src/scraping/saveData/datasVilles/
├── Paris.xlsx        # 50+ heures de scraping
├── Londres.xlsx      # Données irremplaçables
├── Berlin.xlsx
└── ...

# Aucun backup, aucun filet de sécurité !
```

### Scénarios de perte de données

| Scénario | Risque | Conséquence |
|----------|--------|-------------|
| Bug dans xslxHandle.js | Moyen | Fichier Excel corrompu |
| Suppression accidentelle | Faible | Perte totale |
| Crash pendant écriture | Moyen | Fichier tronqué |
| Mise à jour échouée | Moyen | Données incohérentes |

## Solution Proposée

Script de backup qui :
1. Copie les fichiers Excel dans un dossier daté
2. Maintient les N derniers backups
3. Peut être exécuté manuellement ou automatiquement

### Code

```javascript
// src/scraping/backup.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'saveData', 'datasVilles');
const BACKUP_DIR = path.join(__dirname, 'saveData', 'backups');
const STATS_FILE = path.join(__dirname, 'json', 'statistiques.json');
const MAX_BACKUPS = 10; // Conserver les 10 derniers backups

/**
 * Crée un backup des données Excel et statistiques
 */
async function createBackup(label = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = label ? `${timestamp}_${label}` : timestamp;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`[BACKUP] Création du backup: ${backupName}`);

    // Créer le dossier de backup
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    fs.mkdirSync(backupPath);

    let filesCopied = 0;
    let totalSize = 0;

    // Backup des fichiers Excel
    if (fs.existsSync(DATA_DIR)) {
        const excelDir = path.join(backupPath, 'datasVilles');
        fs.mkdirSync(excelDir);

        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xlsx'));
        for (const file of files) {
            const src = path.join(DATA_DIR, file);
            const dest = path.join(excelDir, file);
            fs.copyFileSync(src, dest);
            totalSize += fs.statSync(src).size;
            filesCopied++;
        }
        console.log(`[BACKUP] ${files.length} fichiers Excel copiés`);
    }

    // Backup du fichier statistiques.json
    if (fs.existsSync(STATS_FILE)) {
        const statsBackup = path.join(backupPath, 'statistiques.json');
        fs.copyFileSync(STATS_FILE, statsBackup);
        totalSize += fs.statSync(STATS_FILE).size;
        filesCopied++;
        console.log(`[BACKUP] statistiques.json copié`);
    }

    // Créer un fichier manifest
    const manifest = {
        created: new Date().toISOString(),
        label: label || null,
        files: filesCopied,
        totalSizeBytes: totalSize,
        totalSizeHuman: formatBytes(totalSize)
    };
    fs.writeFileSync(
        path.join(backupPath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    console.log(`[BACKUP] ✓ Backup créé: ${filesCopied} fichiers, ${formatBytes(totalSize)}`);

    // Nettoyer les anciens backups
    await cleanupOldBackups();

    return { path: backupPath, files: filesCopied, size: totalSize };
}

/**
 * Supprime les backups au-delà de MAX_BACKUPS
 */
async function cleanupOldBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return;

    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(d => fs.statSync(path.join(BACKUP_DIR, d)).isDirectory())
        .sort()
        .reverse(); // Plus récent en premier

    if (backups.length <= MAX_BACKUPS) {
        console.log(`[BACKUP] ${backups.length}/${MAX_BACKUPS} backups conservés`);
        return;
    }

    const toDelete = backups.slice(MAX_BACKUPS);
    for (const backup of toDelete) {
        const backupPath = path.join(BACKUP_DIR, backup);
        fs.rmSync(backupPath, { recursive: true, force: true });
        console.log(`[BACKUP] Ancien backup supprimé: ${backup}`);
    }

    console.log(`[BACKUP] ${toDelete.length} ancien(s) backup(s) supprimé(s)`);
}

/**
 * Liste les backups disponibles
 */
function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
        console.log('[BACKUP] Aucun backup trouvé');
        return [];
    }

    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(d => fs.statSync(path.join(BACKUP_DIR, d)).isDirectory())
        .map(d => {
            const manifestPath = path.join(BACKUP_DIR, d, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                return {
                    name: d,
                    ...JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
                };
            }
            return { name: d, created: 'unknown' };
        })
        .sort((a, b) => b.name.localeCompare(a.name));

    console.log('\n=== BACKUPS DISPONIBLES ===');
    backups.forEach((b, i) => {
        console.log(`${i + 1}. ${b.name}`);
        console.log(`   Créé: ${b.created}`);
        console.log(`   Fichiers: ${b.files || '?'}, Taille: ${b.totalSizeHuman || '?'}`);
    });
    console.log(`\nTotal: ${backups.length} backup(s)\n`);

    return backups;
}

/**
 * Restaure un backup
 */
async function restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
        console.error(`[BACKUP] Backup non trouvé: ${backupName}`);
        return false;
    }

    console.log(`[BACKUP] ⚠️  Restauration de: ${backupName}`);
    console.log(`[BACKUP] Les données actuelles seront écrasées !`);

    // Restaurer les fichiers Excel
    const excelBackupDir = path.join(backupPath, 'datasVilles');
    if (fs.existsSync(excelBackupDir)) {
        const files = fs.readdirSync(excelBackupDir);
        for (const file of files) {
            const src = path.join(excelBackupDir, file);
            const dest = path.join(DATA_DIR, file);
            fs.copyFileSync(src, dest);
        }
        console.log(`[BACKUP] ${files.length} fichiers Excel restaurés`);
    }

    // Restaurer statistiques.json
    const statsBackup = path.join(backupPath, 'statistiques.json');
    if (fs.existsSync(statsBackup)) {
        fs.copyFileSync(statsBackup, STATS_FILE);
        console.log(`[BACKUP] statistiques.json restauré`);
    }

    console.log(`[BACKUP] ✓ Restauration terminée`);
    return true;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Exécution CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'create';

    switch (command) {
        case 'create':
            createBackup(args[1]);
            break;
        case 'list':
            listBackups();
            break;
        case 'restore':
            if (!args[1]) {
                console.error('Usage: node backup.js restore <backup_name>');
                process.exit(1);
            }
            restoreBackup(args[1]);
            break;
        default:
            console.log('Usage:');
            console.log('  node backup.js create [label]  - Créer un backup');
            console.log('  node backup.js list            - Lister les backups');
            console.log('  node backup.js restore <name>  - Restaurer un backup');
    }
}

module.exports = { createBackup, listBackups, restoreBackup };
```

### Scripts npm

```json
{
    "scripts": {
        "backup": "node src/scraping/backup.js create",
        "backup:pre-scrape": "node src/scraping/backup.js create pre-scrape",
        "backup:list": "node src/scraping/backup.js list",
        "backup:restore": "node src/scraping/backup.js restore"
    }
}
```

### Intégration au scraping

```javascript
// Au début de index.js, avant le scraping
const { createBackup } = require('./backup');

console.log('[INDEX] Création d\'un backup avant scraping...');
await createBackup('pre-scrape');

// ... scraping ...
```

---

## Fichiers à Créer/Modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/scraping/backup.js` | Créer | Script de backup/restore |
| `package.json` | Modifier | Ajouter scripts npm |
| `src/scraping/index.js` | Modifier | Backup auto avant scraping |
| `.gitignore` | Modifier | Ignorer dossier backups |

---

## Critères d'Acceptation

- [ ] `npm run backup` crée un backup daté
- [ ] `npm run backup:list` affiche les backups disponibles
- [ ] Les 10 derniers backups sont conservés automatiquement
- [ ] Chaque backup contient un manifest.json avec métadonnées
- [ ] `npm run backup:restore <name>` restaure un backup
- [ ] Un backup est créé automatiquement avant chaque scraping
- [ ] Le dossier backups est ignoré par Git

---

## Structure de Backup

```
src/scraping/saveData/backups/
├── 2026-01-24T10-30-00_pre-scrape/
│   ├── manifest.json
│   ├── statistiques.json
│   └── datasVilles/
│       ├── Paris.xlsx
│       ├── Londres.xlsx
│       └── ...
├── 2026-01-23T15-45-00/
│   └── ...
└── ...
```

---

## Liens

- [Epic 9 - Maintenance & Sécurité](README.md)
- [Story 9.3 - Sécurité .gitignore](story-9.3-gitignore-securite.md)
- [INDEX](../INDEX.md)
