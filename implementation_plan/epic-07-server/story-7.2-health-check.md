# Story 7.2 - Health Check Endpoint

> **Epic:** [7 - Améliorations Server](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** S (1-2h)
> **Statut:** TODO

---

## Contexte

Aucun endpoint pour vérifier si le serveur fonctionne correctement. Utile pour monitoring, load balancers, ou scripts de vérification.

## Solution Proposée

```javascript
// server.js

// Route health check
app.get('/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {}
    };

    // Vérifier que mapData.js est accessible
    try {
        const mapData = require('./src/MapLeaflet/mapData.js');
        health.checks.mapData = {
            status: 'ok',
            months: Object.keys(mapData).length
        };
    } catch (e) {
        health.checks.mapData = { status: 'error', message: e.message };
        health.status = 'degraded';
    }

    // Vérifier que resultat.xlsx existe
    const resultatPath = path.join(__dirname, 'src/MapLeaflet/resultat.xlsx');
    if (fs.existsSync(resultatPath)) {
        const stats = fs.statSync(resultatPath);
        health.checks.resultatXlsx = {
            status: 'ok',
            size: stats.size,
            modified: stats.mtime
        };
    } else {
        health.checks.resultatXlsx = { status: 'error', message: 'File not found' };
        health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});
```

### Réponse attendue

```json
{
  "status": "ok",
  "timestamp": "2026-01-24T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "mapData": { "status": "ok", "months": 6 },
    "resultatXlsx": { "status": "ok", "size": 45678, "modified": "2026-01-24T08:00:00.000Z" }
  }
}
```

---

## Fichier à Modifier

`server.js`

---

## Critères d'Acceptation

- [ ] GET /health retourne JSON avec status
- [ ] HTTP 200 si tout OK
- [ ] HTTP 503 si problème détecté
- [ ] Uptime inclus
- [ ] Vérification mapData.js
- [ ] Vérification resultat.xlsx

---

## Usage

```bash
# Vérification simple
curl http://localhost:3000/health

# Dans un script
if curl -s http://localhost:3000/health | grep -q '"status":"ok"'; then
    echo "Server healthy"
else
    echo "Server unhealthy"
fi
```

---

## Liens

- [Epic 7 - Améliorations Server](README.md)
- [INDEX](../INDEX.md)
