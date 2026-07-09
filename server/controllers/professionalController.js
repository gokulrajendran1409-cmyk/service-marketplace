const db = require('../config/db');

exports.searchProfessionals = async (req, res) => {
    try {
        res.json({ message: "Search professionals endpoint" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfessionalById = async (req, res) => {
    try {
        res.json({ message: `Get professional ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfessional = async (req, res) => {
    try {
        res.json({ message: `Update professional ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
