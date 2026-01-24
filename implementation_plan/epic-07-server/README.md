# Epic 7 - Améliorations Server

> **Priorité:** 🟢 P3 - Basse (sauf 7.1 qui est P2)
> **Statut:** TODO
> **Stories:** 3

## Description

Améliorer la robustesse et l'observabilité du serveur Express.

## Problèmes Identifiés

1. **Erreurs au démarrage ignorées** - Le serveur démarre même si génération mapData échoue
2. **Pas de health check** - Impossible de vérifier si le serveur fonctionne
3. **Pas de validation des données** - mapData.js corrompu = carte cassée

## Stories

| Story | Titre | Complexité | Statut | Priorité |
|-------|-------|------------|--------|----------|
| [7.1](story-7.1-startup-errors.md) | Gestion erreurs démarrage | S | TODO | 🟡 P2 |
| [7.2](story-7.2-health-check.md) | Health check endpoint | S | TODO | 🟢 P3 |
| [7.3](story-7.3-map-validation.md) | Validation données carte | M | TODO | 🟢 P3 |
