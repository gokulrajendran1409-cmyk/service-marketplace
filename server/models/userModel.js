const db = require("../config/db");

const createCustomer = async (customerData) => {
    const { full_name, phone, email, password } = customerData;

    const [result] = await db.execute(
        `INSERT INTO customers (name, phone, email, password) VALUES (?, ?, ?, ?)`,
        [full_name, phone, email, password]
    );

    return result;
};

const createProfessional = async (professionalData) => {
    const { full_name, phone, email, password } = professionalData;

    const [result] = await db.execute(
        `INSERT INTO professionals_account (name, phone, email, password) VALUES (?, ?, ?, ?)`,
        [full_name, phone, email, password]
    );

    return result;
};

const findCustomerByPhone = async (phone) => {
    const [rows] = await db.execute("SELECT * FROM customers WHERE phone = ?", [phone]);
    return rows;
};

const findCustomerByEmail = async (email) => {
    const [rows] = await db.execute("SELECT * FROM customers WHERE email = ?", [email]);
    return rows;
};

const findProfessionalByPhone = async (phone) => {
    const [rows] = await db.execute("SELECT * FROM professionals_account WHERE phone = ?", [phone]);
    return rows;
};

const findProfessionalByEmail = async (email) => {
    const [rows] = await db.execute("SELECT * FROM professionals_account WHERE email = ?", [email]);
    return rows;
};

module.exports = {
    createCustomer,
    createProfessional,
    findCustomerByPhone,
    findCustomerByEmail,
    findProfessionalByPhone,
    findProfessionalByEmail
};