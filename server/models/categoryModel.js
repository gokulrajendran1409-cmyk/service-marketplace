const db = require("../config/db");

const getAllCategories = async () => {

    const sql = `
        SELECT
            id,
            name,
            icon,
            description
        FROM categories
        WHERE is_active = TRUE
        ORDER BY name ASC
    `;

    const [rows] = await db.execute(sql);

    return rows;
};

module.exports = {
    getAllCategories
};