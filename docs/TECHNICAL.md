# Référence Technique

**Version:** 1.0 | **Date:** Janvier 2026

Ce document centralise toutes les informations techniques du projet : architecture, sélecteurs CSS, timeouts, modèle de données.

---

## 1. Architecture du Code

### Structure des répertoires

```
Scraping/
├── server.js                         # Serveur Express (port 3000)
├── package.json, CLAUDE.md
├── docs/
│   ├── PRD.md                        # Spécifications produit
│   ├── TECHNICAL.md                  # Référence technique (ce fichier)
│   ├── SCRAPING_FLOW.md              # Flux d'exécution détaillé
│   ├── SCRIPTS.md                    # Guide des scripts npm
│   └── CDC.md                        # Cahier des charges
├── src/
│   ├── scraping/
│   │   ├── index.js                  # Orchestrateur scraping
│   │   ├── scrapeHotels.js           # Logique Puppeteer
│   │   ├── stats.js, xslxHandle.js, formatDate.js
│   │   ├── villesDeDestinations.xlsx # INPUT: liste villes
│   │   ├── user_data/                # Session Puppeteer
│   │   ├── json/
│   │   │   ├── Dates.json            # INPUT: dates consolidées
│   │   │   ├── hotels_data.json      # TEMP: dernier scrape
│   │   │   ├── saved_hotels.json     # TEMP: hôtels depuis Excel
│   │   │   └── statistiques.json     # OUTPUT: stats cumulées
│   │   └── saveData/
│   │       ├── datasVilles/{ville}.xlsx  # OUTPUT: résultats/ville
│   │       └── images/screenshots/{ville}/screenshots_YYYY-MM-DD/
│   ├── dates/
│   │   ├── index.js                  # Fusion sources dates
│   │   ├── getDates.js               # Générateur interactif
│   │   ├── remplirJSON.js            # Parser CSV
│   │   └── datesAdditionnelles.csv
│   ├── MapLeaflet/
│   │   ├── index1_generateResume.js  # Génère resultat.xlsx
│   │   ├── generateMap.js            # Génère mapData.js
│   │   ├── resultat.xlsx, mapData.js
│   │   ├── index2.html               # Interface carte
│   │   └── templateBrevo.html        # Template email
│   ├── assets/js/
│   │   ├── map2.js                   # Logique Leaflet
│   │   ├── getHotelsXslx.js          # Récup données Excel
│   │   ├── templateBrevo.js
│   │   └── villesDeDestinations.json
│   └── geoCodingNinja/indexNinjasAPI.js
```

### Modules principaux

| Module | Fichier | Responsabilité |
|--------|---------|----------------|
| Orchestrateur | `src/scraping/index.js` | Boucle villes×dates, coordination |
| Scraper | `src/scraping/scrapeHotels.js` | Extraction Puppeteer |
| Stats | `src/scraping/stats.js` | Calculs statistiques |
| Excel | `src/scraping/xslxHandle.js` | Lecture/écriture Excel |
| Dates | `src/dates/index.js` | Fusion et filtrage dates |
| Résumé | `src/MapLeaflet/index1_generateResume.js` | Agrégation multi-villes |
| Carte | `src/MapLeaflet/generateMap.js` | Génération mapData.js |
| Serveur | `server.js` | Express, routes API |

---

## 2. Sélecteurs CSS (TravelAdvantage)

**Conteneur principal:** `.hotel_search_list .list_card`

| Sélecteur CSS | Champ extrait | Valeur par défaut |
|---------------|---------------|-------------------|
| `h4.not-select` | nomHotel | "Nom non disponible" |
| `p span.w-auto` | location | "Emplacement non disponible" |
| `.score span` | note | "Note non disponible" |
| `.saving_per span` | reduction | "Économies non disponibles" |
| `.list_price .price_pay li:last-child span` | prixTravel | "Prix non disponible" |
| `.price_detail li:first-child span` | prixConcurrents | "Prix normal non disponible" |
| `.price_detail li:nth-child(2) span` | economiesMembres | "Économies membres non disponibles" |
| `.star_rating.star_{n}` | etoiles | "Non spécifié" |
| `.list_img img` | imageUrl | null |

**Champs ajoutés automatiquement:** `fromDate`, `toDate`, `typeDeReservation`, `vuLe`

---

## 3. Configuration

### Timeouts

| Opération | Timeout | Fichier |
|-----------|---------|---------|
| `page.goto()` | 60s | scrapeHotels.js |
| `waitForSelector()` | 240s | scrapeHotels.js |
| Délai post-selector | 10s | scrapeHotels.js |
| Délai entre scrapings | 1s | index.js |
| **Total max/ville/date** | **~311s (~5min)** | |

### Limites et seuils

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| Prix max | 2× moyenne | Filtrage hôtels aberrants |
| Top hôtels | 10 | Par type de réservation |
| Réduction gras | > 40% | Mise en forme Excel/carte |
| Qualité screenshots | 40 | Compression JPEG |
| Viewport | 1680×920 | Chrome Puppeteer |

### URL de scraping

```
https://www.traveladvantage.com/hotel/search/{ville},%20{pays}?search_type=city&lat={lat}&lon={lon}&from_date={YYYY-MM-DD}&to_date={YYYY-MM-DD}&adults=2&children=0&rooms=1&lang=FR
```

---

## 4. Modèle de Données

### villesDeDestinations.xlsx

| Colonne | Champ | Type | Exemple |
|---------|-------|------|---------|
| A | ville | string | "Paris" |
| B | country | string | "France" |
| C | latitude | float | 48.8566 |
| D | longitude | float | 2.3522 |
| E | googlePlacesCountry | string | "FR" |
| G | lastScraped | datetime | 2026-01-20 |

### Dates.json

```json
[
  { "date": { "fromDate": "2026-02-07", "toDate": "2026-02-09", "type": 1 } },
  { "date": { "fromDate": "2026-02-07", "toDate": "2026-02-14", "type": 2 } },
  { "date": { "fromDate": "2026-02-07", "toDate": "2026-02-21", "type": 3 } }
]
```

**Types de réservation:**
| Type | Label | Durée |
|------|-------|-------|
| 1 | Weekend | Ven→Dim (2 nuits) |
| 2 | Semaine | Ven→Ven+7 (7 nuits) |
| 3 | 2 Semaines | Ven→Ven+14 (14 nuits) |

### hotels_data.json

```json
{
  "item1": {
    "nomHotel": "Hotel Example",
    "location": "Centre-ville",
    "etoiles": 4,
    "note": "8.5",
    "reduction": "35%",
    "prixTravel": "150 €",
    "prixConcurrents": "230 €",
    "economiesMembres": "80 €",
    "imageUrl": "https://...",
    "fromDate": "2026-02-07",
    "toDate": "2026-02-09",
    "typeDeReservation": 1,
    "vuLe": "2026-01-20 14:30"
  }
}
```

### {Ville}.xlsx - Structure onglet mensuel

```
┌──────────────────────────────────────────────────────────┐
│ Ligne 1: [Mois] | Weekend% | Semaine% | 2 Semaines%      │
├──────────────────────────────────────────────────────────┤
│ Section Weekend (vert)    : en-tête + top 10 hôtels      │
│ Section Semaine (bleu)    : en-tête + top 10 hôtels      │
│ Section 2 Semaines (orange): en-tête + top 10 hôtels     │
│ Statistiques détaillées                                  │
└──────────────────────────────────────────────────────────┘
```

**Colonnes hôtels:**
- Colonne 5 : pourcentage de réduction
- Colonne 12 : type de réservation (1/2/3)

### statistiques.json

```json
{
  "Paris": {
    "Janvier_2026": {
      "1": {
        "plage_reductions_page": "[15%-45%]",
        "moyenne_reductions": "28.50%",
        "moyenne_prix": "195.30€",
        "nombre_echantillons_page": 25
      },
      "2": { "..." },
      "3": { "..." }
    }
  }
}
```

### mapData.js

```javascript
const mapData = {
  "Janvier_2026": [
    {
      "ville": "Paris",
      "country": "France",
      "lat": 48.8566,
      "lon": 2.3522,
      "pourcentages": [42, 38, 35]  // [Weekend%, Semaine%, 2Semaines%]
    }
  ]
};
```

---

## 5. Algorithmes

### Filtrage des prix aberrants

```javascript
// filterHotels() - src/scraping/index.js
1. Calcul moyenne des prix de la page
2. Exclusion si prix > 2 × moyenne
```

### Déduplication

```javascript
// removeDuplicates() - src/scraping/index.js
1. Clé unique: nomHotel.toLowerCase() + "_" + typeDeReservation
2. Si doublon → compareHotels():
   - Priorité: meilleure réduction
   - Si égalité: prix le plus bas
3. Tri par réduction décroissante
4. Groupement par type: {1: [...], 2: [...], 3: [...]}
```

---

## 6. Flux des fichiers

| Fichier | Mode | Description |
|---------|------|-------------|
| villesDeDestinations.xlsx | ENTRÉE | Liste villes avec coordonnées |
| Dates.json | ENTRÉE | Plages de dates consolidées |
| hotels_data.json | ÉCRASÉ | Données du dernier scrape |
| saved_hotels.json | ÉCRASÉ | Hôtels de l'onglet mensuel courant |
| statistiques.json | FUSIONNÉ | Stats cumulées par ville/mois |
| {ville}.xlsx | FUSIONNÉ | Résultats par ville |
| resultat.xlsx | ÉCRASÉ | Résumé consolidé |
| mapData.js | ÉCRASÉ | Données carte Leaflet |

---

*TECHNICAL.md v1.0 - Janvier 2026*
