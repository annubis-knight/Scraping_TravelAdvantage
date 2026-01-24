# Story 7.1 - Gestion Erreurs Démarrage

> **Epic:** [7 - Améliorations Server](README.md)
> **Priorité:** 🟡 P2
> **Complexité:** S (1-2h)
> **Statut:** TODO

---

## Contexte

Le serveur exécute `index1_generateResume.js` et `generateMap.js` au démarrage. Si ces scripts échouent, le serveur démarre quand même avec des données potentiellement obsolètes ou corrompues.

## Problème

```javascript
// server.js lignes 21-23 et 33-35
catch (error) {
    console.error('Erreur lors de l\'exécution de index1.js:', error.message);
    // Le serveur continue de démarrer !
}
```

## Solution Proposée

### Option A - Arrêt si erreur critique

```javascript
// server.js
try {
    console.log('Génération resultat.xlsx...');
    execSync('node index1_generateResume.js', { cwd: mapLeafletPath, stdio: 'inherit' });
} catch (error) {
    console.error('❌ ERREUR CRITIQUE: Impossible de générer resultat.xlsx');
    console.error(error.message);
    process.exit(1);  // Arrêt du serveur
}
```

### Option B - Démarrage avec warning

```javascript
let dataGenerationFailed = false;

try {
    execSync('node index1_generateResume.js', ...);
} catch (error) {
    console.warn('⚠️ Génération resultat.xlsx échouée, utilisation données existantes');
    dataGenerationFailed = true;
}

// Plus tard, dans la route /
app.get('/', (req, res) => {
    if (dataGenerationFailed) {
        // Ajouter un banner d'avertissement
    }
    res.sendFile(...);
});
```

### Option C - Vérification fichiers après génération

```javascript
const fs = require('fs');
const path = require('path');

// Après génération
const mapDataPath = path.join(mapLeafletPath, 'mapData.js');
if (!fs.existsSync(mapDataPath)) {
    console.error('❌ mapData.js non généré');
    process.exit(1);
}

const stats = fs.statSync(mapDataPath);
if (stats.size < 100) {  // Fichier trop petit = probablement vide
    console.error('❌ mapData.js semble vide ou corrompu');
    process.exit(1);
}
```

---

## Fichier à Modifier

`server.js`

---

## Critères d'Acceptation

- [ ] Erreur de génération = serveur ne démarre pas (Option A) OU warning visible (Option B)
- [ ] Vérification que mapData.js existe et n'est pas vide
- [ ] Message d'erreur clair avec la cause
- [ ] Code de sortie non-zéro si erreur critique

---

## Liens

- [Epic 7 - Améliorations Server](README.md)
- [INDEX](../INDEX.md)
