# Story 5.4 - Configuration ESLint et Prettier

> **Epic:** [5 - Validation & Qualité](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** M (2-4h)
> **Statut:** TODO

---

## Contexte

Le projet n'a actuellement aucun outil de qualité de code configuré. Cela peut mener à des incohérences de style et des bugs subtils non détectés.

## Problème

- Pas de linting → erreurs potentielles non détectées
- Pas de formatage automatique → styles de code incohérents
- Pas de règles partagées → difficile de maintenir la qualité

### Exemples de problèmes évitables

```javascript
// Variables non utilisées (ESLint les détecte)
const unusedVar = 42;

// Comparaison dangereuse (=== vs ==)
if (value == null) { }

// Inconsistance de quotes
const a = "double";
const b = 'simple';
```

## Solution Proposée

### 1. Installation des dépendances

```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier
```

### 2. Configuration ESLint (.eslintrc.js)

```javascript
// .eslintrc.js (à la racine du projet)
module.exports = {
    env: {
        node: true,
        es2021: true,
        browser: true
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        // Erreurs potentielles
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': 'off', // Autorisé pour ce projet CLI
        'no-undef': 'error',

        // Bonnes pratiques
        'eqeqeq': ['error', 'always', { null: 'ignore' }],
        'no-var': 'error',
        'prefer-const': 'warn',

        // Style (géré par Prettier)
        'prettier/prettier': 'warn'
    },
    globals: {
        // Variables globales du projet
        'mapData': 'readonly'
    }
};
```

### 3. Configuration Prettier (.prettierrc)

```json
{
    "semi": true,
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "none",
    "printWidth": 100,
    "bracketSpacing": true,
    "arrowParens": "avoid"
}
```

### 4. Fichier .prettierignore

```
node_modules/
src/scraping/saveData/
src/scraping/user_data/
*.xlsx
*.json
```

### 5. Fichier .eslintignore

```
node_modules/
src/scraping/saveData/
src/scraping/user_data/
src/MapLeaflet/mapData.js
```

### 6. Scripts npm à ajouter

```json
{
    "scripts": {
        "lint": "eslint src/",
        "lint:fix": "eslint src/ --fix",
        "format": "prettier --write \"src/**/*.js\"",
        "format:check": "prettier --check \"src/**/*.js\""
    }
}
```

---

## Fichiers à Créer/Modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `.eslintrc.js` | Créer | Configuration ESLint |
| `.prettierrc` | Créer | Configuration Prettier |
| `.eslintignore` | Créer | Fichiers à ignorer par ESLint |
| `.prettierignore` | Créer | Fichiers à ignorer par Prettier |
| `package.json` | Modifier | Ajouter scripts lint/format |

---

## Critères d'Acceptation

- [ ] ESLint installé et configuré
- [ ] Prettier installé et configuré
- [ ] `npm run lint` s'exécute sans erreur critique
- [ ] `npm run format` formate le code correctement
- [ ] Les fichiers générés (mapData.js, saveData/) sont ignorés
- [ ] Scripts documentés dans README ou CLAUDE.md

---

## Étapes d'Implémentation

### Étape 1 - Installation

```bash
cd C:\Users\ScrapingTA\Documents\Scraping
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier
```

### Étape 2 - Créer les fichiers de config

Créer `.eslintrc.js`, `.prettierrc`, `.eslintignore`, `.prettierignore` avec le contenu ci-dessus.

### Étape 3 - Premier lint (identifier les problèmes)

```bash
npm run lint
# Lister tous les problèmes actuels
```

### Étape 4 - Fix automatique

```bash
npm run lint:fix
npm run format
# Corriger automatiquement ce qui peut l'être
```

### Étape 5 - Corriger manuellement les erreurs restantes

Revoir les erreurs `no-undef`, `no-unused-vars` qui nécessitent une correction manuelle.

---

## Rapport Initial Attendu

Lors du premier `npm run lint`, attendre potentiellement :
- Plusieurs `no-unused-vars` (variables déclarées mais non utilisées)
- Quelques `eqeqeq` (== au lieu de ===)
- Inconsistances de formatage (corrigées par Prettier)

---

## Intégration CI/CD (Futur)

Pour une intégration future avec GitHub Actions :

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
```

---

## Liens

- [Epic 5 - Validation & Qualité](README.md)
- [Story 5.3 - Tests Unitaires](story-5.3-unit-tests.md)
- [INDEX](../INDEX.md)
