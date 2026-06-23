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
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    if (password !== user.password_hash) {
      return res.status(401).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login successful",
      user,
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
app.get("/all", async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, username, role FROM users");

    const [bondedOfficials] = await db.query(
      "SELECT id, name, is_available FROM bonded_officials",
    );

    const [cashAdvances] = await db.query(`
            SELECT
            ca.id,
    ca.fund,
    ca.dv_date,
    ca.dv_number,
    bo.name AS bonded_official,
    ca.accountable_official,
    ca.amount,
    ca.spent,
    ca.refund,
    ca.status,
    u.username AS created_by,
    ca.created_at
FROM cash_advances ca
LEFT JOIN bonded_officials bo
    ON ca.bonded_official_id = bo.id
LEFT JOIN users u
    ON ca.created_by = u.id
ORDER BY ca.created_at DESC
`);

    res.json({
      users,
      bondedOfficials,
      cashAdvances,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
app.post("/cash-advances", async (req, res) => {
    try {
        const {
            fund,
            dv_date,
            dv_number,
            bonded_official_id,
            accountable_official,
            amount,
            spent,
            refund,
            status,
            created_by
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO cash_advances
            (
                fund,
                dv_date,
                dv_number,
                bonded_official_id,
                accountable_official,
                amount,
                spent,
                refund,
                status,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fund,
                dv_date,
                dv_number,
                bonded_official_id,
                accountable_official,
                amount,
                spent,
                refund,
                status,
                created_by
            ]
        );

        res.status(201).json({
            message: "Cash advance created",
            id: result.insertId
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put("/cash-advances/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            fund,
            dv_date,
            dv_number,
            bonded_official_id,
            accountable_official,
            amount,
            spent,
            refund,
            status
        } = req.body;

        const [result] = await db.query(
            `UPDATE cash_advances
            SET
                fund=?,
                dv_date=?,
                dv_number=?,
                bonded_official_id=?,
                accountable_official=?,
                amount=?,
                spent=?,
                refund=?,
                status=?
            WHERE id=?`,
            [
                fund,
                dv_date,
                dv_number,
                bonded_official_id,
                accountable_official,
                amount,
                spent,
                refund,
                status,
                id
            ]
        );

        res.json({
            message: "Cash advance updated",
            affectedRows: result.affectedRows
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete("/cash-advances/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM cash_advances WHERE id = ?",
            [id]
        );

        res.json({
            message: "Cash advance deleted",
            affectedRows: result.affectedRows
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
