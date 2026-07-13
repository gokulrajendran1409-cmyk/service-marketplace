import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update lastLogin in Firestore
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString()
      });
    } catch (e) {
      console.error("Could not update lastLogin", e);
    }

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    let message = "Login failed. Please try again.";
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = "Invalid email or password.";
    } else if (error.code === 'auth/too-many-requests') {
      message = "Too many failed attempts. Please try again later.";
    }

    return { success: false, message };
  }
};
