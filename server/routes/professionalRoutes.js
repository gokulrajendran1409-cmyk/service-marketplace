const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const professionalController = require('../controllers/professionalController');
const { protectProfessional } = require('../middleware/authMiddleware');

// Ensure uploads dir exists for document storage
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

// Map exact fields expected by multer
router.post('/register', upload.fields([
    { name: 'id_proof', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]), professionalController.registerProfessional);
router.post('/login', professionalController.loginProfessional);

// Dashboard and Requests
router.get('/dashboard', protectProfessional, professionalController.getDashboardStats);
router.get('/requests', protectProfessional, professionalController.getMyRequests);
router.post('/requests/:id/respond', protectProfessional, professionalController.respondToRequest);
router.patch('/requests/:id/journey', protectProfessional, professionalController.updateRequestJourney);
router.post('/requests/:id/verify-otp', protectProfessional, professionalController.verifyOtp);
router.post('/requests/:id/submit-wage', protectProfessional, professionalController.submitWage);
router.patch('/requests/:id/location', protectProfessional, professionalController.updateLocation);
router.patch('/current-location', protectProfessional, professionalController.updateCurrentLocation);

const { addProClient, removeProClient } = require('../utils/proSseClients');

// SSE stream for real-time professional notifications.
// Authenticated via protectProfessional — supports both the standard Bearer header
// (for fetch-like clients) and the ?token= query param used by native EventSource
// (which cannot set custom headers). Uses req.professionalId from the middleware
// so the client cannot spoof another professional's stream via the URL path.
router.get("/notifications/stream/:id", protectProfessional, (req, res) => {
    // Always use the authenticated professionalId from the JWT token — NEVER
    // trust the path param as the source of truth for access control.
    const proId = req.professionalId;

    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    const heartbeat = setInterval(() => {
        try { res.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
    }, 20_000);

    addProClient(proId, res);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeProClient(proId, res);
    });
});

// Also expose the stream at /notifications/stream (without /:id) for clients that
// authenticate purely via the token. Identical behavior to the route above.
router.get("/notifications/stream", protectProfessional, (req, res) => {
    const proId = req.professionalId;

    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    const heartbeat = setInterval(() => {
        try { res.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
    }, 20_000);

    addProClient(proId, res);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeProClient(proId, res);
    });
});

module.exports = router;
