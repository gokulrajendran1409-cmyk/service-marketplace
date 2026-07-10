const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
require("dotenv").config();

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL,
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_SERVICE_ACCOUNT_JSON,
} = process.env;

function getServiceAccount() {
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return {
      type: "service_account",
      project_id: FIREBASE_PROJECT_ID,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: FIREBASE_CLIENT_EMAIL,
      ...(process.env.FIREBASE_PRIVATE_KEY_ID && { private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID }),
      ...(process.env.FIREBASE_CLIENT_ID && { client_id: process.env.FIREBASE_CLIENT_ID }),
      ...(process.env.FIREBASE_CLIENT_X509_CERT_URL && { client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL }),
    };
  }

  if (FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (error) {
      console.error("❌ Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", error.message);
    }
  }

  const envFilePath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envFilePath)) {
    try {
      const envFileContent = fs.readFileSync(envFilePath, "utf8");
      let parsed = null;
      try {
        parsed = JSON.parse(envFileContent);
      } catch (err) {
        // Try to extract a JSON object from the file (handles .env with embedded JSON blob)
        const m = envFileContent.match(/\{[\s\S]*\}/m);
        if (m) {
          try {
            parsed = JSON.parse(m[0]);
          } catch (e) {
            // fall through
          }
        }
      }

      if (parsed && parsed.private_key && parsed.client_email && parsed.project_id) {
        return parsed;
      }
    } catch (error) {
      // Ignore and continue to the next fallback
    }
  }

  return null;
}

const serviceAccount = getServiceAccount();

const existingApps = typeof admin.getApps === "function" ? admin.getApps() : (admin.apps || []);
if (!existingApps.length) {
  try {
    if (GOOGLE_APPLICATION_CREDENTIALS) {
      // If GOOGLE_APPLICATION_CREDENTIALS points to a JSON file, try to read project_id from it
        let gac = GOOGLE_APPLICATION_CREDENTIALS;
        let content = null;
        if (fs.existsSync(gac)) {
          content = fs.readFileSync(gac, 'utf8');
        } else if (gac.trim().startsWith('{')) {
          content = gac;
        }

        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (parsed && parsed.project_id) {
              process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || parsed.project_id;
              process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || parsed.project_id;
              process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || parsed.project_id;
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      admin.initializeApp({
        credential: (typeof admin.applicationDefault === 'function') ? admin.applicationDefault() : undefined,
        ...(FIREBASE_DATABASE_URL ? { databaseURL: FIREBASE_DATABASE_URL } : {}),
      });
    } else if (serviceAccount) {
      // Ensure project id is available to Google auth libraries
      if (serviceAccount.project_id) {
        process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || serviceAccount.project_id;
        process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || serviceAccount.project_id;
        process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
      }
      admin.initializeApp({
        credential: (typeof admin.cert === 'function') ? admin.cert(serviceAccount) : undefined,
        projectId: serviceAccount.project_id || undefined,
        ...(FIREBASE_DATABASE_URL ? { databaseURL: FIREBASE_DATABASE_URL } : {}),
      });
    } else {
      admin.initializeApp({
        ...(FIREBASE_DATABASE_URL ? { databaseURL: FIREBASE_DATABASE_URL } : {}),
      });
    }

    console.log("✅ Firebase Admin SDK initialized");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
  }
}

let db;
try {
  const { getFirestore } = require('firebase-admin/firestore');
  db = getFirestore();
} catch (err) {
  if (typeof admin.firestore === 'function') {
    db = admin.firestore();
  } else {
    console.error('❌ Unable to initialize Firestore:', err.message);
    throw err;
  }
}

module.exports = db;