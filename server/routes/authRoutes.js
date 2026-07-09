const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getProfile
} = require("../controllers/authController");

// Test Route
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Authentication Route Working!"
    });
});

// Register Route
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", verifyToken, getProfile);

module.exports = router;