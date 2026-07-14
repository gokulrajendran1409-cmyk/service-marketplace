import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "./firebase-config";
import { doc, setDoc } from "firebase/firestore";

export const registerWithEmail = async (email, password, additionalData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Save user info to Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      fullName: additionalData.fullName || "",
      email: user.email,
      phone: additionalData.phone || "",
      photoURL: user.photoURL || "",
      provider: "email",
      emailVerified: user.emailVerified,
      phoneVerified: !!additionalData.phoneVerified,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: "active",
      role: additionalData.role || "customer"
    });

    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    let message = "Registration failed. Please try again.";
    
    if (error.code === 'auth/email-already-in-use') {
      message = "This email is already registered.";
    } else if (error.code === 'auth/weak-password') {
      message = "Password is too weak. Please use a stronger password.";
    }

    return { success: false, message };
  }
};

export const resendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { success: false, message: error.message };
  }
};
