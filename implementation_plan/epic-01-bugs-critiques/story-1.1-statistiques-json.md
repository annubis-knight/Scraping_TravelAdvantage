# Story 1.1 - Initialisation sécurisée statistiques.json

> **Epic:** [1 - Bugs Critiques](README.md)
> **Priorité:** 🔴 P0
> **Complexité:** S (1-2h)
> **Statut:** TODO

---

## Contexte

Le fichier `statistiques.json` stocke les statistiques cumulées de scraping par ville et par mois. Il est lu à chaque exécution du scraping pour fusionner les nouvelles données avec l'historique.

## Problème

Dans `src/scraping/index.js`, le fichier `statistiques.json` est lu sans vérification d'existence préalable :

```javascript
// Ligne ~56 dans index.js
const oldStatsJson = readJsonFile('./json/statistiques.json');
```

Si le fichier n'existe pas (premier lancement ou suppression accidentelle), `JSON.parse()` dans `readJsonFile()` échoue et le scraping crash.

### Reproduction

1. Supprimer `src/scraping/json/statistiques.json`
2. Lancer `npm run 2:scrape`
3. **Résultat:** Crash avec erreur JSON parse

## Solution Proposée

Créer une fonction utilitaire `readJsonFileSafe()` qui :
1. Vérifie l'existence du fichier
2. Retourne une valeur par défaut si le fichier n'existe pas
3. Crée le fichier avec la valeur par défaut (optionnel)

### Code à implémenter

```javascript
// Dans src/scraping/index.js ou dans un nouveau fichier utils.js

const fs = require('fs');
const path = require('path');

/**
 * Lit un fichier JSON de manière sécurisée
 * @param {string} filePath - Chemin vers le fichier JSON
 * @param {*} defaultValue - Valeur par défaut si fichier inexistant
 * @param {boolean} createIfMissing - Créer le fichier s'il n'existe pas
 * @returns {*} Contenu parsé du JSON ou valeur par défaut
 */
function readJsonFileSafe(filePath, defaultValue = {}, createIfMissing = true) {
    const absolutePath = path.resolve(__dirname, filePath);

    if (!fs.existsSync(absolutePath)) {
        console.log(`[INFO] Fichier ${filePath} inexistant, utilisation valeur par défaut`);
        if (createIfMissing) {
            fs.writeFileSync(absolutePath, JSON.stringify(defaultValue, null, 2));
            console.log(`[INFO] Fichier ${filePath} créé avec valeur par défaut`);
        }
        return defaultValue;
    }

    try {
        const content = fs.readFileSync(absolutePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`[WARN] Erreur lecture ${filePath}: ${error.message}`);
        return defaultValue;
    }
}
```

### Modification dans index.js

```javascript
// Avant (ligne ~56)
const oldStatsJson = readJsonFile('./json/statistiques.json');

// Après
const oldStatsJson = readJsonFileSafe('./json/statistiques.json', {});
```

---

## Fichiers à Modifier

| Fichier | Modification | Lignes |
|---------|--------------|--------|
| `src/scraping/index.js` | Remplacer `readJsonFile` par `readJsonFileSafe` pour statistiques.json | ~56 |
| `src/scraping/index.js` | Ajouter fonction `readJsonFileSafe` (ou créer utils.js) | Nouveau |

---

## Critères d'Acceptation

- [ ] Le scraping fonctionne même si `statistiques.json` n'existe pas
- [ ] Un message informatif est loggé quand le fichier est créé
- [ ] Le fichier créé contient `{}` (objet vide valide)
- [ ] Les scraping suivants fusionnent correctement avec le fichier créé
- [ ] Aucune régression sur le comportement existant quand le fichier existe

---

## Tests Manuels

1. **Test premier lancement:**
   ```bash
   # Supprimer le fichier
   rm src/scraping/json/statistiques.json
   # Lancer le scraping
   npm run 2:scrape
   # Vérifier que ça fonctionne et que le fichier est créé
   ```

2. **Test fichier corrompu:**
   ```bash
   # Corrompre le fichier
   echo "invalid json" > src/scraping/json/statistiques.json
   # Lancer le scraping
   npm run 2:scrape
   # Vérifier que ça utilise la valeur par défaut
   ```

3. **Test fonctionnement normal:**
   ```bash
   # S'assurer que le fichier existe et contient des données
   # Lancer le scraping
   npm run 2:scrape
   # Vérifier que les nouvelles stats sont fusionnées
   ```

---

## Notes d'Implémentation

- Considérer créer un fichier `src/scraping/utils.js` pour centraliser les fonctions utilitaires
- Cette fonction pourra être réutilisée pour `saved_hotels.json` (Story 1.2)
- Le paramètre `createIfMissing` permet de contrôler si on veut auto-créer le fichier

---

## Liens

- [Epic 1 - Bugs Critiques](README.md)
- [INDEX](../INDEX.md)
