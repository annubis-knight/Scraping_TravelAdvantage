# Story 6.2 - Corriger CLAUDE.md

> **Epic:** [6 - Documentation](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** XS (< 1h)
> **Statut:** DONE

---

## Corrections à Apporter

### 1. Contradiction Headless (ligne ~105)

**Texte actuel:** "S'exécute en mode headless"
**Réalité:** `headless: false` dans le code

**Action:** Corriger en "S'exécute en mode non-headless (navigateur visible)"

### 2. Warning Premier Lancement

**Manquant:** Avertissement que statistiques.json doit exister ou sera créé

**Action:** Ajouter une note dans "Notes de développement"

### 3. Clarifier saved_hotels.json

**Actuel:** Décrit comme source de fusion
**Réalité:** Toujours vide (jusqu'à correction Story 1.2)

**Action:** Ajouter note ou corriger après Story 1.2

---

## Fichier à Modifier

`CLAUDE.md`

---

## Critères d'Acceptation

- [x] Mode headless correctement documenté
- [x] Warning premier lancement ajouté
- [x] saved_hotels.json comportement clarifié

---

## Liens

- [Epic 6 - Documentation](README.md)
- [INDEX](../INDEX.md)
