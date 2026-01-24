# Epic 8 - Performance & Optimisation

> **Priorité:** 🟢 P3 - Basse
> **Statut:** TODO
> **Stories:** 1

## Description

Cette epic vise à améliorer les performances du processus de scraping, notamment en introduisant la parallélisation pour réduire le temps total d'exécution.

## Problèmes Identifiés

1. **Scraping séquentiel** - Chaque ville est traitée l'une après l'autre
2. **Temps total élevé** - ~5 min/ville × N villes = temps prohibitif pour de nombreuses destinations
3. **Ressources sous-utilisées** - Une seule instance Chrome à la fois

## Impact

- **Temps d'exécution** : Scraping de 20 villes = ~100 minutes (1h40)
- **Fréquence limitée** : Impossible de scraper souvent si trop long
- **Données moins fraîches** : Délai entre première et dernière ville

## Objectif

Réduire le temps total de scraping de **50-70%** en parallélisant les requêtes.

## Stories

| Story | Titre | Complexité | Statut | Dépendances |
|-------|-------|------------|--------|-------------|
| [8.1](story-8.1-parallelisation.md) | Parallélisation du scraping | XL | TODO | 2.1, 2.3 |

## Considérations

### Risques de la parallélisation

- **Rate limiting** : Plus de requêtes simultanées = risque de blocage accru
- **Mémoire** : Plusieurs instances Chrome = consommation RAM importante
- **Complexité** : Gestion des erreurs plus complexe en parallèle

### Recommandations

- Limiter à 3-5 instances simultanées maximum
- Implémenter Story 2.1 (retry) et 2.4 (user-agent rotation) d'abord
- Monitorer la consommation mémoire

## Diagramme Cible

```
┌─────────────────────────────────────────────────────────────┐
│                     SCRAPING PARALLÈLE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Villes à scraper: [Paris, Londres, Berlin, Rome, Madrid]  │
│                                                             │
│   Pool de workers (max 3):                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │  Worker 1    │  │  Worker 2    │  │  Worker 3    │     │
│   │  Chrome #1   │  │  Chrome #2   │  │  Chrome #3   │     │
│   │              │  │              │  │              │     │
│   │  → Paris     │  │  → Londres   │  │  → Berlin    │     │
│   │  → Rome      │  │  → Madrid    │  │              │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│   Temps estimé: (5 villes / 3 workers) × 5min = ~10 min    │
│   vs séquentiel: 5 × 5min = 25 min                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prérequis Recommandés

Avant d'implémenter cette epic, il est recommandé de compléter :

- [x] Story 2.1 - Retry logic (gestion des erreurs individuelles)
- [x] Story 2.3 - État de progression (reprise après interruption)
- [x] Story 2.4 - Rotation user-agents (éviter détection)

## Liens

- [INDEX](../INDEX.md)
- [Epic 2 - Robustesse](../epic-02-robustesse-scraping/)
