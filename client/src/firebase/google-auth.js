import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "./firebase-config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userDocRef, {
        uid: user.uid,
        fullName: user.displayName || "",
        email: user.email,
        phone: user.phoneNumber || "",
        photoURL: user.photoURL || "",
        provider: "google",
        emailVerified: user.emailVerified,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active",
        role: "customer"
      });
    } else {
      // Update lastLogin
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString(),
        photoURL: user.photoURL || userDoc.data().photoURL // Update photo just in case
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error("Google Sign-in error:", error);
    return { success: false, message: "Google Sign-in failed. Please try again." };
  }
};
