# Story 6.4 - Restructuration Documentation (Single Source of Truth)

> **Epic:** [6 - Documentation](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** M (2-4h)
> **Statut:** DONE

---

## Contexte

La documentation actuelle souffre de ~30-40% de redondance :
- Diagrammes de flux dupliqués entre PRD et SCRAPING_FLOW
- Sélecteurs CSS mentionnés 3 fois (PRD, SCRAPING_FLOW, CLAUDE.md)
- Tableaux de scripts dupliqués entre CLAUDE.md et SCRIPTS.md
- Structure des répertoires répétée partout

## Problème

| Sujet | Fichier(s) concernés | Niveau de redondance |
|-------|---------------------|---------------------|
| Commandes npm | CLAUDE.md, SCRIPTS.md | 🔴 Haute |
| Sélecteurs CSS | PRD.md, SCRAPING_FLOW.md | 🔴 Haute |
| Timeouts | PRD.md, SCRAPING_FLOW.md, CLAUDE.md | 🟠 Modérée |
| Architecture | PRD.md, SCRAPING_FLOW.md | 🟡 Moyenne |

### Impact

- Maintenance difficile (modifier 3 fichiers pour une info)
- Risque d'incohérence entre documents
- Confusion pour les lecteurs

## Solution Proposée

### Structure cible

```
docs/
├── CDC.md              # ✓ Inchangé (Cahier des Charges formel)
├── SCRAPING_FLOW.md    # ✓ Inchangé (Flux d'exécution)
├── PRD.md              # ⚠️ Simplifier (specs métier uniquement)
├── SCRIPTS.md          # ✓ Garder (guide utilisateur scripts)
└── TECHNICAL.md        # ✨ NOUVEAU (référence technique)

CLAUDE.md (racine)      # ⚠️ Simplifier (contexte Claude + liens)
```

### Responsabilité de chaque document

| Document | Responsabilité unique | Public cible |
|----------|----------------------|--------------|
| **CDC.md** | Cadrage projet, exigences formelles | Stakeholders |
| **PRD.md** | Specs produit, fonctionnalités | Product Manager |
| **SCRAPING_FLOW.md** | Flux d'exécution, pipeline | Développeurs |
| **SCRIPTS.md** | Guide des commandes npm | Utilisateurs |
| **TECHNICAL.md** | Référence technique (code) | Développeurs |
| **CLAUDE.md** | Contexte pour Claude Code | AI |

---

## Actions à réaliser

### 1. Créer `docs/TECHNICAL.md`

```markdown
# Référence Technique

## 1. Architecture du Code
### Structure des répertoires
[Déplacer depuis PRD.md §6.3]

### Modules principaux
[Déplacer depuis PRD.md §6.2]

## 2. Sélecteurs CSS (TravelAdvantage)
[Consolider depuis PRD.md Annexe D + SCRAPING_FLOW.md]

| Sélecteur CSS | Champ extrait | Valeur par défaut |
|---------------|---------------|-------------------|
| `h4.not-select` | nomHotel | "Nom non disponible" |
| `p span.w-auto` | location | "Emplacement non disponible" |
| `.score span` | note | "Note non disponible" |
| `.saving_per span` | reduction | "Économies non disponibles" |
| ... | ... | ... |

## 3. Configuration
### Timeouts
[Consolider depuis PRD.md §13.2 + SCRAPING_FLOW.md]

| Opération | Timeout | Fichier |
|-----------|---------|---------|
| page.goto() | 60s | scrapeHotels.js |
| waitForSelector() | 240s | scrapeHotels.js |
| Délai post-selector | 10s | scrapeHotels.js |
| Rate limiting | 1s | index.js |

### Limites et seuils
- Prix max : 2× moyenne (filtrage aberrants)
- Top hôtels : 10 par type
- Réduction mise en gras : > 40%

## 4. Modèle de Données
[Déplacer depuis PRD.md §8]

### Structure JSON
### Structure Excel
```

### 2. Simplifier `docs/PRD.md`

| Section actuelle | Action |
|------------------|--------|
| §6.2 Diagramme d'architecture | → TECHNICAL.md |
| §6.3 Structure des répertoires | → TECHNICAL.md |
| §8 Modèle de données | → TECHNICAL.md |
| §13.2 Timeouts | → TECHNICAL.md |
| Annexe D Sélecteurs CSS | → TECHNICAL.md |
| Annexe E, F, G (flux détaillés) | Supprimer (déjà dans SCRAPING_FLOW.md) |

**Garder dans PRD.md :**
- §1-5 : Introduction, contexte, objectifs, personas, fonctionnalités
- §9 : API et routes (descriptions)
- §10 : Interface utilisateur
- §12 : Cas d'utilisation
- §13.1, §13.3-4 : Contraintes et risques
- §14-15 : Métriques, roadmap
- §16 : Glossaire

**Objectif :** PRD.md < 500 lignes (actuellement 834)

### 3. Simplifier `CLAUDE.md`

```markdown
# CLAUDE.md

Ce fichier fournit des conseils à Claude Code pour ce dépôt.

## Vue d'ensemble

Outil de scraping et d'analyse de données pour les réservations d'hôtels.
Extrait les données depuis TravelAdvantage.com, les visualise sur cartes Leaflet.

## Commandes essentielles

```bash
npm run 2:scrape    # Scraping complet
npm start           # Serveur (port 3000)
```

📖 Guide complet : [docs/SCRIPTS.md](docs/SCRIPTS.md)

## Documentation

| Document | Contenu |
|----------|---------|
| [PRD.md](docs/PRD.md) | Spécifications produit |
| [TECHNICAL.md](docs/TECHNICAL.md) | Référence technique (sélecteurs, timeouts) |
| [SCRAPING_FLOW.md](docs/SCRAPING_FLOW.md) | Flux d'exécution |
| [SCRIPTS.md](docs/SCRIPTS.md) | Guide des scripts npm |
| [CDC.md](docs/CDC.md) | Cahier des charges |

## Notes pour le développement

[Garder les notes spécifiques : URLs, gestion dates, références cellules Excel]
```

**Objectif :** CLAUDE.md < 100 lignes (actuellement 177)

---

## Fichiers à Modifier

| Fichier | Action | Effort |
|---------|--------|--------|
| `docs/TECHNICAL.md` | Créer | M |
| `docs/PRD.md` | Simplifier (~300 lignes à retirer) | M |
| `CLAUDE.md` | Simplifier (~80 lignes à retirer) | S |

---

## Critères d'Acceptation

- [ ] `docs/TECHNICAL.md` créé avec :
  - [ ] Sélecteurs CSS (tableau unique)
  - [ ] Timeouts configurés
  - [ ] Structure des répertoires
  - [ ] Modèle de données
- [ ] `docs/PRD.md` simplifié (< 500 lignes)
- [ ] `CLAUDE.md` simplifié (< 100 lignes)
- [ ] Aucune duplication des sélecteurs CSS
- [ ] Tous les liens internes fonctionnent
- [ ] CDC.md et SCRAPING_FLOW.md inchangés

---

## Vérification

```bash
# Vérifier qu'il n'y a plus de doublons
grep -r "\.list_card" docs/           # 1 seule occurrence
grep -r "waitForSelector" docs/       # 1 seule occurrence
grep -r "npm run 2:scrape" docs/      # Dans SCRIPTS.md principalement

# Compter les lignes
wc -l docs/PRD.md          # < 500
wc -l CLAUDE.md            # < 100
wc -l docs/TECHNICAL.md    # ~200-300
```

---

## Ordre d'exécution

1. Créer TECHNICAL.md (copier le contenu depuis les sources)
2. Simplifier PRD.md (retirer les sections déplacées)
3. Simplifier CLAUDE.md (ajouter liens, retirer détails)
4. Vérifier les liens et la cohérence

---

## Dépendances

Cette story devrait être faite **après** 6.1, 6.2, 6.3 pour éviter les conflits d'édition.

---

## Liens

- [Epic 6 - Documentation](README.md)
- [Story 6.1 - Fix PRD.md](story-6.1-fix-prd.md)
- [Story 6.2 - Fix CLAUDE.md](story-6.2-fix-claude-md.md)
- [Story 6.3 - Fix SCRAPING_FLOW.md](story-6.3-fix-scraping-flow.md)
- [INDEX](../INDEX.md)
