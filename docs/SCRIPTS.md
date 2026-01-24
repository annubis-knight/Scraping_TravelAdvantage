# 📋 GUIDE DES SCRIPTS NPM

Ce document explique en détail tous les scripts npm disponibles dans ce projet, leur utilisation, et ce qu'ils produisent.

## 🎯 Vue d'ensemble

Les scripts sont organisés en **5 phases numérotées** qui suivent le workflow logique du projet :

```
0️⃣ Installation & Aide
    ↓
1️⃣ Génération des dates
    ↓
2️⃣ Scraping des hôtels
    ↓
3️⃣ Génération des cartes
    ↓
4️⃣ Visualisation web
```

---

## 🔧 PHASE 0 : Installation & Aide

### `npm run 0:install`

**À quoi ça sert :** Installe toutes les dépendances du projet

**Commande :** `npm run 0:install`

**Ce que ça fait :**
- Lit le fichier `package.json`
- Télécharge et installe toutes les dépendances (Puppeteer, Express, ExcelJS, etc.)
- Crée le dossier `node_modules/`

**Fichiers d'entrée :**
- `package.json`

**Fichiers de sortie :**
- `node_modules/` (dossier créé)
- `package-lock.json` (créé/mis à jour)

**Durée :** ~30 secondes à 2 minutes (selon la connexion)

**Quand l'utiliser :**
- Première fois que vous clonez le projet
- Après avoir modifié `package.json`
- Si des dépendances sont manquantes

**Exemple de sortie console :**
```
added 245 packages, and audited 246 packages in 45s

32 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

---

### `npm run 0:help`

**À quoi ça sert :** Affiche l'aide complète de tous les scripts disponibles

**Commande :** `npm run 0:help`

**Ce que ça fait :**
- Affiche un résumé formaté de tous les scripts
- Organisé par phase avec descriptions

**Durée :** Instantané

**Quand l'utiliser :**
- Quand vous avez oublié une commande
- Pour voir rapidement tous les scripts disponibles

**Exemple de sortie console :**
```
📋 SCRIPTS DISPONIBLES:

🔧 PHASE 0 - Installation:
  npm run 0:install - Installe les dépendances

📅 PHASE 1 - Génération des dates:
  npm run 1:dates - Génère Dates.json (interactif)
  npm run 1:dates-check - Vérifie les dates générées

🕷️  PHASE 2 - Scraping:
  npm run 2:scrape - Lance le scraping complet
  npm run 2:scrape-test - Test de scraping

🗺️  PHASE 3 - Génération des cartes:
  npm run 3:map-resume - Génère resultat.xlsx
  npm run 3:map-data - Génère mapData.js
  npm run 3:map-all - Exécute resume + data

🌐 PHASE 4 - Serveur web:
  npm start - Démarre le serveur (port 3000)
  npm run 4:start - Alias de start

✅ VÉRIFICATIONS:
  npm run check:cities - Liste les villes configurées
  npm run check:results - Liste les fichiers Excel générés
  npm run check:dates - Affiche les dates

🔧 UTILITAIRES:
  npm run geocode - Géocodage avec API Ninja
```

---

## 📅 PHASE 1 : Génération des dates

### `npm run 1:dates`

**À quoi ça sert :** Génère le fichier `Dates.json` avec toutes les dates de scraping

**Commande :** `npm run 1:dates`

**Ce que ça fait :**
1. Vous demande : "Dans combien de mois voulez-vous voir les périodes ?"
2. Calcule tous les vendredis du mois spécifié
3. Pour chaque vendredi, crée 3 plages de dates :
   - Type 1 : Weekend (vendredi → dimanche, 2 jours)
   - Type 2 : Semaine (vendredi → vendredi, 7 jours)
   - Type 3 : 2 Semaines (vendredi → vendredi, 14 jours)
4. Fusionne avec les dates du fichier `datesAdditionnelles.csv` (si il existe)
5. Supprime les dates passées
6. Élimine les doublons
7. Trie par type puis par date

**Fichiers d'entrée :**
- `src/dates/datesAdditionnelles.csv` (optionnel)

**Fichiers de sortie :**
- `src/scraping/json/Dates.json` (créé/écrasé)

**Durée :** 2-5 secondes

**Quand l'utiliser :**
- Avant chaque nouvelle campagne de scraping
- Pour générer les dates du mois prochain
- Quand vous ajoutez des dates dans `datesAdditionnelles.csv`

**Exemple de sortie console :**
```
Dans combien de mois voulez-vous voir les périodes ? 2
Début du traitement...
Objects récupérés de getDates.js: 12
Résultats récupérés de remplirJSON.js: 3
Date d'aujourd'hui: 2025-01-10
Nombre de dates supprimées: 2
Fusion des tableaux...
Nombre total d'éléments avant déduplication: 15
Nombre d'éléments après déduplication: 13
Tri terminé
Nombre total de dates après fusion et déduplication: 13
Les dates finales ont été enregistrées dans Dates.json
Traitement terminé.
```

**Fichier Dates.json généré (extrait) :**
```json
[
  {
    "date": {
      "fromDate": "2025-02-07",
      "toDate": "2025-02-09",
      "type": 1
    }
  },
  {
    "date": {
      "fromDate": "2025-02-14",
      "toDate": "2025-02-16",
      "type": 1
    }
  },
  ...
]
```

---

### `npm run 1:dates-check`

**À quoi ça sert :** Affiche les 10 premières dates du fichier `Dates.json`

**Commande :** `npm run 1:dates-check`

**Ce que ça fait :**
- Lit le fichier `Dates.json`
- Affiche le nombre total de dates
- Liste les 10 premières dates avec leurs types

**Fichiers d'entrée :**
- `src/scraping/json/Dates.json`

**Durée :** Instantané

**Quand l'utiliser :**
- Après avoir généré les dates avec `1:dates`
- Pour vérifier rapidement quelles dates seront scrapées

**Exemple de sortie console :**
```
📅 DATES CONFIGURÉES: 36
  1. 2025-02-07 → 2025-02-09 - Type 1
  2. 2025-02-07 → 2025-02-14 - Type 2
  3. 2025-02-07 → 2025-02-21 - Type 3
  4. 2025-02-14 → 2025-02-16 - Type 1
  5. 2025-02-14 → 2025-02-21 - Type 2
  6. 2025-02-14 → 2025-02-28 - Type 3
  7. 2025-02-21 → 2025-02-23 - Type 1
  8. 2025-02-21 → 2025-02-28 - Type 2
  9. 2025-02-21 → 2025-03-07 - Type 3
  10. 2025-02-28 → 2025-03-02 - Type 1
  ... et 26 autres dates
```

---

## 🕷️ PHASE 2 : Scraping

### `npm run 2:scrape`

**À quoi ça sert :** Lance le scraping complet de toutes les villes et dates

**Commande :** `npm run 2:scrape`

**Ce que ça fait :**
1. Lit la liste des villes depuis `villesDeDestinations.xlsx`
2. Lit les dates depuis `Dates.json`
3. Pour chaque ville :
   - Pour chaque date :
     - Lance un navigateur Puppeteer
     - Navigue vers TravelAdvantage.com avec les paramètres
     - Attend le chargement des hôtels
     - Prend une capture d'écran
     - Extrait les données des hôtels (nom, prix, réduction, etc.)
     - Déduplique les hôtels (garde les meilleures offres)
     - Filtre les valeurs aberrantes (prix > 2× moyenne)
     - Calcule les statistiques
     - Écrit dans un fichier Excel par ville
4. Délai d'1 seconde entre chaque scraping

**Fichiers d'entrée :**
- `src/scraping/villesDeDestinations.xlsx`
- `src/scraping/json/Dates.json`

**Fichiers de sortie :**
- `src/scraping/saveData/datasVilles/{ville}.xlsx` (un par ville)
- `src/scraping/json/hotels_data.json` (temporaire, écrasé à chaque itération)
- `src/scraping/json/saved_hotels.json` (cumulatif)
- `src/scraping/json/statistiques.json` (cumulatif)
- `src/scraping/saveData/images/screenshots/{ville}/screenshots_{date}/` (captures d'écran)

**Durée :**
- ~3-5 secondes par ville/date
- **Exemple :** 50 villes × 36 dates = 1800 scrapes = **1h30 à 2h30**

**Quand l'utiliser :**
- Après avoir généré les dates avec `1:dates`
- Une fois par semaine pour mettre à jour les données
- Quand vous voulez scraper de nouvelles villes

**⚠️ Important :**
- Le script peut tourner plusieurs heures
- Ne pas interrompre sauf urgence
- En cas d'erreur sur une ville/date, le script continue automatiquement
- Les données sont sauvegardées progressivement (pas de perte en cas d'arrêt)

**Exemple de sortie console :**
```
Scraping pour Paris du 2025-02-07 au 2025-02-09
moyenne de la page : 245.50
Données ajoutées au fichier Excel: src/scraping/saveData/datasVilles/Paris.xlsx

Scraping pour Paris du 2025-02-07 au 2025-02-14
moyenne de la page : 312.75
Données ajoutées au fichier Excel: src/scraping/saveData/datasVilles/Paris.xlsx

Scraping pour Londres du 2025-02-07 au 2025-02-09
moyenne de la page : 198.30
Données ajoutées au fichier Excel: src/scraping/saveData/datasVilles/Londres.xlsx

...
```

---

### `npm run 2:scrape-test`

**À quoi ça sert :** Test de scraping pour vérifier que le scraper fonctionne

**Commande :** `npm run 2:scrape-test`

**Ce que ça fait :**
- Lance le script `scrapeHotels.js` directement
- Utile pour tester ou débugger le scraping

**⚠️ Note :** Ce script nécessite des paramètres codés en dur dans le fichier (voir ligne 183 de `scrapeHotels.js`)

**Durée :** ~3-5 secondes

**Quand l'utiliser :**
- Pour tester le scraping avant de lancer le complet
- Pour débugger des problèmes de scraping
- Pour vérifier que Puppeteer fonctionne correctement

---

## 🗺️ PHASE 3 : Génération des cartes

### `npm run 3:map-resume`

**À quoi ça sert :** Agrège tous les fichiers Excel des villes en un seul fichier résumé

**Commande :** `npm run 3:map-resume`

**Ce que ça fait :**
1. Lit tous les fichiers Excel dans `src/scraping/saveData/datasVilles/`
2. Pour chaque ville, pour chaque mois :
   - Extrait les cellules B1, C1, D1 (pourcentages max de réduction)
   - Ces cellules contiennent : Weekend%, Semaine%, 2 Semaines%
3. Crée un fichier `resultat.xlsx` avec un onglet par mois
4. Chaque onglet contient : Ville | Weekend (%) | Semaine (%) | 2 Semaines (%)
5. Met en gras les pourcentages > 40%

**Fichiers d'entrée :**
- `src/scraping/saveData/datasVilles/*.xlsx` (tous les fichiers)

**Fichiers de sortie :**
- `src/MapLeaflet/resultat.xlsx` (créé/écrasé)

**Durée :** 1-3 secondes

**Quand l'utiliser :**
- Après un scraping complet
- Avant de générer les données de carte
- Automatiquement exécuté au démarrage du serveur

**Exemple de sortie console :**
```
Le fichier resultat.xlsx a été créé avec succès.
```

**Structure du fichier resultat.xlsx :**
```
Onglet "Février_2025":
┌──────────┬────────────┬────────────┬────────────────┐
│  Ville   │ Weekend(%) │ Semaine(%) │ 2 Semaines(%) │
├──────────┼────────────┼────────────┼────────────────┤
│ Paris    │    35      │    42      │      48        │  (48 en gras)
│ Londres  │    28      │    31      │      38        │
│ Monaco   │    45      │    52      │      58        │  (45, 52, 58 en gras)
└──────────┴────────────┴────────────┴────────────────┘
```

---

### `npm run 3:map-data`

**À quoi ça sert :** Transforme `resultat.xlsx` en fichier JavaScript pour la carte Leaflet

**Commande :** `npm run 3:map-data`

**Ce que ça fait :**
1. Lit le fichier `resultat.xlsx`
2. Pour chaque ville, cherche les coordonnées GPS dans `villesDeDestinations.xlsx`
3. Crée un objet JavaScript organisé par mois
4. Chaque ville contient : nom, pays, latitude, longitude, pourcentages[3]
5. Écrit le fichier `mapData.js`

**Fichiers d'entrée :**
- `src/MapLeaflet/resultat.xlsx`
- `src/scraping/villesDeDestinations.xlsx`

**Fichiers de sortie :**
- `src/MapLeaflet/mapData.js` (créé/écrasé)

**Durée :** 1-2 secondes

**Quand l'utiliser :**
- Après avoir généré `resultat.xlsx`
- Avant de démarrer le serveur web
- Automatiquement exécuté au démarrage du serveur

**Exemple de sortie console :**
```
Le fichier mapData.js a été créé avec succès.
```

**Structure du fichier mapData.js :**
```javascript
const mapData = {
  "Février_2025": [
    {
      "ville": "Paris",
      "country": "France",
      "lat": 48.8566,
      "lon": 2.3522,
      "pourcentages": [35, 42, 48]
    },
    {
      "ville": "Londres",
      "country": "Royaume-Uni",
      "lat": 51.5074,
      "lon": -0.1278,
      "pourcentages": [28, 31, 38]
    },
    ...
  ],
  "Mars_2025": [ ... ]
};
```

---

### `npm run 3:map-all`

**À quoi ça sert :** Exécute `3:map-resume` puis `3:map-data` en une seule commande

**Commande :** `npm run 3:map-all`

**Ce que ça fait :**
- Lance `npm run 3:map-resume`
- Attend la fin
- Lance `npm run 3:map-data`

**Durée :** 2-5 secondes

**Quand l'utiliser :**
- Après un scraping complet
- Pour régénérer toutes les données de carte d'un coup
- Quand vous voulez être sûr que tout est à jour

**Exemple de sortie console :**
```
> npm run 3:map-resume

Le fichier resultat.xlsx a été créé avec succès.

> npm run 3:map-data

Le fichier mapData.js a été créé avec succès.
```

---

## 🌐 PHASE 4 : Serveur web

### `npm start` ou `npm run 4:start`

**À quoi ça sert :** Démarre le serveur web Express pour visualiser les résultats

**Commande :** `npm start` (ou `npm run 4:start`)

**Ce que ça fait :**
1. **Avant le démarrage :**
   - Exécute automatiquement `3:map-resume` (génère resultat.xlsx)
   - Exécute automatiquement `3:map-data` (génère mapData.js)
2. **Démarrage du serveur :**
   - Démarre Express sur le port 3000
   - Sert les fichiers statiques depuis `src/`
   - Active les routes API :
     - `GET /` → interface carte
     - `POST /saveSelectedCities` → enregistre sélection utilisateur
     - `GET /getHotelsData` → retourne détails des hôtels
     - `GET /getCitiesData` → retourne coordonnées des villes
     - `GET /templateBrevo` → template email

**Fichiers d'entrée :**
- `src/MapLeaflet/resultat.xlsx`
- `src/MapLeaflet/mapData.js`
- `src/MapLeaflet/index2.html`
- `src/assets/js/villesDeDestinations.json`

**Durée :** 5-10 secondes pour démarrer

**Quand l'utiliser :**
- Après un scraping pour visualiser les résultats
- Pour consulter les données sur la carte interactive
- Pour générer les templates d'email

**Exemple de sortie console :**
```
Changement de répertoire vers MapLeaflet...
Chemin du répertoire MapLeaflet : C:\...\src\MapLeaflet
Exécution de index1.js...
Le fichier resultat.xlsx a été créé avec succès.
index1.js exécuté avec succès.
Exécution de generateMap.js...
Le fichier mapData.js a été créé avec succès.
generateMap.js exécuté avec succès.
Retour au répertoire racine...
processExcelData importé : function
Serveur en cours d'exécution sur http://localhost:3000
```

**Accès :**
- Ouvrir le navigateur → `http://localhost:3000`
- Interface carte interactive avec :
  - Sélecteur de mois (dropdown)
  - Sélecteur de type (Weekend/Semaine/2 Semaines)
  - Marqueurs cliquables sur la carte
  - Affichage des pourcentages de réduction

**Pour arrêter le serveur :** `Ctrl + C` dans le terminal

---

## ✅ SCRIPTS DE VÉRIFICATION

### `npm run check:cities`

**À quoi ça sert :** Liste toutes les villes configurées dans le fichier Excel

**Commande :** `npm run check:cities`

**Ce que ça fait :**
- Lit `villesDeDestinations.xlsx`
- Compte le nombre de villes
- Affiche la liste : numéro, nom, pays

**Fichiers d'entrée :**
- `src/scraping/villesDeDestinations.xlsx`

**Durée :** Instantané

**Quand l'utiliser :**
- Avant de lancer un scraping
- Pour vérifier quelles villes seront scrapées
- Après avoir ajouté une nouvelle ville

**Exemple de sortie console :**
```
🏙️  VILLES CONFIGURÉES: 8
  1. Paris, France
  2. Londres, Royaume-Uni
  3. Monaco, Monaco
  4. Barcelone, Espagne
  5. Rome, Italie
  6. Berlin, Allemagne
  7. Amsterdam, Pays-Bas
  8. Bruxelles, Belgique
```

---

### `npm run check:results`

**À quoi ça sert :** Liste tous les fichiers Excel générés par le scraping

**Commande :** `npm run check:results`

**Ce que ça fait :**
- Lit le dossier `src/scraping/saveData/datasVilles/`
- Liste tous les fichiers `.xlsx`
- Affiche le nombre total

**Fichiers d'entrée :**
- Dossier `src/scraping/saveData/datasVilles/`

**Durée :** Instantané

**Quand l'utiliser :**
- Après un scraping pour vérifier que tout s'est bien passé
- Pour voir quelles villes ont été scrapées
- Pour identifier les villes manquantes

**Exemple de sortie console :**
```
📊 FICHIERS EXCEL GÉNÉRÉS: 8
  1. Paris.xlsx
  2. Londres.xlsx
  3. Monaco.xlsx
  4. Barcelone.xlsx
  5. Rome.xlsx
  6. Berlin.xlsx
  7. Amsterdam.xlsx
  8. Bruxelles.xlsx
```

**Si aucun résultat :**
```
❌ Aucun résultat trouvé
```

---

### `npm run check:dates`

**À quoi ça sert :** Affiche les statistiques sur les dates configurées

**Commande :** `npm run check:dates`

**Ce que ça fait :**
- Lit `Dates.json`
- Compte le nombre total de dates
- Compte le nombre de dates par type (Weekend, Semaine, 2 Semaines)

**Fichiers d'entrée :**
- `src/scraping/json/Dates.json`

**Durée :** Instantané

**Quand l'utiliser :**
- Après avoir généré les dates
- Pour vérifier la répartition par type
- Pour estimer la durée du scraping

**Exemple de sortie console :**
```
📅 Total: 36 dates
  - Weekend: 12
  - Semaine: 12
  - 2 Semaines: 12
```

---

## 🔧 UTILITAIRES

### `npm run geocode`

**À quoi ça sert :** Utilitaire de géocodage utilisant l'API Ninja

**Commande :** `npm run geocode`

**Ce que ça fait :**
- Lance le script `indexNinjasAPI.js`
- Permet de récupérer les coordonnées GPS d'une ville
- Utile pour ajouter de nouvelles villes à `villesDeDestinations.xlsx`

**Durée :** Variable selon l'utilisation

**Quand l'utiliser :**
- Quand vous voulez ajouter une nouvelle ville
- Pour récupérer les coordonnées GPS d'une adresse

---

## 🎯 WORKFLOWS TYPIQUES

### Workflow 1 : Première utilisation

```bash
# 1. Installer les dépendances
npm run 0:install

# 2. Voir les scripts disponibles
npm run 0:help

# 3. Vérifier les villes configurées
npm run check:cities

# 4. Générer les dates
npm run 1:dates
# (Entrer "1" pour le mois prochain)

# 5. Vérifier les dates
npm run 1:dates-check

# 6. Lancer le scraping
npm run 2:scrape
# ⏳ Attendre 1-2 heures

# 7. Vérifier les résultats
npm run check:results

# 8. Démarrer le serveur
npm start

# 9. Ouvrir le navigateur
# http://localhost:3000
```

---

### Workflow 2 : Mise à jour hebdomadaire

```bash
# Les dates sont déjà configurées, on re-scrape avec les mêmes dates
npm run 2:scrape

# Quand c'est fini, démarrer le serveur pour voir les nouvelles données
npm start
```

---

### Workflow 3 : Nouveau mois

```bash
# 1. Générer les dates du nouveau mois
npm run 1:dates
# (Entrer le numéro du mois)

# 2. Vérifier
npm run 1:dates-check

# 3. Scraper
npm run 2:scrape

# 4. Visualiser
npm start
```

---

### Workflow 4 : Ajouter une ville

```bash
# 1. Éditer villesDeDestinations.xlsx
# Ajouter : nom | pays | latitude | longitude | code pays

# 2. Vérifier que la ville apparaît
npm run check:cities

# 3. Scraper (toutes les villes, mais déduplication évite les doublons)
npm run 2:scrape

# 4. Vérifier que le fichier Excel a été créé
npm run check:results

# 5. Visualiser
npm start
```

---

### Workflow 5 : Régénérer uniquement les cartes

```bash
# Si vous avez modifié manuellement des fichiers Excel
npm run 3:map-all

# Puis démarrer le serveur
npm start
```

---

## ⚠️ DÉPANNAGE

### Problème : "Cannot find module 'Dates.json'"

**Solution :**
```bash
npm run 1:dates
```
Vous devez d'abord générer le fichier Dates.json.

---

### Problème : "Aucun résultat trouvé" après scraping

**Causes possibles :**
1. Le scraping n'est pas encore terminé
2. Une erreur s'est produite pendant le scraping
3. Le dossier `saveData/datasVilles` n'existe pas

**Solution :**
- Vérifier les logs du scraping
- Relancer `npm run 2:scrape`

---

### Problème : Le serveur ne démarre pas

**Erreur possible :** "Address already in use"

**Solution :**
- Le port 3000 est déjà utilisé
- Tuer le processus existant ou changer le port dans `server.js`

---

### Problème : Une ville n'apparaît pas sur la carte

**Causes possibles :**
1. Les coordonnées GPS sont manquantes dans `villesDeDestinations.xlsx`
2. Le nom de la ville ne correspond pas exactement entre les fichiers

**Solution :**
- Vérifier `villesDeDestinations.xlsx`
- Vérifier que le nom de la ville est exactement le même partout
- Relancer `npm run 3:map-all` puis `npm start`

---

### Problème : Puppeteer ne se lance pas

**Erreur possible :** "Failed to launch browser"

**Solutions :**
- Réinstaller Puppeteer : `npm install puppeteer`
- Vérifier que Chrome/Chromium est installé
- Sur Linux : installer les dépendances système de Chrome

---

## 📊 ESTIMATION DES DURÉES

| Action | Script | Durée estimée |
|--------|--------|---------------|
| Installation | `0:install` | 30s - 2min |
| Génération dates | `1:dates` | 2-5s |
| Scraping (1 ville × 36 dates) | `2:scrape` | 2-3 min |
| Scraping (50 villes × 36 dates) | `2:scrape` | 1h30 - 2h30 |
| Génération résumé | `3:map-resume` | 1-3s |
| Génération carte | `3:map-data` | 1-2s |
| Démarrage serveur | `start` | 5-10s |

---

## 💡 ASTUCES

1. **Toujours vérifier avant de scraper :**
   ```bash
   npm run check:cities
   npm run 1:dates-check
   ```

2. **Workflow rapide avec une seule commande :**
   ```bash
   npm run 1:dates && npm run 2:scrape && npm start
   ```
   (Attention : le scraping peut être très long)

3. **Voir les logs en temps réel :**
   Le scraping affiche la progression dans la console. Ne fermez pas le terminal !

4. **Sauvegarder les résultats :**
   Les fichiers Excel dans `saveData/datasVilles/` sont vos données principales. Faites des backups réguliers !

5. **Consulter CLAUDE.md :**
   Pour plus de détails sur l'architecture, voir le fichier [CLAUDE.md](CLAUDE.md)

---

## 📞 AIDE SUPPLÉMENTAIRE

- **Guide complet :** `npm run 0:help`
- **Architecture du projet :** Voir `CLAUDE.md`
- **Structure des données :** Voir section "Emplacements importants des données" dans `CLAUDE.md`
