const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/professionals", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM professionals
            ORDER BY created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch professionals" });
    }
});

module.exports = router;