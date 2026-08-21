const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.json({ message: "Service Marketplace API is running!" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});