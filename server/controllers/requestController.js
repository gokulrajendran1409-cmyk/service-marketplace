const db = require('../config/db');

exports.createRequest = async (req, res) => {
    try {
        res.json({ message: "Customer posts a custom requirement" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNearbyRequests = async (req, res) => {
    try {
        res.json({ message: "Get nearby requests for professional" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerRequests = async (req, res) => {
    try {
        res.json({ message: "Get all requests made by logged-in customer" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
