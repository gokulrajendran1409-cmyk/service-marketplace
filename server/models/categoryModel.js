const db = require("../config/db");

const getAllCategories = async () => {
    const snapshot = await db
        .collection("categories")
        .where("is_active", "==", true)
        .orderBy("name", "asc")
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
    getAllCategories
};