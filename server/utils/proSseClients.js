const db = require('../db');

/**
 * Professional-specific SSE client store.
 * Maps professionalId -> Set of response objects.
 */
const proClients = new Map();

function addProClient(professionalId, res) {
    if (!proClients.has(professionalId)) {
        proClients.set(professionalId, new Set());
    }
    proClients.get(professionalId).add(res);
}

function removeProClient(professionalId, res) {
    if (proClients.has(professionalId)) {
        proClients.get(professionalId).delete(res);
        if (proClients.get(professionalId).size === 0) {
            proClients.delete(professionalId);
        }
    }
}

async function notifyPro(professionalId, event, data) {
    const clients = proClients.get(professionalId);
    if (!clients || clients.size === 0) return;

    if (event === 'new_service_request') {
        try {
            const check = await db.query('SELECT is_online FROM professionals WHERE id = $1', [professionalId]);
            if (!check.rows.length || !check.rows[0].is_online) {
                return; // Do not notify pro if they are offline
            }
        } catch (err) {
            console.error('Error checking professional online status before notifying:', err);
            return;
        }
    }

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
        try {
            res.write(payload);
        } catch {
            clients.delete(res);
        }
    }
}

module.exports = { addProClient, removeProClient, notifyPro };

