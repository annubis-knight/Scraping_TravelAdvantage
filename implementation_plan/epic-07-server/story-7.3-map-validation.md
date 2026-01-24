# Story 7.3 - Validation Données Carte

> **Epic:** [7 - Améliorations Server](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** M (2-4h)
> **Statut:** TODO
> **Dépendances:** [Story 5.1 - Validation](../epic-05-validation-qualite/story-5.1-input-validation.md)

---

## Contexte

Si `mapData.js` est corrompu ou mal formaté, la carte Leaflet affiche des erreurs côté client sans indication claire du problème.

## Solution Proposée

### Validation au chargement

```javascript
// src/MapLeaflet/validateMapData.js

function validateMapData(mapData) {
    const errors = [];

    if (typeof mapData !== 'object' || mapData === null) {
        return { valid: false, errors: ['mapData doit être un objet'] };
    }

    const months = Object.keys(mapData);
    if (months.length === 0) {
        errors.push('Aucun mois dans mapData');
    }

    for (const month of months) {
        const cities = mapData[month];

        if (!Array.isArray(cities)) {
            errors.push(`${month}: doit être un tableau`);
            continue;
        }

        cities.forEach((city, i) => {
            if (!city.ville) errors.push(`${month}[${i}]: ville manquante`);
            if (!city.country) errors.push(`${month}[${i}]: country manquant`);
            if (typeof city.lat !== 'number') errors.push(`${month}[${i}]: lat invalide`);
            if (typeof city.lon !== 'number') errors.push(`${month}[${i}]: lon invalide`);
            if (!Array.isArray(city.pourcentages) || city.pourcentages.length !== 3) {
                errors.push(`${month}[${i}]: pourcentages doit être [W%, S%, 2S%]`);
            }
        });
    }

    return { valid: errors.length === 0, errors };
}

module.exports = validateMapData;
```

### Intégration server.js

```javascript
// Au démarrage, après génération mapData
const validateMapData = require('./src/MapLeaflet/validateMapData');
const mapData = require('./src/MapLeaflet/mapData.js');

const validation = validateMapData(mapData);
if (!validation.valid) {
    console.error('❌ mapData.js invalide:');
    validation.errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
}
console.log(`✓ mapData.js valide (${Object.keys(mapData).length} mois)`);
```

---

## Fichiers à Créer/Modifier

| Fichier | Action |
|---------|--------|
| `src/MapLeaflet/validateMapData.js` | Créer |
| `server.js` | Appeler validation au démarrage |

---

## Critères d'Acceptation

- [ ] Structure mapData validée au démarrage
- [ ] Chaque ville a: ville, country, lat, lon, pourcentages[3]
- [ ] Erreurs listées clairement
- [ ] Serveur ne démarre pas si données invalides
- [ ] Validation réutilisable (module)

---

## Liens

- [Epic 7 - Améliorations Server](README.md)
- [INDEX](../INDEX.md)
