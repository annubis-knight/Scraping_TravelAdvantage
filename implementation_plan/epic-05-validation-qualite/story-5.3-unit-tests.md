# Story 5.3 - Tests Unitaires Critiques

> **Epic:** [5 - Validation & Qualité](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** XL (8h+)
> **Statut:** TODO
> **Dépendances:** [Epic 1](../epic-01-bugs-critiques/) (bugs corrigés avant tests)

---

## Contexte

Aucun test unitaire n'existe. Les modifications de code peuvent introduire des régressions non détectées.

## Solution Proposée

### Setup Jest

```bash
npm install --save-dev jest
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Fonctions à tester en priorité

1. **removeDuplicates()** - Logique de déduplication
2. **compareHotels()** - Comparaison meilleure réduction/prix
3. **filterHotels()** - Filtrage prix > 2× moyenne
4. **readJsonFileSafe()** - Lecture sécurisée JSON
5. **classifyError()** - Classification des erreurs

### Exemple de test

```javascript
// tests/deduplication.test.js
const { removeDuplicates, compareHotels } = require('../src/scraping/index');

describe('compareHotels', () => {
    test('préfère meilleure réduction', () => {
        const hotel1 = { nomHotel: 'Test', reduction: '30%', prixTravel: '100 €' };
        const hotel2 = { nomHotel: 'Test', reduction: '40%', prixTravel: '120 €' };

        const result = compareHotels(hotel1, hotel2);
        expect(result.reduction).toBe('40%');
    });

    test('à réduction égale, préfère prix bas', () => {
        const hotel1 = { nomHotel: 'Test', reduction: '30%', prixTravel: '150 €' };
        const hotel2 = { nomHotel: 'Test', reduction: '30%', prixTravel: '100 €' };

        const result = compareHotels(hotel1, hotel2);
        expect(result.prixTravel).toBe('100 €');
    });
});

describe('filterHotels', () => {
    test('exclut prix > 2× moyenne', () => {
        const hotels = {
            item1: { prixTravel: '100 €' },
            item2: { prixTravel: '110 €' },
            item3: { prixTravel: '500 €' }  // Aberrant
        };

        const filtered = filterHotels(hotels);
        expect(Object.keys(filtered)).toHaveLength(2);
    });
});
```

---

## Fichiers à Créer

| Fichier | Description |
|---------|-------------|
| `tests/deduplication.test.js` | Tests déduplication |
| `tests/filtering.test.js` | Tests filtrage |
| `tests/utils.test.js` | Tests utilitaires |
| `jest.config.js` | Configuration Jest |

---

## Critères d'Acceptation

- [ ] Jest configuré et fonctionnel
- [ ] `npm test` exécute tous les tests
- [ ] Au moins 5 tests pour removeDuplicates
- [ ] Au moins 3 tests pour filterHotels
- [ ] Au moins 3 tests pour readJsonFileSafe
- [ ] Couverture > 50% sur fonctions critiques

---

## Commande de test

```bash
# Tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Couverture
npm test -- --coverage
```

---

## Liens

- [Epic 5 - Validation & Qualité](README.md)
- [INDEX](../INDEX.md)
