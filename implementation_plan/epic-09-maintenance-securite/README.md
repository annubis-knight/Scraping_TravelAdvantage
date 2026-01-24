# Epic 9 - Maintenance & Sécurité

> **Priorité:** 🟢 P3 - Basse
> **Statut:** TODO
> **Stories:** 4

## Description

Cette epic regroupe les tâches de maintenance du projet : nettoyage des données temporaires, sauvegarde automatique, sécurisation du dépôt Git, et restructuration des dossiers de données.

## Problèmes Identifiés

1. **Screenshots non nettoyés** - Accumulation de fichiers images (~500 KB/ville/date)
2. **Pas de backup automatique** - Risque de perte de données Excel
3. **Sécurité Git** - `user_data/` et fichiers sensibles non ignorés
4. **Structure de dossiers** - Confusion entre `json/` et `saveData/`

## Impact

- **Espace disque** : Screenshots peuvent accumuler plusieurs GB
- **Perte de données** : Pas de filet de sécurité en cas de corruption
- **Sécurité** : Sessions Chrome potentiellement exposées sur Git
- **Maintenabilité** : Structure confuse ralentit le développement

## Stories

| Story | Titre | Complexité | Statut | Dépendances |
|-------|-------|------------|--------|-------------|
| [9.1](story-9.1-cleanup-screenshots.md) | Nettoyage automatique des screenshots | S | TODO | - |
| [9.2](story-9.2-backup-automatique.md) | Backup automatique des données | M | TODO | - |
| [9.3](story-9.3-gitignore-securite.md) | Sécurisation .gitignore | XS | TODO | - |
| [9.4](story-9.4-restructuration-dossiers.md) | Restructuration des dossiers data | L | TODO | - |

## Ordre d'Implémentation Recommandé

1. **Story 9.3** - .gitignore (rapide, impact sécurité immédiat)
2. **Story 9.1** - Nettoyage screenshots (libère espace)
3. **Story 9.2** - Backup (protection des données)
4. **Story 9.4** - Restructuration (dernière car plus invasive)

## Diagramme Structure Cible

```
Scraping/
├── src/
│   └── scraping/
│       ├── core/              # Code métier uniquement
│       │   ├── index.js
│       │   ├── scrapeHotels.js
│       │   └── ...
│       └── config/            # Configuration
│
├── data/                      # NOUVEAU: Toutes les données
│   ├── input/                 # Fichiers d'entrée
│   │   ├── villesDeDestinations.xlsx
│   │   └── Dates.json
│   ├── output/                # Résultats
│   │   ├── villes/            # Excel par ville
│   │   └── statistiques.json
│   ├── temp/                  # Temporaire (gitignored)
│   │   ├── hotels_data.json
│   │   └── screenshots/
│   └── backup/                # Sauvegardes
│       └── 2026-01-24/
│
└── .gitignore                 # Sécurisé
```

## Liens

- [INDEX](../INDEX.md)
- [Epic 3 - Configuration](../epic-03-configuration/)
- [Epic 4 - Logging & Monitoring](../epic-04-logging-monitoring/)
