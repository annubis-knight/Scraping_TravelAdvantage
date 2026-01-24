# Story 1.3 - Suppression écriture Excel en boucle

> **Epic:** [1 - Bugs Critiques](README.md)
> **Priorité:** 🟠 P1
> **Complexité:** XS (< 1h)
> **Statut:** TODO

---

## Contexte

Le fichier `villesDeDestinations.xlsx` contient la liste des villes à scraper avec leurs coordonnées. Ce fichier est lu au début du processus de scraping.

## Problème

Dans `src/scraping/index.js`, le fichier est réécrit à chaque itération de la boucle des villes, sans aucune modification du contenu :

```javascript
// index.js ligne ~17-19
for (const row of worksheet.eachRow) {
    // ...
    await inputWorkbook.xlsx.writeFile(path.join(__dirname, 'villesDeDestinations.xlsx'));
    // ↑ Cette ligne est DANS la boucle !
}
```

### Impact

- **Performance:** ~50+ écritures disque inutiles par run (une par ville)
- **Risque:** Corruption potentielle si interruption pendant l'écriture
- **I/O:** Usure inutile du disque (surtout si SSD)

### Analyse

Le workbook `inputWorkbook` n'est jamais modifié entre les écritures. Cette ligne semble être un vestige de développement ou une erreur de placement.

## Solution Proposée

**Supprimer la ligne** ou la déplacer hors de la boucle si une écriture est vraiment nécessaire (ex: mise à jour de la colonne `lastScraped`).

### Option A - Suppression simple (Recommandé)

Si aucune modification n'est faite au workbook, simplement supprimer la ligne :

```javascript
// Avant
for (const row of worksheet.eachRow) {
    const cityData = extractCityData(row);
    await inputWorkbook.xlsx.writeFile(path.join(__dirname, 'villesDeDestinations.xlsx')); // SUPPRIMER
    // ... reste du code
}

// Après
for (const row of worksheet.eachRow) {
    const cityData = extractCityData(row);
    // ... reste du code (pas d'écriture)
}
```

### Option B - Déplacement hors boucle

Si l'intention était de sauvegarder après traitement (ex: lastScraped) :

```javascript
// Après la boucle des villes
for (const row of worksheet.eachRow) {
    const cityData = extractCityData(row);
    // Mise à jour lastScraped si nécessaire
    row.getCell('G').value = new Date().toISOString();
    // ... reste du code
}

// UNE SEULE écriture à la fin
await inputWorkbook.xlsx.writeFile(path.join(__dirname, 'villesDeDestinations.xlsx'));
console.log('[INFO] villesDeDestinations.xlsx mis à jour');
```

---

## Fichiers à Modifier

| Fichier | Modification | Ligne |
|---------|--------------|-------|
| `src/scraping/index.js` | Supprimer ou déplacer l'appel `writeFile` | ~19 |

---

## Critères d'Acceptation

- [ ] Le fichier `villesDeDestinations.xlsx` n'est plus écrit à chaque itération de ville
- [ ] Le scraping fonctionne normalement
- [ ] Performance améliorée (moins d'I/O)
- [ ] Si Option B choisie : le fichier est écrit une seule fois à la fin avec `lastScraped` mis à jour

---

## Tests Manuels

1. **Test performance:**
   ```bash
   # Avant correction: observer les écritures disque (Process Monitor ou équivalent)
   npm run 2:scrape
   # Après correction: vérifier qu'il n'y a plus d'écritures répétées
   ```

2. **Test fonctionnel:**
   ```bash
   # Lancer le scraping complet
   npm run 2:scrape
   # Vérifier que toutes les villes sont traitées
   # Vérifier que les fichiers Excel de résultats sont générés
   ```

---

## Notes d'Implémentation

- Correction triviale mais impact significatif sur les performances
- Si Option B choisie, s'assurer que la colonne G (lastScraped) existe dans le fichier Excel
- Considérer ajouter un log pour confirmer la sauvegarde finale

---

## Liens

- [Epic 1 - Bugs Critiques](README.md)
- [INDEX](../INDEX.md)
