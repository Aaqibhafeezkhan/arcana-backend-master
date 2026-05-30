// ✅ Must be very first
require("dotenv").config();
require("./newsletterJob");

console.log("Server starting...");

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paystackRoutes = require("./routes/paystackRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const returnRoutes = require("./routes/returnRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const fileUpload = require("express-fileupload");
const path = require("path");
const morgan = require("morgan");

// ✅ DB
connectDB();

const app = express();

// ✅ CORS (safe default)
app.use(
  cors({
    origin: "https://shop-arcana.store",     // ← your exact live domain (no *)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 204
  })
);

// ✅ Body parsing
app.use(express.json());

// ✅ File uploads (Cloudinary-compatible)
app.use(
  fileUpload({
    useTempFiles: false,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB safety
  })
);

// ✅ Logging
app.use(morgan("dev"));

// ✅ Static uploads (if any local files exist)
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// =======================
// ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);
app.use("/api/returns", returnRoutes); // ✅ FIXED (no collision)
app.use("/api/newsletter", newsletterRoutes);

// =======================
// HEALTH CHECK
// =======================
app.get("/api/ping", (req, res) => {
  res.status(200).send("Arcana backend is alive");
});

// =======================
// BACKGROUND JOBS
// =======================
require("./utils/cleanPendingOrders");

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
