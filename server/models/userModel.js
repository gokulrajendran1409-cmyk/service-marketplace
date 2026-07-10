const db = require("../config/db");

const createUser = async (userData) => {
    const { full_name, phone, email, password, role } = userData;

    const userRef = await db.collection("users").add({
        full_name,
        phone,
        email,
        password,
        role,
        createdAt: new Date().toISOString(),
    });

    return { id: userRef.id };
};

const findUserByPhone = async (phone) => {
    const snapshot = await db.collection("users").where("phone", "==", phone).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const findUserByEmail = async (email) => {
    const snapshot = await db.collection("users").where("email", "==", email).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
    createUser,
    findUserByPhone,
    findUserByEmail
};