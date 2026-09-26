const { z } = require('zod');

// Malayalam unicode regex (includes base Malayalam characters and common marks)
const malayalamRegex = /^[\u0D00-\u0D7F\s]+$/;
// Allows English letters, numbers, spaces, common punctuation and Malayalam characters.
const generalTextRegex = /^[\w\s\.,\-\'\u0D00-\u0D7F]+$/u;

const commonValidations = {
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .regex(/^[\w\s\-\'\u0D00-\u0D7F]+$/u, "Name contains invalid characters")
        .transform(val => val.trim().replace(/\s+/g, ' ')), // Normalize spaces

    email: z.string()
        .email("Please enter a valid email address")
        .max(255, "Email is too long")
        .transform(val => val.trim().toLowerCase()),

    // Indian Phone Number (+91 or just 10 digits)
    phone: z.string()
        .transform(val => val.replace(/\s+/g, '')) // Remove all spaces
        .refine(val => {
            // Check for +91 followed by 10 digits, or just 10 digits starting with 6-9
            const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
            return phoneRegex.test(val);
        }, "Please enter a valid Indian mobile number")
        .transform(val => {
            // Normalize to just the 10 digits
            return val.length === 10 ? val : val.slice(-10);
        }),

    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password is too long"),

    pincode: z.string()
        .regex(/^\d{6}$/, "Please enter a valid 6-digit PIN code"),

    dateOfBirth: z.string().or(z.date()).refine(val => {
        const date = new Date(val);
        const today = new Date();
        return date < today; // Must be in the past
    }, "Date of birth cannot be in the future").transform(val => new Date(val).toISOString().split('T')[0]),
    
    price: z.number().finite().nonnegative("Price cannot be negative"),
    
    commission: z.number().finite().min(0, "Commission cannot be negative").max(100, "Commission cannot exceed 100"),
    
    addressText: z.string()
        .min(3, "Must be at least 3 characters")
        .max(255, "Must be less than 255 characters")
        .regex(generalTextRegex, "Contains invalid characters")
        .transform(val => val.trim()),
};

module.exports = commonValidations;
