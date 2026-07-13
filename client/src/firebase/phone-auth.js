import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "./firebase-config";
import { doc, updateDoc } from "firebase/firestore";

// Initialize invisible reCAPTCHA
export const setupRecaptcha = (buttonId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }
  return window.recaptchaVerifier;
};

// Send OTP
export const sendOTP = async (phoneNumber, appVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true };
  } catch (error) {
    console.error("SMS sending error:", error);
    let message = "Could not send OTP. Please try again.";
    
    if (error.code === 'auth/invalid-phone-number') {
      message = "Invalid phone number format. Include country code (e.g. +1).";
    }

    return { success: false, message };
  }
};

// Verify OTP
export const verifyOTP = async (code) => {
  try {
    const result = await window.confirmationResult.confirm(code);
    const user = result.user;
    return { success: true, user };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, message: "Invalid or expired OTP." };
  }
};

// Update phone verified status in Firestore
export const updatePhoneVerifiedStatus = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      phoneVerified: true
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating phone status:", error);
    return { success: false };
  }
};
