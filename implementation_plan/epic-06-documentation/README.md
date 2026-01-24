# Epic 6 - Documentation

> **Priorité:** 🟢 P3 - Basse
> **Statut:** TODO
> **Stories:** 4

## Description

Corriger les incohérences entre la documentation et l'implémentation réelle après avoir corrigé le code.

## Importance

À faire **APRÈS** les corrections de code (Epics 1-2) pour documenter le comportement réel et non théorique.

## Stories

| Story | Titre | Complexité | Statut | Dépendances |
|-------|-------|------------|--------|-------------|
| [6.1](story-6.1-fix-prd.md) | Corriger PRD.md | S | TODO | Epic 2 |
| [6.2](story-6.2-fix-claude-md.md) | Corriger CLAUDE.md | XS | TODO | - |
| [6.3](story-6.3-fix-scraping-flow.md) | Corriger SCRAPING_FLOW.md | S | TODO | Epic 2 |
| [6.4](story-6.4-restructuration-docs.md) | Restructuration Documentation (SSOT) | M | TODO | 6.1, 6.2, 6.3 |

## Incohérences Identifiées

### PRD.md
- §7.5: Retry logic documenté mais non implémenté
- §6: Chemin screenshots incorrect

### CLAUDE.md
- Ligne ~105: Contradiction headless
- Pas de warning sur premier lancement

### SCRAPING_FLOW.md
- Diagramme montre retry/skip inexistant
- saved_hotels.json décrit comme fonctionnel
