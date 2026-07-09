const { getAllCategories } = require("../models/categoryModel");

const sampleCategories = [
    { id: 1, name: "Plumbing", icon: "🔧", description: "Pipe repair and installations" },
    { id: 2, name: "Electrical", icon: "⚡", description: "Wiring and appliance fixes" },
    { id: 3, name: "Cleaning", icon: "🧼", description: "Home and office cleaning" },
    { id: 4, name: "Painting", icon: "🎨", description: "Interior and exterior painting" },
];

const getCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error("Falling back to sample categories:", error.message);

        res.status(200).json({
            success: true,
            count: sampleCategories.length,
            data: sampleCategories
        });
    }
};

module.exports = {
    getCategories
};