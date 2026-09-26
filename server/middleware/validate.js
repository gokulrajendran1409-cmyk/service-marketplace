const { z } = require('zod');

/**
 * Validation middleware builder
 * @param {z.ZodType} schema - The zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - The request property to validate
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req[source]);
            
            if (!result.success) {
                const errors = {};
                result.error.issues.forEach(issue => {
                    const path = issue.path.join('.');
                    errors[path] = issue.message;
                });
                
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors
                });
            }
            
            // Overwrite the request object with parsed (and normalized) data
            req[source] = result.data;
            next();
        } catch (error) {
            console.error('Validation middleware error:', error);
            res.status(500).json({ success: false, message: 'Internal server error during validation' });
        }
    };
};

module.exports = validate;
