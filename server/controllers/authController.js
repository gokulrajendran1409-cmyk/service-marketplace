const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const {
    createCustomer,
    createProfessional,
    findCustomerByPhone,
    findCustomerByEmail,
    findProfessionalByPhone,
    findProfessionalByEmail
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

        const existingUser = await findCustomerByPhone(phone);

        if (existingUser.length > 0) {
            const passwordMatches = existingUser[0].password
                ? await bcrypt.compare(password, existingUser[0].password)
                : false;

            if (!passwordMatches) {
                return res.status(409).json({
                    success: false,
                    message: "Phone number already registered."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Account already exists. You can log in instead.",
                userId: existingUser[0].id
            });
        }

        if (email) {
            const existingEmail = await findCustomerByEmail(email);

            if (existingEmail.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered."
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await createCustomer({
            full_name,
            phone,
            email,
            password: hashedPassword
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
        const { phone, password, portal } = req.body;

        const isProfessionalPortal = (portal || "customer").toLowerCase() === "professional";

        let user = null;
        let role = "customer";
        let roles = { customer: true, professional: false };

        if (isProfessionalPortal) {
            user = await findProfessionalByPhone(phone);
            if (!user || user.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Professional not found."
                });
            }
            user = user[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid password."
                });
            }
            role = "professional";
            roles = { customer: false, professional: true };
        } else {
            user = await findCustomerByPhone(phone);
            if (!user || user.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }
            user = user[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid password."
                });
            }
        }

        const token = jwt.sign(
            {
                id: user.id,
                role,
                roles
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
                id: user.id,
                full_name: user.name,
                phone: user.phone,
                email: user.email,
                role,
                roles
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