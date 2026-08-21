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

function notifyPro(professionalId, event, data) {
    const clients = proClients.get(professionalId);
    if (clients) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of clients) {
            try {
                res.write(payload);
            } catch {
                clients.delete(res);
            }
        }
    }
}

module.exports = { addProClient, removeProClient, notifyPro };
