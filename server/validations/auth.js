const { z } = require('zod');
const { name, email, phone, password } = require('./common');

const registerSchema = z.object({
    name: name,
    email: email,
    phone: phone,
    password: password,
    profile_photo: z.string().optional().nullable()
});

const loginSchema = z.object({
    email: email,
    password: z.string().min(1, "Password is required") // Do not enforce full constraints on login to prevent breaking legacy users
});

module.exports = {
    registerSchema,
    loginSchema
};
