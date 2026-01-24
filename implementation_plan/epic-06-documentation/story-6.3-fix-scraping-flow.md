# Story 6.3 - Corriger SCRAPING_FLOW.md

> **Epic:** [6 - Documentation](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** S (1-2h)
> **Statut:** DONE
> **Dépendances:** [Epic 2 - Robustesse](../epic-02-robustesse-scraping/)

---

## Corrections à Apporter

### 1. Diagramme Retry/Skip (ligne ~297-306)

**Actuel:** Montre "Retry (max 3x) ou skip ville"
**Réalité:** Pas de retry, erreur = skip direct

**Action:** Aligner avec l'implémentation (ou après Epic 2)

### 2. Flux saved_hotels.json

**Diagramme montre:**
```
saved_hotels.json ──► removeDuplicates()
```

**Réalité:** Fichier toujours vide, pas de vraie fusion

**Action:** Corriger ou marquer "À implémenter (voir Story 1.2)"

### 3. Section Timeouts

**Actuel:** Correct (60s, 240s, 10s, 1s)
**Action:** Vérifier si toujours aligné après changements

---

## Fichier à Modifier

`docs/SCRAPING_FLOW.md`

---

## Critères d'Acceptation

- [x] Diagrammes reflètent le code réel
- [x] Comportement saved_hotels.json clarifié
- [x] Timeouts vérifiés
- [x] Sections "non implémenté" marquées comme telles

---

## Liens

- [Epic 6 - Documentation](README.md)
- [INDEX](../INDEX.md)
