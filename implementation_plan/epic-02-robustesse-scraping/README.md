# Epic 2 - Robustesse Scraping

> **Priorité:** 🟠 P1 - Haute
> **Statut:** TODO
> **Stories:** 4

## Description

Cette epic vise à rendre le processus de scraping plus fiable et résilient face aux erreurs réseau, timeouts et limitations du site cible.

## Problèmes Identifiés

1. **Pas de retry logic** - Un timeout = ville/date skippée définitivement
2. **Pas de détection rate limiting** - Si TravelAdvantage bloque (429/403), le scraping continue de tenter
3. **Pas de reprise après interruption** - Si le scraping s'arrête, tout doit être relancé

## Impact

- **Données manquantes:** Villes entières peuvent être absentes des résultats
- **Blocage potentiel:** Sans gestion rate limiting, risque de blocage IP
- **Temps perdu:** Impossible de reprendre un scraping interrompu

## Stories

| Story | Titre | Complexité | Statut | Dépendances |
|-------|-------|------------|--------|-------------|
| [2.1](story-2.1-retry-logic.md) | Retry logic avec backoff exponentiel | M | TODO | - |
| [2.2](story-2.2-rate-limiting.md) | Détection rate limiting | M | TODO | 2.1 |
| [2.3](story-2.3-progression-state.md) | Gestion état de progression | L | TODO | - |
| [2.4](story-2.4-user-agent-rotation.md) | Rotation des User-Agents | S | TODO | - |

## Ordre d'Implémentation

1. **Story 2.1** - Base pour le retry
2. **Story 2.2** - S'appuie sur 2.1 pour le retry après rate limit
3. **Story 2.3** - Indépendante mais complémentaire

## Diagramme Cible

```
┌─────────────────────────────────────────────────────────────┐
│                     scrapeWithRetry()                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐     Succès     ┌─────────────────┐       │
│   │ scrapeHotels│───────────────▶│ Retourner data  │       │
│   └──────┬──────┘                └─────────────────┘       │
│          │                                                  │
│          │ Erreur                                           │
│          ▼                                                  │
│   ┌─────────────────────┐                                  │
│   │ Identifier type     │                                  │
│   │ d'erreur            │                                  │
│   └──────┬──────────────┘                                  │
│          │                                                  │
│    ┌─────┴─────┬─────────────┐                             │
│    ▼           ▼             ▼                             │
│ Timeout    Rate Limit    Autre                             │
│    │           │             │                             │
│    ▼           ▼             ▼                             │
│ Retry       Pause +      Log +                             │
│ (3x max)    Retry        Skip                              │
│    │       (30-60s)                                        │
│    │           │                                           │
│    └─────┬─────┘                                           │
│          ▼                                                  │
│   ┌─────────────────┐                                      │
│   │ Backoff delay   │                                      │
│   │ 2s → 4s → 8s    │                                      │
│   └─────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
