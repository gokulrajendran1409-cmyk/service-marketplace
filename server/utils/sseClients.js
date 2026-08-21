/**
 * Shared SSE client store.
 * Each connected admin browser tab is one entry in this Set.
 * We keep res (the HTTP response object) to write SSE frames to it.
 */
const clients = new Set();

/**
 * Register a new admin client connection.
 * @param {import('express').Response} res
 */
function addClient(res) {
    clients.add(res);
}

/**
 * Remove a client (called on connection close).
 * @param {import('express').Response} res
 */
function removeClient(res) {
    clients.delete(res);
}

/**
 * Broadcast an SSE event to every connected admin client.
 * @param {string} event  - SSE event name
 * @param {object} data   - JSON-serialisable payload
 */
function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
        try {
            res.write(payload);
        } catch {
            clients.delete(res);
        }
    }
}

module.exports = { addClient, removeClient, broadcast };
