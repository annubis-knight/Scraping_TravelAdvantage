# Story 9.3 - Sécurisation du .gitignore

> **Epic:** [9 - Maintenance & Sécurité](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** XS (< 1h)
> **Statut:** TODO

---

## Contexte

Le projet contient des fichiers qui ne devraient pas être versionnés : données de session Chrome, fichiers temporaires, backups, etc. Un `.gitignore` bien configuré évite les fuites de données et allège le dépôt.

## Problème

Fichiers potentiellement problématiques actuellement :

| Fichier/Dossier | Risque | Impact |
|-----------------|--------|--------|
| `src/scraping/user_data/` | Élevé | Sessions Chrome, cookies, données utilisateur |
| `src/scraping/json/hotels_data.json` | Faible | Fichier temporaire écrasé à chaque run |
| `src/scraping/saveData/backups/` | Moyen | Backups volumineux, pas besoin de versionner |
| `*.xlsx` dans saveData | Faible | Fichiers binaires volumineux |
| `.env` | Élevé | Variables d'environnement sensibles |

## Solution Proposée

### .gitignore complet

```gitignore
# .gitignore

# ===== DÉPENDANCES =====
node_modules/

# ===== DONNÉES SENSIBLES =====
# Sessions Chrome Puppeteer (cookies, localStorage, etc.)
src/scraping/user_data/

# Variables d'environnement
.env
.env.local
.env.*.local

# ===== FICHIERS TEMPORAIRES =====
# Données de scraping temporaires (écrasées à chaque run)
src/scraping/json/hotels_data.json
src/scraping/json/saved_hotels.json

# ===== FICHIERS GÉNÉRÉS =====
# Screenshots de debug
src/scraping/saveData/images/screenshots/

# Backups (créés par story 9.2)
src/scraping/saveData/backups/

# Données de carte générées
src/MapLeaflet/mapData.js
src/MapLeaflet/resultat.xlsx

# ===== LOGS =====
logs/
*.log
npm-debug.log*

# ===== IDE =====
.vscode/
.idea/
*.swp
*.swo
*~

# ===== OS =====
.DS_Store
Thumbs.db
desktop.ini

# ===== DIVERS =====
*.tmp
*.temp
*.bak

# ===== FICHIERS À GARDER (commentés pour référence) =====
# Ne PAS ignorer :
# - src/scraping/json/Dates.json (configuration)
# - src/scraping/json/statistiques.json (données importantes)
# - src/scraping/villesDeDestinations.xlsx (configuration)
# - src/scraping/saveData/datasVilles/*.xlsx (résultats)
```

### Vérification des fichiers déjà trackés

Si des fichiers sensibles sont déjà versionnés, il faut les supprimer du tracking Git :

```bash
# Vérifier ce qui est actuellement tracké
git ls-files | grep -E "(user_data|hotels_data|\.env)"

# Si des fichiers sensibles sont trackés, les supprimer du cache Git
# (sans les supprimer du disque)
git rm --cached -r src/scraping/user_data/
git rm --cached src/scraping/json/hotels_data.json
git rm --cached .env

# Commit le .gitignore et les suppressions
git add .gitignore
git commit -m "chore: sécuriser .gitignore et supprimer fichiers sensibles du tracking"
```

---

## Fichiers à Modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `.gitignore` | Modifier | Ajouter les patterns manquants |

---

## Critères d'Acceptation

- [ ] `user_data/` est ignoré par Git
- [ ] `hotels_data.json` et `saved_hotels.json` sont ignorés
- [ ] `.env` est ignoré
- [ ] Les screenshots sont ignorés
- [ ] Les backups sont ignorés
- [ ] `mapData.js` et `resultat.xlsx` générés sont ignorés
- [ ] Les fichiers de config importants restent versionnés (Dates.json, villesDeDestinations.xlsx)
- [ ] Si des fichiers sensibles étaient trackés, ils sont supprimés du cache Git

---

## Vérification

```bash
# Après modification, vérifier que les fichiers sont bien ignorés
git status

# Vérifier qu'un fichier est ignoré
git check-ignore -v src/scraping/user_data/
# Devrait afficher: .gitignore:X:pattern    src/scraping/user_data/

# Vérifier les fichiers non ignorés dans saveData
git ls-files src/scraping/saveData/
# Ne devrait lister que les .xlsx de datasVilles et statistiques.json
```

---

## Fichier .env.example

Créer un fichier `.env.example` pour documenter les variables attendues :

```env
# .env.example
# Copier ce fichier vers .env et remplir les valeurs

# Configuration scraping
SCRAPE_TIMEOUT=60000
SCRAPE_MAX_RETRIES=3
SCRAPE_DELAY_MS=1000

# Configuration serveur
PORT=3000
NODE_ENV=development

# (Futur) API externe
# NINJA_API_KEY=your_api_key_here
```

---

## Impact Sécurité

| Avant | Après |
|-------|-------|
| Sessions Chrome potentiellement exposées | Sessions protégées |
| Risque de commit accidentel de .env | .env ignoré par défaut |
| Dépôt alourdi par screenshots | Screenshots exclus |
| Backups versionnés inutilement | Backups locaux uniquement |

---

## Liens

- [Epic 9 - Maintenance & Sécurité](README.md)
- [Story 3.2 - Support fichier .env](../epic-03-configuration/story-3.2-env-file.md)
- [INDEX](../INDEX.md)
