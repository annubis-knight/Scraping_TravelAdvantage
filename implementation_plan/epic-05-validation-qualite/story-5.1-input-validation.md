# Story 5.1 - Validation Fichiers d'Entrée

> **Epic:** [5 - Validation & Qualité](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** M (2-4h)
> **Statut:** TODO

---

## Contexte

Les fichiers d'entrée (villesDeDestinations.xlsx, Dates.json) sont lus sans validation. Un fichier corrompu ou mal formaté cause des erreurs difficiles à diagnostiquer.

## Solution Proposée

### Fonction de validation générique

```javascript
// src/scraping/validators.js

function validateInputFiles() {
    const errors = [];

    // Vérifier existence des fichiers
    const requiredFiles = [
        { path: './villesDeDestinations.xlsx', name: 'Liste des villes' },
        { path: './json/Dates.json', name: 'Dates de scraping' }
    ];

    for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(__dirname, file.path))) {
            errors.push(`Fichier manquant: ${file.name} (${file.path})`);
        }
    }

    // Valider Dates.json
    try {
        const dates = require('./json/Dates.json');
        if (!Array.isArray(dates) || dates.length === 0) {
            errors.push('Dates.json doit contenir un tableau non vide');
        }
        dates.forEach((d, i) => {
            if (!d.date?.fromDate || !d.date?.toDate || !d.date?.type) {
                errors.push(`Date ${i}: structure invalide (fromDate, toDate, type requis)`);
            }
        });
    } catch (e) {
        errors.push(`Dates.json invalide: ${e.message}`);
    }

    return { valid: errors.length === 0, errors };
}
```

### Appel au démarrage

```javascript
// index.js - début
const { valid, errors } = validateInputFiles();
if (!valid) {
    console.error('❌ Erreurs de validation:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
}
```

---

## Fichiers à Créer/Modifier

| Fichier | Action |
|---------|--------|
| `src/scraping/validators.js` | Créer |
| `src/scraping/index.js` | Appeler validation au démarrage |

---

## Critères d'Acceptation

- [ ] Fichiers manquants détectés avec message clair
- [ ] Dates.json invalide détecté (structure, format date)
- [ ] Le scraping ne démarre pas si validation échoue
- [ ] Code de sortie 1 en cas d'erreur

---

## Messages d'Erreur Attendus

```
❌ Erreurs de validation:
  - Fichier manquant: Liste des villes (./villesDeDestinations.xlsx)
  - Dates.json doit contenir un tableau non vide
  - Date 3: structure invalide (fromDate manquant)
```

---

## Liens

- [Epic 5 - Validation & Qualité](README.md)
- [INDEX](../INDEX.md)
