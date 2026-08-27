export const API_URL = import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://service-marketplace-af7p.onrender.com/api";

export const getDashboard = async () => {
    const response = await fetch(`${API_URL}/admin/dashboard`);

    if (!response.ok) {
        throw new Error("Failed to load dashboard");
    }

    return response.json();
};