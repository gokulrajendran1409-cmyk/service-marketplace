const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {
    createProfessional,
    findProfessionalByPhone,
    findProfessionalByEmail
} = require("../models/userModel");

// ================= REGISTER PROFESSIONAL =================
const registerProfessional = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            fullName, phone, email, password,
            profession, experience, languages, bio,
            state, district, city, pincode, serviceArea,
            visitCharge, hourlyRate, emergencyCharge,
            workingHours, emergencyService,
            bankName, accountNumber, ifscCode
        } = req.body;

        const authHeader = req.headers.authorization;
        let authenticatedUserId = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                authenticatedUserId = decoded.id;
            } catch (error) {
                console.warn("Professional registration auth token invalid:", error.message);
            }
        }

        // Validate required fields
        if (!fullName || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Full name, phone and email are required."
            });
        }

        if (!authenticatedUserId && !password) {
            return res.status(400).json({
                success: false,
                message: "Password is required for new professional registration."
            });
        }

        if (!profession) {
            return res.status(400).json({
                success: false,
                message: "Please select a profession."
            });
        }

        if (!authenticatedUserId && password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        let existingUserRecord = null;
        let userId = null;

        const existingPhoneUsers = await findProfessionalByPhone(phone);
        if (existingPhoneUsers.length > 0) {
            existingUserRecord = existingPhoneUsers[0];
            const isSameAuthenticatedUser = authenticatedUserId && Number(authenticatedUserId) === Number(existingUserRecord.id);

            if (!isSameAuthenticatedUser) {
                const existingPasswordMatches = existingUserRecord.password
                    ? await bcrypt.compare(password || "", existingUserRecord.password)
                    : false;

                if (!existingPasswordMatches) {
                    return res.status(409).json({
                        success: false,
                        message: "A professional account with this phone already exists. Please log in and try again."
                    });
                }
            }

            userId = existingUserRecord.id;
        }

        // Check if email already exists for another professional account
        if (email) {
            const existingEmailUsers = await findProfessionalByEmail(email);
            const emailConflict = existingEmailUsers.find((user) => Number(user.id) !== Number(userId || 0));

            if (emailConflict) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered with another professional account."
                });
            }
        }

        // Start transaction
        await connection.beginTransaction();

        if (userId) {
            const [existingProfileRows] = await connection.execute(
                `SELECT id FROM professionals WHERE professional_account_id = ?`,
                [userId]
            );

            if (existingProfileRows.length > 0) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: "This account already has a professional profile."
                });
            }

            await connection.execute(
                `UPDATE professionals_account SET name = ?, email = ? WHERE id = ?`,
                [fullName, email || existingUserRecord.email, userId]
            );
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [userResult] = await connection.execute(
                `INSERT INTO professionals_account (name, phone, email, password) VALUES (?, ?, ?, ?)`,
                [fullName, phone, email || null, hashedPassword]
            );

            userId = userResult.insertId;
        }

        // 2. Create professional profile
        await connection.execute(
            `INSERT INTO professionals (
                professional_account_id, profession, experience, languages, bio,
                state, district, city, pincode, service_area,
                visit_charge, hourly_rate, emergency_charge,
                working_hours, emergency_service,
                bank_name, account_number, ifsc_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                profession,
                experience || 0,
                languages || '',
                bio || '',
                state || '',
                district || '',
                city || '',
                pincode || '',
                serviceArea || '',
                visitCharge || 0,
                hourlyRate || 0,
                emergencyCharge || 0,
                workingHours || '',
                emergencyService ? 1 : 0,
                bankName || '',
                accountNumber || '',
                ifscCode || ''
            ]
        );

        // Commit transaction
        await connection.commit();

        // Generate JWT token so the professional is auto-logged in
        const token = jwt.sign(
            { id: userId, role: 'professional' },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "Professional registered successfully! Your application is pending verification.",
            token,
            user: {
                id: userId,
                full_name: fullName,
                phone,
                email,
                role: 'professional'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error("Professional registration error:", error.stack || error);
        console.error("Professional registration payload:", req.body);

        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong during registration. Please try again.",
            details: process.env.NODE_ENV === 'development' ? (error.stack || null) : undefined
        });
    } finally {
        connection.release();
    }
};

// ================= GET PROFESSIONAL PROFILE =================
const getProfessionalProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            `SELECT p.*, u.name, u.email, u.phone 
             FROM professionals p 
             JOIN professionals_account u ON p.professional_account_id = u.id 
             WHERE p.professional_account_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Professional profile not found."
            });
        }

        res.json({
            success: true,
            professional: rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};

// ================= SEARCH PROFESSIONALS =================
const searchProfessionals = async (req, res) => {
    try {
        const { profession, city, district } = req.query;

        let sql = `
            SELECT p.*, u.name, u.phone 
            FROM professionals p 
            JOIN professionals_account u ON p.professional_account_id = u.id 
            WHERE p.verification_status = 'verified'
        `;
        const params = [];

        if (profession) {
            sql += ` AND p.profession = ?`;
            params.push(profession);
        }
        if (city) {
            sql += ` AND p.city = ?`;
            params.push(city);
        }
        if (district) {
            sql += ` AND p.district = ?`;
            params.push(district);
        }

        sql += ` ORDER BY p.created_at DESC`;

        const [rows] = await db.execute(sql, params);

        res.json({
            success: true,
            professionals: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};

// ================= GET PROFESSIONAL BY ID =================
const getProfessionalById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT p.*, u.name, u.email, u.phone 
             FROM professionals p 
             JOIN professionals_account u ON p.professional_account_id = u.id 
             WHERE p.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Professional not found."
            });
        }

        res.json({
            success: true,
            professional: rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};

module.exports = {
    registerProfessional,
    getProfessionalProfile,
    searchProfessionals,
    getProfessionalById
};
