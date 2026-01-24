# PRD - Scraping TravelAdvantage

**Version:** 1.2 | **Date:** Janvier 2026 | **Statut:** Production

**Sommaire:** [1.Introduction](#1-introduction) | [2.Contexte](#2-contexte-et-problématique) | [3.Objectifs](#3-objectifs) | [4.Utilisateurs](#4-utilisateurs-cibles) | [5.Fonctionnalités](#5-fonctionnalités-principales) | [6.Architecture](#6-architecture-technique) | [7.Workflows](#7-workflows-et-flux-de-données) | [8.API](#8-api-et-routes) | [9.UI](#9-interface-utilisateur) | [10.Dépendances](#10-dépendances-techniques) | [11.Cas usage](#11-cas-dutilisation) | [12.Contraintes](#12-contraintes-et-limitations) | [13.Métriques](#13-métriques-de-succès) | [14.Roadmap](#14-roadmap) | [15.Glossaire](#15-glossaire) | [Annexes](#annexes)

---

## 1. Introduction

Outil de scraping et d'analyse des prix hôteliers depuis TravelAdvantage.com avec visualisation cartographique interactive. Identifie les meilleures réductions pour 3 types de séjours (weekend, semaine, 2 semaines) dans plusieurs villes mondiales.

**Portée:** Scraping automatisé, traitement/agrégation des données, visualisation Leaflet, génération de templates email.

---

## 2. Contexte et Problématique

**Problèmes identifiés:**
- Comparaison multi-destinations complexe et chronophage
- Fluctuation des prix selon périodes/types de séjours
- Absence d'outil centralisé pour identifier les meilleures offres

**Solution:** Système automatisé qui scrape TravelAdvantage.com, analyse les réductions par type de séjour, visualise sur carte interactive, et génère rapports/templates email.

**Proposition de valeur:** Automatisation complète | Centralisation des données | Analyse visuelle (carte colorée) | Historisation | Export email

---

## 3. Objectifs

| ID | Objectif | Indicateur |
|----|----------|------------|
| O1 | Automatiser collecte prix | 100% villes scrapées |
| O2 | Identifier meilleures réductions | Réductions >40% en évidence |
| O3 | Visualiser géographiquement | Carte interactive fonctionnelle |
| O4 | Faciliter communication client | Templates email générés |

**Objectifs secondaires:** Réduction 90% temps recherche manuel, filtrage type/pourcentage, historique prix, ajout facile de destinations.

---

## 4. Utilisateurs Cibles

**Persona principal - Agent de voyage:** Professionnels tourisme, comparaison multi-destinations, usage quotidien/hebdomadaire. Besoins: vue consolidée, filtrage budget/type, export rapide.

**Persona secondaire - Gestionnaire marketing:** Création newsletters/campagnes. Besoins: données formatées email (Brevo), sélection visuelle, export JSON pour CRM.

---

## 5. Fonctionnalités Principales

### F1 - Scraping automatisé (P0)
**Déclencheur:** `npm run 2:scrape`

**Données extraites par hôtel:** nomHotel, location, etoiles (0-5), note, reduction (%), prixTravel, prixConcurrents, economiesMembres, imageUrl, dates séjour, typeDeReservation (1/2/3)

> **Détails techniques:** Voir [TECHNICAL.md](TECHNICAL.md) pour les sélecteurs CSS et timeouts.

### F2 - Gestion des dates (P0)
**Déclencheur:** `npm run 1:dates`

**Sources:**
1. `getDates.js` (interactif) - Génère weekends d'un mois + 3 types de séjours par vendredi
2. `datesAdditionnelles.csv` (séparateur `;`, format JJ/MM/AAAA)

**Types de séjours:**
| Type | Label | Durée |
|------|-------|-------|
| 1 | Weekend | Ven→Dim (2 nuits) |
| 2 | Semaine | Ven→Ven+7 (7 nuits) |
| 3 | 2 Semaines | Ven→Ven+14 (14 nuits) |

### F3 - Déduplication et tri (P0)
**Clé unique:** `nomHotel.toLowerCase() + "_" + typeDeReservation`

**Règles comparaison doublons:** 1) Meilleure réduction prioritaire 2) Si égal → prix le plus bas

**Filtrage aberrants:** Exclusion si prix > 2× moyenne page

### F4 - Calcul statistiques (P1)
**Métriques calculées:** Plage réductions (page + top5), moyenne réductions (page + top5), plage prix (page + top5), moyenne prix (page + top5), moyenne étoiles, nombre échantillons

### F5 - Résumé Excel consolidé (P0)
**Source:** `src/scraping/saveData/datasVilles/*.xlsx` → **Sortie:** `src/MapLeaflet/resultat.xlsx`

**Structure:** Un onglet/mois, colonnes: Ville | Weekend% | Semaine% | 2 Semaines%, gras si >40%

### F6 - Génération données carte (P0)
**Source:** `resultat.xlsx` → **Sortie:** `mapData.js`

**Format:** `{ "Mois_Année": [{ ville, country, lat, lon, pourcentages: [Weekend%, Semaine%, 2Semaines%] }] }`

### F7 - Carte interactive Leaflet (P0)
**URL:** http://localhost:3000/

**Fonctionnalités:** Marqueurs colorés (code couleur réduction), clustering, filtres type (checkboxes), filtre % (min-max), navigation mensuelle, popups interactifs

**Code couleur:** Rouge ≥40% | Orange 30-39% | Jaune 20-29% | Vert <20%

### F8 - Sélection villes et templates (P1)
**Workflow:** Clic marqueurs → coche types → liste sélections sidebar → "Créer Template" → envoi serveur → ouverture templateBrevo.html

---

## 6. Architecture Technique

**Stack:** Node.js | Puppeteer (Chrome) | Express.js | HTML/CSS/JS vanilla | Leaflet.js + MarkerCluster | ExcelJS | csv-parser

**Flux global:** Sources (xlsx+json) → Scraping (Puppeteer) → Traitement (stats, dédup) → Stockage Excel par ville → Agrégation (resultat.xlsx) → Génération carte (mapData.js) → Serveur Express → Interface web Leaflet

> **Structure des répertoires et modules:** Voir [TECHNICAL.md](TECHNICAL.md#1-architecture-du-code)

---

## 7. Workflows et Flux de Données

### 7.1 Workflow opérationnel global

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   PHASE 1    │     │   PHASE 2    │     │   PHASE 3    │     │   PHASE 4    │
  │    DATES     │────▶│   SCRAPING   │────▶│  AGRÉGATION  │────▶│   SERVEUR    │
  │  npm run 1:  │     │  npm run 2:  │     │  npm run 3:  │     │  npm start   │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Dates.json   │     │ {ville}.xlsx │     │resultat.xlsx │     │ Interface    │
  │              │     │ stats.json   │     │ mapData.js   │     │ Leaflet      │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

> **Workflows détaillés (scraping, interface, gestion erreurs):** Voir [SCRAPING_FLOW.md](SCRAPING_FLOW.md)

### 7.2 Pipeline de données (résumé)

**Phase 1 (Dates):** getDates.js (interactif) + remplirJSON.js (CSV) → index.js (fusion, dédup, tri) → Dates.json

**Phase 2 (Scraping):** Pour chaque ville × date: Puppeteer → filterHotels → removeDuplicates → {ville}.xlsx + statistiques.json

**Phase 3 (Agrégation):** datasVilles/*.xlsx → resultat.xlsx → mapData.js

> **Modèle de données détaillé:** Voir [TECHNICAL.md](TECHNICAL.md#4-modèle-de-données)

---

## 8. API et Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Page carte (index2.html) |
| POST | `/saveSelectedCities` | Sauvegarde sélections → `{success:true}` |
| GET | `/getHotelsData` | Données Excel villes sélectionnées → JSON array |
| GET | `/getCitiesData` | Coordonnées villes → JSON |
| GET | `/templateBrevo` | Page template email |

### POST /saveSelectedCities - Body
```json
{ "Mois_Année": { "Ville": { "country": "...", "types": [{ "type": "Weekend", "pourcentage": 42 }] } } }
```

### GET /getHotelsData - Response
```json
[{ "ville": "...", "dateAnnee": "...", "typeDeReservation": "Weekend", "pourcentage": 42, "excelData": [...], "country": "...", "latitude": ..., "longitude": ..., "googlePlacesCountry": "..." }]
```

---

## 9. Interface Utilisateur

### Carte interactive (index2.html)
**Layout:** Carte Leaflet (centre) + légende (bas-droite) + boutons mois + filtres (checkboxes type + inputs % min/max) + sidebar sélections + bouton "Créer Template"

**Interactions:**
- Clic marqueur → popup détails + checkboxes
- Coche type → ajout liste sélections
- Clic bouton mois → màj marqueurs
- Modification filtres → màj marqueurs visibles
- Clic × sélection → retrait
- "Créer Template" → envoi + ouverture templateBrevo

### Template Brevo
Interface visualisation/export données sélectionnées en JSON pour intégration email.

---

## 10. Dépendances Techniques

### npm packages
| Package | Version | Usage |
|---------|---------|-------|
| express | ^4.21.0 | Serveur HTTP |
| puppeteer | ^23.2.0 | Chrome headless |
| exceljs | ^4.4.0 | Lecture/écriture Excel |
| body-parser | ^1.20.3 | Parsing JSON |
| csv-parser | ^3.0.0 | Lecture CSV |
| csv-writer | ^1.6.0 | Écriture CSV |
| leaflet | ^1.9.4 | Cartographie |
| leaflet.markercluster | ^1.5.3 | Clustering |
| node-fetch | ^2.7.0 | HTTP serveur |
| file-saver | ^2.0.5 | Export client |

### Prérequis système
Node.js ≥18.x | Chrome (auto-installé Puppeteer) | Connexion internet | ~500MB espace disque

---

## 11. Cas d'Utilisation

### UC1: Cycle complet scraping
**Acteur:** Opérateur | **Préconditions:** Node.js, npm install, villesDeDestinations.xlsx configuré

**Flux:**
1. `npm run 1:dates` → saisir nb mois → Dates.json généré
2. `npm run 2:scrape` → pour chaque ville×date: Chrome, extraction, Excel, screenshot
3. `npm start` → génération auto resultat.xlsx + mapData.js → serveur http://localhost:3000

### UC2: Consultation carte
**Acteur:** Agent voyage | **Préconditions:** Serveur démarré, données disponibles

**Flux:** Accès localhost:3000 → carte avec marqueurs → clic mois → ajuste filtres → clic marqueur → coche types → répéter → "Créer Template" → nouvelle fenêtre données formatées

### UC3: Ajout nouvelle ville
**Acteur:** Admin | **Préconditions:** Accès villesDeDestinations.xlsx, coords GPS

**Flux:** Ouvrir Excel → ajouter ligne (ville, pays, lat, lon, code pays) → sauvegarder → relancer scraping

---

## 12. Contraintes et Limitations

### Contraintes techniques
| Contrainte | Description | Impact |
|------------|-------------|--------|
| Rate limiting | TravelAdvantage peut bloquer | Délai 1s entre scrapes |
| Changements DOM | Sélecteurs CSS peuvent changer | Maintenance requise |
| Mémoire | Chrome consomme RAM | Limiter nb villes |
| Stockage | Screenshots accumulent | Nettoyage périodique |

> **Timeouts configurés:** Voir [TECHNICAL.md](TECHNICAL.md#3-configuration)

### Limitations
| Limitation | Workaround |
|------------|------------|
| 1ère page seulement | Pagination à implémenter |
| Pas de cron intégré | Task Scheduler externe |
| Mode headless détecté | Mode non-headless |
| Langue FR uniquement | Paramétrable dans URL |

### Risques
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Site bloqué | Moyenne | Élevé | Retry logic, alertes |
| Changement HTML | Élevée | Élevé | Tests sélecteurs réguliers |
| Données incomplètes | Moyenne | Moyen | Validation, logs détaillés |

---

## 13. Métriques de Succès

### KPIs opérationnels
| Métrique | Objectif |
|----------|----------|
| Taux succès scraping | >95% |
| Temps moyen/ville | <60s |
| Disponibilité serveur | >99% |
| Fraîcheur données | <24h |

### KPIs utilisateur
| Métrique | Objectif |
|----------|----------|
| Temps chargement carte | <3s |
| Nb villes affichées | >50 |
| Filtres fonctionnels | 100% |

---

## 14. Roadmap

### v1.0 (actuel)
- Scraping multi-villes
- 3 types réservation
- Carte Leaflet
- Filtres type/%
- Export template email
- Stats ville/date

### v1.x (évolutions)
| Fonctionnalité | Priorité | Complexité |
|----------------|----------|------------|
| Pagination résultats | P1 | Moyenne |
| Planification auto (cron) | P1 | Faible |
| Alertes email si réduction > seuil | P2 | Moyenne |
| Historique prix (graphiques) | P2 | Élevée |
| Export PDF rapports | P3 | Moyenne |

### v2.0 (vision)
Interface admin web | Comparaison multi-sources (Booking, Expedia) | ML prédiction prix | App mobile

---

## 15. Glossaire

| Terme | Définition |
|-------|------------|
| TravelAdvantage | Site source données hôtelières |
| Puppeteer | Lib Node.js contrôle Chrome |
| Scraping | Extraction auto données web |
| Leaflet | Lib JS cartographie |
| MarkerCluster | Plugin Leaflet regroupement marqueurs |
| ExcelJS | Lib manipulation Excel |
| Brevo | Plateforme email marketing (ex Sendinblue) |
| Type réservation | Durée séjour (1=Weekend, 2=Semaine, 3=2 Semaines) |
| Réduction | % économie vs prix concurrent |
| Top 5 | 5 meilleurs hôtels par réduction/type |

---

## Annexes

### A. Commandes npm

Voir [SCRIPTS.md](SCRIPTS.md) pour le guide complet des commandes.

**Commandes essentielles:**
```bash
npm run 1:dates      # Génère Dates.json (interactif)
npm run 2:scrape     # Scraping complet
npm start            # Serveur port 3000
```

### B. Configuration villes

Éditer `src/scraping/villesDeDestinations.xlsx`:
| Ville | Pays | Lat | Lon | Code |
|-------|------|-----|-----|------|
| Paris | France | 48.8566 | 2.3522 | FR |
| Londres | Royaume-Uni | 51.5074 | -0.1278 | GB |

### C. Format dates additionnelles

Fichier `src/dates/datesAdditionnelles.csv` (séparateur `;`):
```
07/02/2026;09/02/2026;1
14/02/2026;16/02/2026;1
07/02/2026;14/02/2026;2
```

---

*PRD v1.2 - Janvier 2026*
