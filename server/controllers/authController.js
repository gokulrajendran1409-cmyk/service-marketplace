const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByPhone,
    findUserByEmail
} = require("../models/userModel");

// ================= REGISTER =================
const registerUser = async (req, res) => {
    try {
        const { full_name, phone, email, password, role } = req.body;

        if (!full_name || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, phone and password are required."
            });
        }

        const existingUser = await findUserByPhone(phone);

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered."
            });
        }

        if (email) {
            const existingEmail = await findUserByEmail(email);

            if (existingEmail.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered."
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await createUser({
            full_name,
            phone,
            email,
            password: hashedPassword,
            role: role || "customer"
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await findUserByPhone(phone);

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user[0].password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid password."
            });
        }

        const token = jwt.sign(
            {
                id: user[0].id,
                role: user[0].role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user[0].id,
                full_name: user[0].name,
                phone: user[0].phone,
                email: user[0].email,
                role: user[0].role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};

// ================= PROFILE =================
const getProfile = async (req, res) => {
    res.json({
        success: true,
        message: "Protected Route Accessed",
        user: req.user
    });
};

module.exports = {
    registerUser,
    loginUser,
    getProfile
};