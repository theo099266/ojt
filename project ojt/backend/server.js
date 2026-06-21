require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = rows[0];

        if (password !== user.password_hash) {
            return res.status(401).json({ message: "Wrong password" });
        }

        res.json({
            message: "Login successful",
            user
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/users", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, username, role FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =========================
   START SERVER
========================= */
app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});