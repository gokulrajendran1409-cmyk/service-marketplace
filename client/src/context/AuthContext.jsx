import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const userRef = doc(db, "users", firebaseUser.uid);
          const snapshot = await getDoc(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.data();
            const savedRoles = userData.roles ?? {};
            const roles = {
              customer:
                savedRoles.customer ??
                (savedRoles.professional === true ? false : true),
              professional:
                savedRoles.professional ?? Boolean(userData.professionalDetails),
            };
            const normalizedUser = {
              id: firebaseUser.uid,
              full_name: userData.full_name,
              phone: userData.phone,
              email: userData.email,
              role: userData.role || (roles.professional ? "professional" : "customer"),
              roles,
              professionalDetails: userData.professionalDetails || null,
            };
            setUser(normalizedUser);
            setToken(idToken);
            localStorage.setItem("user", JSON.stringify(normalizedUser));
            localStorage.setItem("token", idToken);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth state error:", error);
          setUser(null);
          setToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
