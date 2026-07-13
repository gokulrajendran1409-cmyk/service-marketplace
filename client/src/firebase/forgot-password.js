import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase-config";

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    let message = "Could not send reset email. Please try again.";
    
    if (error.code === 'auth/user-not-found') {
      message = "No account found with this email.";
    } else if (error.code === 'auth/invalid-email') {
      message = "Please enter a valid email address.";
    }

    return { success: false, message };
  }
};
