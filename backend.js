// backend.js
// MindWatch Full Backend with MongoDB + Static Frontend

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/mindwatch", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ Mongo Error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// ✅ Signup API
app.post("/signup", async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const exist = await User.findOne({ $or: [{ username }, { email }] });
    if (exist) return res.status(400).json({ message: "⚠ User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, username, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "🎉 Signup successful" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "❌ Server error during signup" });
  }
});

// ✅ Login API
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "⚠ Invalid username or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "⚠ Invalid username or password" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      "secretkey",   // 🔑 use process.env.JWT_SECRET in production
      { expiresIn: "1h" }
    );

    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "❌ Server error during login" });
  }
});

// ✅ Serve Frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Default route → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
