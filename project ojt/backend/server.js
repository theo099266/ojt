require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

/* =========================
   API: Get users from DB
========================= */
app.get("/manager", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, username, role FROM manager"
        );

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