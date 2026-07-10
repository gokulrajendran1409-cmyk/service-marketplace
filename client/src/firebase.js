import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAkctNIjuoKCbsLFLdVF_Cc_JOBAH1jm9c",
  authDomain: "service-marketplace-d698d.firebaseapp.com",
  projectId: "service-marketplace-d698d",
  storageBucket: "service-marketplace-d698d.firebasestorage.app",
  messagingSenderId: "828743375578",
  appId: "1:828743375578:web:180a709b8f1177258523e3",
  measurementId: "G-LGJD6ZPWM6",
};

const app = initializeApp(firebaseConfig);
let analytics = null;

if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics, firebaseConfig };
