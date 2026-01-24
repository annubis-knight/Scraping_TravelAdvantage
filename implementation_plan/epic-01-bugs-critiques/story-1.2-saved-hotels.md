# Story 1.2 - Correction saved_hotels.json (déduplication cross-runs)

> **Epic:** [1 - Bugs Critiques](README.md)
> **Priorité:** 🔴 P0
> **Complexité:** M (2-4h)
> **Statut:** TODO

---

## Contexte

Le système de déduplication est censé fonctionner ainsi selon la documentation :
1. `saved_hotels.json` contient les hôtels précédemment scrapés (lus depuis Excel)
2. `hotels_data.json` contient les nouveaux hôtels scrapés
3. `removeDuplicates()` fusionne les deux et garde le meilleur de chaque doublon

## Problème

Le fichier `saved_hotels.json` est **toujours vide** (`{}`). La fonction `removeDuplicates()` ne reçoit donc jamais d'hôtels historiques à comparer.

### Analyse du code actuel

```javascript
// index.js ligne ~50
const savedHotels = readJsonFile('./json/saved_hotels.json');  // Toujours {}

// index.js ligne ~52
const uniqueHotels = removeDuplicates(filteredNewHotels, savedHotels);
// savedHotels est {} donc pas de vraie déduplication cross-runs
```

### Conséquence

- Les mêmes hôtels peuvent apparaître plusieurs fois dans les fichiers Excel pour différentes dates
- La comparaison "meilleure réduction" entre scraping ancien et nouveau ne fonctionne pas
- La documentation (PRD §7.6) décrit un comportement qui n'existe pas

## Solution Proposée

### Option A - Alimenter saved_hotels.json depuis Excel (Recommandé)

Avant chaque scraping d'une ville, lire le fichier Excel existant et extraire les hôtels pour les mettre dans `saved_hotels.json`.

```javascript
// Nouvelle fonction dans xslxHandle.js
async function extractHotelsFromExcel(villeExcelPath, monthSheet) {
    const workbook = new ExcelJS.Workbook();

    if (!fs.existsSync(villeExcelPath)) {
        return {};
    }

    await workbook.xlsx.readFile(villeExcelPath);
    const worksheet = workbook.getWorksheet(monthSheet);

    if (!worksheet) {
        return {};
    }

    const hotels = {};
    let itemIndex = 1;

    // Parcourir les lignes (skip header et stats)
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 1) return; // Skip header

        const values = row.values.slice(1); // ExcelJS quirk
        const nomHotel = values[0];
        const typeDeReservation = values[11]; // Colonne 12

        if (nomHotel && typeDeReservation) {
            const key = `item${itemIndex++}`;
            hotels[key] = {
                nomHotel: nomHotel,
                location: values[1],
                etoiles: values[2],
                note: values[3],
                reduction: values[4],
                prixTravel: values[5],
                prixConcurrents: values[6],
                economiesMembres: values[7],
                imageUrl: values[8],
                fromDate: values[9],
                toDate: values[10],
                typeDeReservation: typeDeReservation,
                vuLe: values[12]
            };
        }
    });

    return hotels;
}
```

### Modification dans index.js

```javascript
// Avant la boucle des dates (après ligne ~25)
const villeExcelPath = path.join(__dirname, `saveData/datasVilles/${cityData.ville}.xlsx`);

// Dans la boucle des dates, avant le scraping
const monthYear = getMonthYear(date.fromDate); // Ex: "Février_2026"
const savedHotels = await extractHotelsFromExcel(villeExcelPath, monthYear);

// Écrire dans saved_hotels.json pour traçabilité
fs.writeFileSync(
    path.join(__dirname, 'json/saved_hotels.json'),
    JSON.stringify(savedHotels, null, 2)
);
```

### Option B - Déduplication directe en mémoire

Alternative plus simple mais moins traçable : ne pas utiliser saved_hotels.json et dédupliquer directement depuis l'Excel.

---

## Fichiers à Modifier

| Fichier | Modification | Lignes |
|---------|--------------|--------|
| `src/scraping/xslxHandle.js` | Ajouter `extractHotelsFromExcel()` | Nouveau |
| `src/scraping/index.js` | Appeler `extractHotelsFromExcel()` avant scraping | ~25-30 |
| `src/scraping/index.js` | Écrire le résultat dans saved_hotels.json | ~30 |

---

## Critères d'Acceptation

- [ ] `saved_hotels.json` contient les hôtels du fichier Excel avant chaque scraping
- [ ] La déduplication compare effectivement anciens et nouveaux hôtels
- [ ] Un hôtel avec meilleure réduction remplace l'ancien
- [ ] Un hôtel avec même réduction mais prix plus bas remplace l'ancien
- [ ] Les hôtels uniques (nouveaux) sont ajoutés
- [ ] Le fichier Excel final ne contient pas de doublons par (nomHotel + type)

---

## Tests Manuels

1. **Test déduplication avec amélioration:**
   ```bash
   # 1. S'assurer qu'un hôtel existe dans Paris.xlsx avec 35% réduction
   # 2. Simuler un scraping qui retourne le même hôtel avec 40% réduction
   # 3. Vérifier que l'Excel final contient 40% (pas 35%)
   ```

2. **Test préservation si ancien meilleur:**
   ```bash
   # 1. S'assurer qu'un hôtel existe avec 45% réduction
   # 2. Scraper le même hôtel avec 30% réduction
   # 3. Vérifier que l'Excel garde 45%
   ```

3. **Test nouveau hôtel:**
   ```bash
   # 1. Scraper un nouvel hôtel non présent dans l'Excel
   # 2. Vérifier qu'il est ajouté
   ```

---

## Impact sur la Documentation

Après implémentation, mettre à jour :
- `CLAUDE.md` ligne ~116 : Confirmer que la déduplication fonctionne vraiment
- `PRD.md` §7.6 : Confirmer le flux de données

---

## Notes d'Implémentation

- La fonction `extractHotelsFromExcel` doit gérer le cas où le fichier Excel n'existe pas encore
- Attention à la structure des colonnes Excel (indexation ExcelJS commence à 1)
- Considérer ajouter un log pour visualiser combien d'hôtels sont chargés depuis l'historique
- Performance : cette opération est faite une fois par ville/mois, impact minimal

---

## Diagramme du Flux Corrigé

```
┌─────────────────┐     ┌─────────────────┐
│  {ville}.xlsx   │────▶│ extractHotels() │
│  (existant)     │     └────────┬────────┘
└─────────────────┘              │
                                 ▼
                    ┌─────────────────────┐
                    │  saved_hotels.json  │
                    │  (hôtels historiques)│
                    └──────────┬──────────┘
                               │
┌─────────────────┐            │
│  scrapeHotels() │            │
└────────┬────────┘            │
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│hotels_data.json │   │ savedHotels     │
│(nouveaux)       │   │ (historiques)   │
└────────┬────────┘   └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ removeDuplicates()  │
         │ (fusion + best pick)│
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  {ville}.xlsx       │
         │  (mis à jour)       │
         └─────────────────────┘
```

---

## Liens

- [Epic 1 - Bugs Critiques](README.md)
- [Story 1.1 - statistiques.json](story-1.1-statistiques-json.md) (fonction readJsonFileSafe réutilisable)
- [INDEX](../INDEX.md)
