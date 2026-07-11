import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const buildAuthEmail = (phone, email) => {
  const normalizedPhone = phone?.toString().replace(/\D/g, "") || "";
  const normalizedEmail = email?.trim().toLowerCase() || "";
  return normalizedEmail || `${normalizedPhone}@servora.local`;
};

const buildUserPayload = ({ full_name, phone, email, role, professionalDetails }) => ({
  full_name,
  phone,
  email: email?.trim() || "",
  role,
  professionalDetails: professionalDetails || null,
  updatedAt: serverTimestamp(),
});

const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: uid, ...docSnap.data() };
};

const getUserByPhone = async (phone) => {
  if (!phone) return null;

  const normalizedPhone = phone.toString().replace(/\D/g, "");
  if (!normalizedPhone) return null;

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("phone", "==", phone));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }

  const fallbackQuery = query(usersRef, where("phone", "==", normalizedPhone));
  const fallbackSnapshot = await getDocs(fallbackQuery);

  if (!fallbackSnapshot.empty) {
    const docSnap = fallbackSnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }

  return null;
};

export async function registerUser(data) {
  try {
    const { phone, email, password, full_name } = data;
    const authEmail = buildAuthEmail(phone, email);
    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);

    const userData = buildUserPayload({
      full_name,
      phone,
      email,
      role: "customer",
    });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      user: { id: userCredential.user.uid, ...userData },
    };
  } catch (error) {
    console.error("Firebase registration error:", error);
    return {
      success: false,
      message:
        error.code === "auth/email-already-in-use"
          ? "Phone or email already registered."
          : error.message || "Registration failed.",
    };
  }
}

export async function loginUser(data) {
  try {
    const { phone, password, portal } = data;
    const existingUserProfile = await getUserByPhone(phone);
    const authEmail = buildAuthEmail(phone, existingUserProfile?.email || existingUserProfile?.authEmail);
    const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
    const idToken = await userCredential.user.getIdToken();
    const userProfile = await getUserProfile(userCredential.user.uid);

    if (!userProfile) {
      await signOut(auth);
      return { success: false, message: "User profile not found." };
    }

    if (portal === "professional" && userProfile.role !== "professional") {
      await signOut(auth);
      return { success: false, message: "This portal is only for registered professionals." };
    }

    return {
      success: true,
      user: userProfile,
      token: idToken,
    };
  } catch (error) {
    console.error("Firebase login error:", error);
    return {
      success: false,
      message:
        error.code === "auth/wrong-password"
          ? "Invalid password."
          : error.code === "auth/user-not-found"
          ? "Account not found."
          : error.message || "Login failed.",
    };
  }
}

export async function registerProfessional(data) {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      profession,
      experience,
      languages,
      bio,
      state,
      district,
      city,
      pincode,
      serviceArea,
      visitCharge,
      hourlyRate,
      emergencyCharge,
      workingHours,
      emergencyService,
      bankName,
      accountNumber,
      ifscCode,
    } = data;

    let currentUid = auth.currentUser?.uid;
    let authEmail = buildAuthEmail(phone, email);

    if (!currentUid) {
      if (!password) {
        return { success: false, message: "Password is required for professional registration." };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      currentUid = userCredential.user.uid;
    }

    const userData = buildUserPayload({
      full_name: fullName,
      phone,
      email,
      role: "professional",
      professionalDetails: {
        profession,
        experience,
        languages,
        bio,
        address: { state, district, city, pincode },
        serviceArea,
        pricing: { visitCharge, hourlyRate, emergencyCharge },
        workingHours,
        emergencyService,
        bankDetails: { bankName, accountNumber, ifscCode },
      },
    });

    const userRef = doc(db, "users", currentUid);
    const existing = await getDoc(userRef);

    if (existing.exists()) {
      await updateDoc(userRef, userData);
    } else {
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
      });
    }

    const updatedUser = await getUserProfile(currentUid);
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Firebase professional registration error:", error);
    return {
      success: false,
      message:
        error.code === "auth/email-already-in-use"
          ? "Phone or email already registered."
          : error.message || "Professional registration failed.",
    };
  }
}
