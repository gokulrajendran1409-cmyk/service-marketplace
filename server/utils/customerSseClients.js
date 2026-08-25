/**
 * Customer-specific SSE client store.
 * Maps customerId -> Set of response objects.
 */
const customerClients = new Map();

function addCustomerClient(customerId, res) {
    if (!customerClients.has(customerId)) {
        customerClients.set(customerId, new Set());
    }
    customerClients.get(customerId).add(res);
}

function removeCustomerClient(customerId, res) {
    if (customerClients.has(customerId)) {
        customerClients.get(customerId).delete(res);
        if (customerClients.get(customerId).size === 0) {
            customerClients.delete(customerId);
        }
    }
}

function notifyCustomer(customerId, event, data) {
    const clients = customerClients.get(customerId);
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

module.exports = { addCustomerClient, removeCustomerClient, notifyCustomer };
