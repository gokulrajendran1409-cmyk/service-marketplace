const express = require("express");
const { getDashboard, getUsers, getPendingVerifications, approveProfessional, rejectProfessional, getVerifiedProfessionals, getAllVerifications, getCategories, getServiceRequests, getReviews } = require("../controllers/adminController");
const { addClient, removeClient } = require("../utils/sseClients");

const router = express.Router();

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/verifications", getPendingVerifications);
router.get("/verifications/history", getAllVerifications);
router.post("/verifications/:id/approve", approveProfessional);
router.post("/verifications/:id/reject", rejectProfessional);
router.get("/professionals", getVerifiedProfessionals);
router.get("/categories", getCategories);
router.get("/service-requests", getServiceRequests);
router.get("/reviews", getReviews);

// SSE stream – admin panel subscribes here for real-time notifications
router.get("/notifications/stream", (req, res) => {
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",   // disable nginx buffering if behind a proxy
    });
    res.flushHeaders();

    // Send a heartbeat comment every 20 s to keep the connection alive
    const heartbeat = setInterval(() => {
        try { res.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
    }, 20_000);

    addClient(res);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeClient(res);
    });
});

module.exports = router;
