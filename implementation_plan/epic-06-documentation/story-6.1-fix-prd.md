# Story 6.1 - Corriger PRD.md

> **Epic:** [6 - Documentation](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** S (1-2h)
> **Statut:** DONE
> **Dépendances:** [Epic 2 - Robustesse](../epic-02-robustesse-scraping/) (implémenter avant documenter)

---

## Corrections à Apporter

### 1. Section 7.5 - Workflow Gestion des Erreurs

**Avant:** Décrit un retry logic (max 3x) et rate limiting handling

**Après:**
- Si Epic 2 implémenté: Mettre à jour avec les vrais paramètres (délais, seuils)
- Si non implémenté: Marquer comme "Roadmap v1.x"

### 2. Section 7.3 - Workflow Scraping Détaillé

**Ligne 297-306:** Le diagramme montre "Retry (max 3x) ou skip ville"

**Action:** Aligner avec l'implémentation réelle

### 3. Chemins Screenshots

**Documenté:** `screenshots/{ville}/{dates}/`
**Réel:** `screenshots/{ville}/screenshots_YYYY-MM-DD/`

**Action:** Corriger pour refléter la réalité

### 4. Section 7.8 - Flux fichiers JSON

**saved_hotels.json** décrit comme "ÉCRASÉ" avec hôtels depuis Excel

**Action:** Clarifier le comportement réel (ou après correction Story 1.2)

---

## Fichier à Modifier

`PRD.md`

---

## Critères d'Acceptation

- [x] §7.5 reflète l'implémentation réelle
- [x] §7.3 diagramme mis à jour
- [x] Chemin screenshots corrigé
- [x] §7.8 saved_hotels.json clarifié
- [x] Aucune promesse de fonctionnalité non implémentée

---

## Liens

- [Epic 6 - Documentation](README.md)
- [INDEX](../INDEX.md)
