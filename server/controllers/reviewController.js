const db = require('../config/db');

exports.createReview = async (req, res) => {
    try {
        res.json({ message: "Create a review" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfessionalReviews = async (req, res) => {
    try {
        res.json({ message: `Get reviews for professional ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
