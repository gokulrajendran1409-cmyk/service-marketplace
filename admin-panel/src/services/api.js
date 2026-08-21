const API_URL = "http://localhost:5000/api";

export const getDashboard = async () => {
    const response = await fetch(`${API_URL}/admin/dashboard`);

    if (!response.ok) {
        throw new Error("Failed to load dashboard");
    }

    return response.json();
};