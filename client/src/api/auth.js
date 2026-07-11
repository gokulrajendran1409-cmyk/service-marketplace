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

const buildAuthEmail = (phone) => {
  return `${phone.replace(/\D/g, "")}@servora.local`;
};

const buildUserPayload = ({ full_name, phone, email, roles, professionalDetails, authEmail }) => ({
  full_name,
  phone,
  email: email?.trim() || "",
  authEmail: authEmail || "",
  roles,
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
    const existingUser = await getUserByPhone(phone);
    if (existingUser) {
      return {
        success: false,
        message: "Phone is already registered. Please login or use the professional upgrade flow.",
      };
    }

    const authEmail = buildAuthEmail(phone);
    console.log("📝 Registering user:", { phone, authEmail, email, full_name });
    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
    console.log("✅ Firebase account created:", userCredential.user.uid, "Email:", userCredential.user.email);

    const userData = buildUserPayload({
      full_name,
      phone,
      email,
      roles: {
        customer: true,
        professional: false,
      },
      authEmail,
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
    const authEmail = buildAuthEmail(phone);
    console.log("🔐 Login attempt:", { phone, authEmail, portal });

    const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
    console.log("✅ Login successful for:", authEmail);
    const idToken = await userCredential.user.getIdToken();
    const userProfile = await getUserProfile(userCredential.user.uid);

    if (!userProfile) {
      await signOut(auth);
      return { success: false, message: "User profile not found." };
    }

    if (portal === "customer" && !userProfile.roles?.customer) {
      await signOut(auth);
      return { success: false, message: "This portal is for registered customers only. Please use the professional portal." };
    }

    if (portal === "professional" && !userProfile.roles?.professional) {
      await signOut(auth);
      return { success: false, message: "This portal is only for registered professionals." };
    }

    return {
      success: true,
      user: userProfile,
      token: idToken,
    };
  } catch (error) {
    console.error("❌ Firebase login error:", error.code, error.message);
    console.error("   Tried email:", buildAuthEmail(data.phone));
    return {
      success: false,
      message:
        error.code === "auth/wrong-password" || error.code === "auth/invalid-credential"
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

    const currentUid = auth.currentUser?.uid;
    let uid = currentUid;

    const existingPhoneUser = await getUserByPhone(phone);

    if (!currentUid) {
      if (existingPhoneUser) {
        const authEmail = buildAuthEmail(phone);

        if (existingPhoneUser.roles?.professional && !existingPhoneUser.roles?.customer) {
          return { success: false, message: "Phone already registered as a professional. Please login." };
        }

        if (existingPhoneUser.roles?.customer && !existingPhoneUser.roles?.professional) {
          if (!password) {
            return {
              success: false,
              message: "Phone already registered as a customer. Please login and upgrade to become a professional.",
            };
          }

          try {
            const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
            uid = userCredential.user.uid;
          } catch (error) {
            return {
              success: false,
              message: error.code === "auth/wrong-password" || error.code === "auth/invalid-credential"
                ? "Incorrect password for existing customer account."
                : "Phone already registered. Please login.",
            };
          }
        } else {
          return { success: false, message: "Phone already registered. Please login." };
        }
      } else {
        if (!password) {
          return { success: false, message: "Password is required for professional registration." };
        }

        const authEmail = buildAuthEmail(phone);
        console.log("📝 Registering professional:", { phone, authEmail, email, fullName });
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
        console.log("✅ Firebase account created:", userCredential.user.uid, "Email:", userCredential.user.email);
        uid = userCredential.user.uid;
      }
    } else {
      if (existingPhoneUser && existingPhoneUser.id !== currentUid) {
        return { success: false, message: "This phone number belongs to another account." };
      }
    }

    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);

    const userData = {
      roles: {
        customer: currentUid ? existing.data()?.roles?.customer ?? false : Boolean(existingPhoneUser?.roles?.customer),
        professional: true,
      },
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
      updatedAt: serverTimestamp(),
    };

    if (existing.exists()) {
      await updateDoc(userRef, userData);
    } else {
      // NEW ACCOUNT - add personal details
      await setDoc(userRef, {
        full_name: fullName,
        phone,
        email,
        authEmail: buildAuthEmail(phone),
        ...userData,
        createdAt: serverTimestamp(),
      });
    }

    const updatedUser = await getUserProfile(uid);
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Firebase professional registration error:", error);
    return {
      success: false,
      message:
        error.code === "auth/email-already-in-use"
          ? "Phone already registered."
          : error.message || "Professional registration failed.",
    };
  }
}
