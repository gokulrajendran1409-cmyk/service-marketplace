const express = require("express");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

const client = new OAuth2Client(
  "215103121223-i90tgh8pdlcug4ft1ij78i67h5go75es.apps.googleusercontent.com"
);

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Google ID token is required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience:
        "215103121223-i90tgh8pdlcug4ft1ij78i67h5go75es.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    console.log("Google user:", {
      googleId,
      email,
      name,
    });

    // Next step: find/create this user in PostgreSQL
    res.json({
      success: true,
      user: {
        googleId,
        email,
        name,
        picture,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(401).json({
      error: "Invalid Google token",
    });
  }
});

module.exports = router;