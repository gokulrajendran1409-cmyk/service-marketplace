import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-config";

export const getUserDashboardData = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, message: "User data not found." };
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, message: "Could not retrieve user data." };
  }
};
