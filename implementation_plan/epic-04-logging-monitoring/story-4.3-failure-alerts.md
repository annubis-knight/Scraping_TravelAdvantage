# Story 4.3 - Alertes sur Échecs Critiques

> **Epic:** [4 - Logging & Monitoring](README.md)
> **Priorité:** 🟢 P3
> **Complexité:** L (4-8h)
> **Statut:** TODO
> **Dépendances:** [Story 4.1](story-4.1-file-logging.md)

---

## Contexte

En cas de problème critique (taux d'échec élevé, rate limiting massif), aucune notification n'est envoyée.

## Solution Proposée

### Seuils d'alerte

```javascript
const ALERT_THRESHOLDS = {
    failureRate: 10,        // Alerte si > 10% d'échecs
    consecutiveFails: 5,     // Alerte si 5 échecs consécutifs
    rateLimitCount: 3        // Alerte si 3 rate limits
};
```

### Options de notification

#### Option A - Email (nodemailer)

```javascript
const nodemailer = require('nodemailer');

async function sendAlert(subject, body) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.ALERT_FROM,
        to: process.env.ALERT_TO,
        subject: `[SCRAPING ALERT] ${subject}`,
        text: body
    });
}
```

#### Option B - Webhook (Discord/Slack)

```javascript
async function sendWebhookAlert(message) {
    await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
    });
}
```

#### Option C - Fichier alerte local

```javascript
function writeAlertFile(alert) {
    const alertPath = path.join(__dirname, '../../logs/ALERT.txt');
    fs.writeFileSync(alertPath, `${new Date().toISOString()}\n${alert}`);
}
```

---

## Fichiers à Créer/Modifier

| Fichier | Action |
|---------|--------|
| `src/scraping/alertManager.js` | Créer |
| `.env.example` | Ajouter variables SMTP/webhook |
| `src/scraping/index.js` | Intégrer alertes |

---

## Critères d'Acceptation

- [ ] Alerte si taux d'échec > 10%
- [ ] Alerte si 5 échecs consécutifs
- [ ] Alerte si rate limiting détecté 3 fois
- [ ] Au moins une méthode de notification fonctionne
- [ ] Alertes non dupliquées (une par type par run)

---

## Liens

- [Epic 4 - Logging & Monitoring](README.md)
- [INDEX](../INDEX.md)
