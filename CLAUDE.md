# CLAUDE.md

Ce fichier fournit des conseils à Claude Code (claude.ai/code) pour ce dépôt.

## Vue d'ensemble

Outil de scraping et d'analyse de données pour les réservations d'hôtels.
Extrait les données depuis TravelAdvantage.com, les visualise sur cartes Leaflet.

## Commandes essentielles

```bash
npm run 2:scrape    # Scraping complet
npm run 1:dates     # Génère Dates.json (interactif)
npm start           # Serveur (port 3000)
```

**Guide complet des scripts:** [docs/SCRIPTS.md](docs/SCRIPTS.md)

## Documentation

| Document | Contenu |
|----------|---------|
| [PRD.md](docs/PRD.md) | Spécifications produit |
| [TECHNICAL.md](docs/TECHNICAL.md) | Référence technique (sélecteurs, timeouts, modèle données) |
| [SCRAPING_FLOW.md](docs/SCRAPING_FLOW.md) | Flux d'exécution détaillé |
| [SCRIPTS.md](docs/SCRIPTS.md) | Guide des scripts npm |
| [CDC.md](docs/CDC.md) | Cahier des charges |

## Emplacements clés des données

| Type | Chemin |
|------|--------|
| Villes (entrée) | `src/scraping/villesDeDestinations.xlsx` |
| Dates (entrée) | `src/scraping/json/Dates.json` |
| Résultats/ville | `src/scraping/saveData/datasVilles/{ville}.xlsx` |
| Résumé consolidé | `src/MapLeaflet/resultat.xlsx` |
| Données carte | `src/MapLeaflet/mapData.js` |

## Notes pour le développement

**Exécution des scripts**
- Tous les scripts s'exécutent depuis la racine du projet
- Ne jamais `cd` dans un sous-répertoire avant d'exécuter npm/node

**URL de scraping TravelAdvantage**
```
/hotel/search/{ville},%20{pays}?search_type=city&lat={lat}&lon={lon}&from_date={YYYY-MM-DD}&to_date={YYYY-MM-DD}&adults=2&children=0&rooms=1
```

**Gestion des dates**
- Dates passées automatiquement filtrées
- Déduplication basée sur fromDate + toDate + type
- Types: 1=Weekend, 2=Semaine, 3=2 Semaines

**Lecture Excel (ExcelJS)**
- Indexation commence à 1 (pas 0)
- `row.values.slice(1)` pour ignorer l'index 0 qui est undefined
- Colonne 12 = type de réservation, Colonne 5 = % réduction

**Sélecteur CSS principal**
- Conteneur hôtels: `.hotel_search_list .list_card`
- Détails des sélecteurs: voir [TECHNICAL.md](docs/TECHNICAL.md#2-sélecteurs-css-traveladvantage)

**Cycle de vie serveur**
Au démarrage, `server.js` génère automatiquement `resultat.xlsx` et `mapData.js` avant de lancer Express sur le port 3000.
