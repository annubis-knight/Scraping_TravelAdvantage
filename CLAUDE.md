# CLAUDE.md

Ce fichier fournit des conseils à Claude Code (claude.ai/code) lorsqu'il travaille avec le code de ce dépôt.

## Vue d'ensemble du projet

Il s'agit d'un outil de scraping et d'analyse de données pour les réservations d'hôtels qui extrait les données depuis TravelAdvantage.com, traite les résultats et les visualise sur des cartes interactives avec Leaflet. Le projet suit les prix des hôtels dans différentes villes et à différentes dates, identifie les opportunités de réduction et génère des rapports.

## Commandes principales

### Lancement de l'application
- `node server.js` - Démarre le serveur Express (port 3000). Cela exécute automatiquement les scripts de génération de données MapLeaflet avant de démarrer le serveur.
- `npm install` - Installe les dépendances

### Flux de travail principal du scraping
- `node src/scraping/index.js` - Script principal de scraping qui orchestre l'ensemble du processus de scraping pour toutes les villes et dates
- `node src/dates/index.js` - Génère le fichier `Dates.json` en fusionnant les plages de dates de diverses sources et en supprimant les dates passées

### Génération de cartes
- `node src/MapLeaflet/index1_generateResume.js` - Lit les fichiers Excel individuels des villes et crée un résumé consolidé `resultat.xlsx`
- `node src/MapLeaflet/generateMap.js` - Convertit `resultat.xlsx` en `mapData.js` pour la visualisation Leaflet

### Composants individuels
- `node src/scraping/scrapeHotels.js` - Peut être exécuté en autonome pour tester des opérations de scraping individuelles
- `node src/geoCodingNinja/indexNinjasAPI.js` - Utilitaires de géocodage utilisant l'API Ninja

### Scripts NPM (organisés par phase)
Le package.json contient des scripts bien organisés, groupés par phase d'exécution :
- **Phase 1 (Dates)** : `npm run 1:dates`, `npm run 1:dates-check`
- **Phase 2 (Scraping)** : `npm run 2:scrape`, `npm run 2:scrape-test`
- **Phase 3 (Cartes)** : `npm run 3:map-resume`, `npm run 3:map-data`, `npm run 3:map-all`
- **Phase 4 (Serveur)** : `npm start` ou `npm run 4:start`
- **Vérifications** : `npm run check:cities`, `npm run check:results`, `npm run check:dates`
- **Utilitaires** : `npm run geocode`

### Guide d'exécution des scripts

**Règle principale : Tous les scripts s'exécutent depuis la racine du projet** (`C:\Users\ScrapingTA\Documents\Scraping\`)

Ne jamais `cd` dans un sous-répertoire avant d'exécuter un script npm ou node.

| Phase | Script npm | Commande node directe | Description | Données |
|-------|-----------|----------------------|-------------|---------|
| **0 - Installation** | `npm run 0:install` | - | Installe les dépendances | - |
| **0 - Aide** | `npm run 0:help` | - | Affiche l'aide complète | Lecture seule |

| **1 - Dates** | `npm run 1:dates` | `node src/dates/index.js` | Génère Dates.json (interactif) | ÉCRASE (fusion sources avant) |
| **1 - Vérif dates** | `npm run 1:dates-check` | - | Vérifie les dates générées | Lecture seule |

| **2 - Scraping** | `npm run 2:scrape` | `node src/scraping/index.js` | Scraping complet de toutes les villes | FUSIONNE hôtels dans Excel |
| **2 - Test scraping** | `npm run 2:scrape-test` | `node src/scraping/scrapeHotels.js` | Test de scraping individuel | ÉCRASE hotels_data.json |

| **3 - Résumé Excel** | `npm run 3:map-resume` | `node src/MapLeaflet/index1_generateResume.js` | Génère resultat.xlsx | ÉCRASE (lit sources Excel) |
| **3 - Données carte** | `npm run 3:map-data` | `node src/MapLeaflet/generateMap.js` | Génère mapData.js | ÉCRASE (lit resultat.xlsx) |
| **3 - Tout** | `npm run 3:map-all` | - | Exécute resume + data | ÉCRASE (lit sources) |

| **4 - Serveur** | `npm start` | `node server.js` | Démarre le serveur (port 3000) | Lecture seule |

| **Géocodage** | `npm run geocode` | `node src/geoCodingNinja/indexNinjasAPI.js` | Géocodage avec API Ninja | ÉCRASE coordonnées |
| **Check villes** | `npm run check:cities` | - | Liste les villes configurées | Lecture seule |
| **Check résultats** | `npm run check:results` | - | Liste les fichiers Excel générés | Lecture seule |
| **Check dates** | `npm run check:dates` | - | Affiche les dates configurées | Lecture seule |

**Légende Données** :
- **Lecture seule** : Aucune modification de fichier
- **FUSIONNE** : Combine les nouvelles données avec les existantes (pas de perte)
- **ÉCRASE** : Remplace le fichier de sortie (les sources restent intactes)

**Note technique** : Le serveur (`server.js`) gère automatiquement le changement de répertoire pour les scripts MapLeaflet via `execSync` avec l'option `cwd`. Vous n'avez pas à vous en soucier si vous utilisez `npm start`.

## Architecture

### Pipeline de flux de données

1. **Sources d'entrée**
   - `src/scraping/villesDeDestinations.xlsx` - Liste principale des villes avec coordonnées
   - `src/dates/datesAdditionnelles.csv` - Plages de dates personnalisées supplémentaires
   - `src/scraping/json/Dates.json` - Plages de dates consolidées (générées)

2. **Couche de scraping** (`src/scraping/`)
   - `index.js` - Orchestrateur principal qui boucle sur les villes et les dates
   - `scrapeHotels.js` - Scraper basé sur Puppeteer qui extrait les données d'hôtels depuis TravelAdvantage.com
   - Sorties vers `src/scraping/json/hotels_data.json` et `src/scraping/json/saved_hotels.json`
   - Captures d'écran enregistrées dans `src/scraping/saveData/images/screenshots/{ville}/{dates}/`

3. **Traitement des données**
   - `xslxHandle.js` - Opérations sur les fichiers Excel (lecture/écriture/formatage)
   - `stats.js` - Collecte et agrégation des statistiques
   - `formatDate.js` - Utilitaires de formatage de dates
   - Fichiers Excel de sortie : `src/scraping/saveData/datasVilles/{ville}.xlsx` (un par ville)

4. **Couche d'agrégation** (`src/MapLeaflet/`)
   - `index1_generateResume.js` - Lit tous les fichiers Excel des villes et crée `resultat.xlsx` avec des feuilles mensuelles
   - `generateMap.js` - Transforme `resultat.xlsx` en `mapData.js` pour la visualisation web

5. **Présentation web**
   - Serveur Express (`server.js`) sert l'application
   - `src/MapLeaflet/index2.html` - Interface principale de la carte interactive
   - `src/MapLeaflet/templateBrevo.html` - Vue du modèle d'email
   - `src/assets/js/map.js` et `map2.js` - Initialisation et interaction de la carte Leaflet

### Modèles architecturaux clés

**Stratégie de scraping Puppeteer**
- Utilise un répertoire de données utilisateur persistant (`./user_data`) pour la gestion de session
- S'exécute en mode headless avec un viewport 1680x920
- Extrait les cartes d'hôtels depuis les éléments `.hotel_search_list .list_card`
- Capture : nom, localisation, étoiles, note, pourcentage de réduction, prix, économies membres, images

**Types de réservation**
- Type 1 : Weekend
- Type 2 : Semaine
- Type 3 : 2 Semaines

**Logique de déduplication des hôtels** (dans `src/scraping/index.js`)
- Les hôtels sont dédupliqués par `nomHotel` + `typeDeReservation` (voir fonction `removeDuplicates()` ligne 113)
- Quand des doublons existent, `compareHotels()` (ligne 92) détermine le meilleur :
  - Priorité à la meilleure réduction
  - Si réduction égale, priorité au prix le plus bas
- Fonction `filterHotels()` (ligne 147) supprime les valeurs aberrantes (hôtels avec prix > 2x la moyenne)
- Les résultats sont triés par pourcentage de réduction décroissant pour chaque type de réservation

**Structure Excel**
- Chaque ville a son propre fichier Excel avec des feuilles mensuelles
- La ligne 1 contient les statistiques récapitulatives (B1, C1, D1 pour Weekend%, Semaine%, 2 Semaines%)
- Les lignes 2+ contiennent les données des hôtels
- Colonne 12 : type de réservation (1/2/3)
- Colonne 5 : pourcentage de réduction

**Format des données de carte**
- Organisées par mois-année (ex : "janvier_2025")
- Chaque entrée de ville inclut : ville, country, lat, lon, pourcentages[Weekend%, Semaine%, 2 Semaines%]
- Les pourcentages > 40% sont mis en gras dans la sortie Excel

## Emplacements importants des données

- Villes en entrée : `src/scraping/villesDeDestinations.xlsx`
- Dates en entrée : `src/scraping/json/Dates.json` (auto-généré depuis `src/dates/`)
- Données scrapées : `src/scraping/json/hotels_data.json` et `saved_hotels.json`
- Résultats par ville : `src/scraping/saveData/datasVilles/{ville}.xlsx`
- Résultats consolidés : `src/MapLeaflet/resultat.xlsx`
- Données de carte : `src/MapLeaflet/mapData.js`
- Captures d'écran : `src/scraping/saveData/images/screenshots/`
- JSON des coordonnées des villes : `src/assets/js/villesDeDestinations.json`

## Routes du serveur Express

- `GET /` - Sert l'interface principale de la carte (`index2.html`)
- `POST /saveSelectedCities` - Reçoit les villes sélectionnées par l'utilisateur depuis la carte
- `GET /getHotelsData` - Retourne les données Excel pour les villes sélectionnées (utilise `processExcelData`)
- `GET /getCitiesData` - Retourne les coordonnées des villes depuis le JSON
- `GET /templateBrevo` - Sert la vue du modèle d'email

## Notes de développement

**Considérations sur le scraping**
- Les URLs de TravelAdvantage.com suivent le pattern : `/hotel/search/{ville},%20{pays}?search_type=city&lat={lat}&lon={lon}&from_date={YYYY-MM-DD}&to_date={YYYY-MM-DD}&adults=2&children=0&rooms=1`
- Le scraper attend le sélecteur `.hotel_search_list .list_card` avant l'extraction
- Délai d'1 seconde entre les opérations de scraping
- Les captures d'écran sont compressées à qualité 40 (JPEG)

**Gestion des dates**
- Les dates antérieures à aujourd'hui sont automatiquement filtrées
- La fusion des dates supprime les doublons basés sur fromDate + toDate + type
- Les dates sont triées par type d'abord, puis par fromDate

**Références de cellules Excel**
- Lors de la lecture Excel, noter qu'ExcelJS utilise une indexation commençant à 1
- `row.values.slice(1)` est utilisé pour ignorer le premier élément (index 0) qui est undefined dans ExcelJS

**Cycle de vie complet du serveur**
Le serveur (`server.js`) exécute automatiquement au démarrage :
1. Génération de `resultat.xlsx` via `index1_generateResume.js` (ligne 16)
2. Génération de `mapData.js` via `generateMap.js` (ligne 28)
3. Démarrage du serveur Express sur le port 3000 (ligne 121)

Cela garantit que les données de carte sont toujours à jour au lancement du serveur.
