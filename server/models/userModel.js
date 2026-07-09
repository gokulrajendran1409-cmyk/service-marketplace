const db = require("../config/db");

const createUser = async (userData) => {
    const { full_name, phone, email, password, role } = userData;

    const sql = `
        INSERT INTO users
        (full_name, phone, email, password, role)
        VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
        full_name,
        phone,
        email,
        password,
        role
    ]);

    return result;
};

const findUserByPhone = async (phone) => {

    const sql = "SELECT * FROM users WHERE phone = ?";

    const [rows] = await db.execute(sql, [phone]);

    return rows;
};

const findUserByEmail = async (email) => {

    const sql = "SELECT * FROM users WHERE email = ?";

    const [rows] = await db.execute(sql, [email]);

    return rows;
};


module.exports = {
    createUser,
    findUserByPhone,
    findUserByEmail
};