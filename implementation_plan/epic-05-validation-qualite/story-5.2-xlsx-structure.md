# Story 5.2 - Validation Structure Excel

> **Epic:** [5 - Validation & Qualité](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** S (1-2h)
> **Statut:** TODO
> **Dépendances:** [Story 5.1](story-5.1-input-validation.md)

---

## Contexte

Le fichier `villesDeDestinations.xlsx` doit avoir des colonnes spécifiques (ville, country, lat, lon, googlePlacesCountry). Une colonne manquante ou mal nommée cause des erreurs silencieuses.

## Solution Proposée

```javascript
// Dans validators.js

const REQUIRED_COLUMNS = {
    villesDeDestinations: {
        A: 'ville',
        B: 'country',
        C: 'latitude',
        D: 'longitude',
        E: 'googlePlacesCountry'
    }
};

async function validateExcelStructure(filePath, expectedColumns) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        return { valid: false, error: 'Aucune feuille trouvée' };
    }

    const errors = [];
    const headerRow = worksheet.getRow(1);

    for (const [col, expectedName] of Object.entries(expectedColumns)) {
        const cell = headerRow.getCell(col);
        const value = cell.value?.toString().toLowerCase().trim();

        if (!value) {
            errors.push(`Colonne ${col} vide (attendu: ${expectedName})`);
        }
        // Optionnel: vérifier le nom exact
    }

    // Vérifier qu'il y a des données
    if (worksheet.rowCount < 2) {
        errors.push('Aucune donnée (seulement l\'en-tête)');
    }

    return { valid: errors.length === 0, errors };
}
```

---

## Fichiers à Modifier

| Fichier | Action |
|---------|--------|
| `src/scraping/validators.js` | Ajouter validateExcelStructure |

---

## Critères d'Acceptation

- [ ] Colonnes obligatoires vérifiées (A-E)
- [ ] Message clair si colonne manquante
- [ ] Vérifie qu'il y a au moins une ligne de données
- [ ] Coordonnées (lat/lon) vérifiées comme numériques

---

## Liens

- [Epic 5 - Validation & Qualité](README.md)
- [INDEX](../INDEX.md)
