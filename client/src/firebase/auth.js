import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "./firebase-config";
import { doc, getDoc } from "firebase/firestore";

// Listen to auth state changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Fetch additional user data from Firestore
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          callback({ ...user, ...userDoc.data() });
        } else {
          callback(user);
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        callback(user);
      }
    } else {
      callback(null);
    }
  });
};

// Secure logout
export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: error.message };
  }
};
