import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

export async function registerUser(data) {
  try {
    const { phone, email, password, full_name } = data;
    const currentUser = auth.currentUser;
    const currentUid = currentUser?.uid;
    if (currentUid) {
      return {
        success: false,
        message: "Please log out before creating a new customer account.",
      };
    }

    const authEmail = buildAuthEmail(phone);
    const methods = await fetchSignInMethodsForEmail(auth, authEmail);
    if (methods.length > 0) {
      return {
        success: false,
        message: "Phone is already registered. Please login instead of registering again.",
      };
    }

    console.log("📝 Registering user:", { phone, authEmail, email, full_name });
    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
    console.log("✅ Firebase account created:", userCredential.user.uid, "Email:", userCredential.user.email);

    await userCredential.user.getIdToken(true);
    await signInWithEmailAndPassword(auth, authEmail, password);
    await auth.currentUser?.reload();
    await auth.currentUser?.getIdToken(true);

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

    const currentUser = auth.currentUser;
    const currentUid = currentUser?.uid;
    let uid = currentUid;

    if (!currentUid) {
      if (!password) {
        return { success: false, message: "Password is required for professional registration." };
      }

      const authEmail = buildAuthEmail(phone);
      const methods = await fetchSignInMethodsForEmail(auth, authEmail);
      if (methods.length > 0) {
        return {
          success: false,
          message: "Phone already registered. Please login and upgrade to become a professional.",
        };
      }

      console.log("📝 Registering professional:", { phone, authEmail, email, fullName });
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      console.log("✅ Firebase account created:", userCredential.user.uid, "Email:", userCredential.user.email);
      uid = userCredential.user.uid;

      await userCredential.user.getIdToken(true);
      await auth.currentUser?.reload();
      await auth.currentUser?.getIdToken(true);

      if (!auth.currentUser || auth.currentUser.uid !== uid) {
        console.log("🔐 Signing in newly created professional account", authEmail);
        await signInWithEmailAndPassword(auth, authEmail, password);
        await auth.currentUser?.reload();
        await auth.currentUser?.getIdToken(true);
      }
    } else {
      const currentUserProfile = await getUserProfile(currentUid);
      if (currentUserProfile?.phone !== phone) {
        return {
          success: false,
          message: "Please use your logged-in phone number when upgrading to professional. Log out to register with a different phone.",
        };
      }
    }

    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return {
        success: false,
        message: "Unable to authenticate user before saving professional profile.",
      };
    }

    await auth.currentUser?.reload();
    await auth.currentUser?.getIdToken(true);

    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);
    if (!existing.exists() && currentUid) {
      return {
        success: false,
        message: "Customer profile not found.",
      };
    }

    const userData = {
      roles: {
        customer: currentUid ? existing.data()?.roles?.customer ?? false : false,
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
