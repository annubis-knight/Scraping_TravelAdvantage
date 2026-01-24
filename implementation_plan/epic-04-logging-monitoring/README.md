# Epic 4 - Logging & Monitoring

> **Priorité:** 🟡 P2 - Moyenne
> **Statut:** TODO
> **Stories:** 3

## Description

Améliorer la visibilité sur les opérations de scraping avec des logs persistants et des métriques de performance.

## Problèmes Identifiés

1. **Logs console uniquement** - Perdus après fermeture du terminal
2. **Pas de métriques** - Impossible de mesurer le taux de succès, temps moyen, etc.
3. **Pas d'alertes** - Aucune notification en cas de problème

## Stories

| Story | Titre | Complexité | Statut | Dépendances |
|-------|-------|------------|--------|-------------|
| [4.1](story-4.1-file-logging.md) | Logging fichier avec rotation | M | TODO | - |
| [4.2](story-4.2-performance-metrics.md) | Métriques de performance | M | TODO | 4.1 |
| [4.3](story-4.3-failure-alerts.md) | Alertes sur échecs | L | TODO | 4.1 |

## Structure de logs proposée

```
logs/
├── scraping-2026-01-24.log      # Log du jour
├── scraping-2026-01-23.log      # Logs précédents
├── errors-2026-01-24.log        # Erreurs uniquement
└── metrics.json                  # Métriques agrégées
```
