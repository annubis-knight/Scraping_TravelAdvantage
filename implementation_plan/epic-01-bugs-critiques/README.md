# Epic 1 - Bugs Critiques

> **Priorité:** 🔴 P0 - Critique
> **Statut:** TODO
> **Stories:** 3

## Description

Cette epic regroupe les bugs critiques identifiés lors de l'analyse du code. Ces bugs peuvent causer des crashs, des pertes de données ou des comportements incorrects en production.

## Problèmes Identifiés

1. **statistiques.json** - Crash au premier lancement si le fichier n'existe pas
2. **saved_hotels.json** - Jamais alimenté, rendant la déduplication cross-runs inopérante
3. **Écriture Excel en boucle** - Écriture inutile du fichier villesDeDestinations.xlsx à chaque itération

## Impact

- **Sans correction Story 1.1:** Le premier lancement du scraping échoue systématiquement
- **Sans correction Story 1.2:** Les mêmes hôtels peuvent apparaître en doublons dans les fichiers Excel
- **Sans correction Story 1.3:** Performance dégradée (I/O inutile ~50+ fois par run)

## Stories

| Story | Titre | Complexité | Statut |
|-------|-------|------------|--------|
| [1.1](story-1.1-statistiques-json.md) | Initialisation sécurisée statistiques.json | S | TODO |
| [1.2](story-1.2-saved-hotels.md) | Correction saved_hotels.json | M | TODO |
| [1.3](story-1.3-excel-write-loop.md) | Suppression écriture Excel en boucle | XS | TODO |

## Ordre d'Implémentation

Les stories peuvent être implémentées dans n'importe quel ordre car elles sont indépendantes.

Recommandation: 1.1 → 1.3 → 1.2 (du plus simple au plus complexe)
