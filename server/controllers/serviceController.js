const db = require('../config/db');

exports.getProfessionalServices = async (req, res) => {
    try {
        res.json({ message: `Get services for professional ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createService = async (req, res) => {
    try {
        res.json({ message: "Create a new fixed service" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        res.json({ message: `Update service ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        res.json({ message: `Delete service ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
