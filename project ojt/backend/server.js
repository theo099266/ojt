require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();

// middleware
app.use(cors());
app.use(express.json());
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "---" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(pdf|doc|docx)$/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Word files are allowed."));
  }
};
const uploadImage = multer({ storage: multer.memoryStorage() });

const upload = multer({
  storage,
  fileFilter,
});
module.exports = upload;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
      user: {
        id: user.id,
        username: user.username,
        descrip: user.descrip,
        role: user.role,
        image: user.image ? user.image.toString("base64") : null,
      },
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
    const [usersRaw] = await db.query(
      "SELECT id, username,  password_hash ,role, descrip, image FROM users",
    );

    const users = usersRaw.map((user) => ({
      ...user,
      image: user.image ? Buffer.from(user.image).toString("base64") : null,
    }));

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
        ca.file_path,
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

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("fund", fund);
  formData.append("dv_date", dv_date);
  formData.append("dv_number", dv_number);
  formData.append("bonded_official_id", bondedOfficialId); // must be valid
  formData.append("accountable_official", accountableOfficial);
  formData.append("amount", amount);
  formData.append("spent", spent || 0);
  formData.append("refund", refund || 0);
  formData.append("status", "Ongoing"); // must be Done or Ongoing
  formData.append("created_by", userId); // REQUIRED for POST
  formData.append("attachment", selectedFile);

  try {
    const res = await axios.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Uploaded:", res.data);
  } catch (err) {
    console.error("Upload failed:", err);
  }
}

async function existsInTable(table, id) {
  const [rows] = await db.query(
    `SELECT id FROM ${table} WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows.length > 0;
}

function validateMoney(amount, spent) {
  if (amount === null || Number.isNaN(amount) || amount < 0) {
    return "Amount must be a valid number greater than or equal to 0.";
  }

  if (spent === null || Number.isNaN(spent) || spent < 0) {
    return "Spent must be a valid number greater than or equal to 0.";
  }

  return null;
}
app.post("/cash-advances", upload.single("attachment"), async (req, res) => {
  try {
    const {
      fund,
      dv_date,
      dv_number,
      bonded_official_id,
      accountable_official,
      amount,
      spent = 0,
      refund = 0,
      status = "Ongoing",
      created_by,
      description = null,
      check_date = null,
      check_number = null,
      rv_date = null,
      rv_number = null,
      deposit = null,
      liquidated_date = null,
      bur_number = null,
      remarks = null,
      date_submitted_to_coa = null,
    } = req.body;
    const file_path = req.file ? req.file.filename : null;
    const amountNum = toNumber(amount);
    const spentNum = toNumber(spent);
    const refundNum = toNumber(refund);
    const bondedIdNum = toNumber(bonded_official_id);
    const createdByNum = toNumber(created_by);

    const moneyError = validateMoney(amountNum, spentNum);
    if (moneyError) {
      return res.status(400).json({ error: moneyError });
    }

    if (!bondedIdNum || Number.isNaN(bondedIdNum)) {
      return res.status(400).json({ error: "bonded_official_id is required." });
    }

    if (!createdByNum || Number.isNaN(createdByNum)) {
      return res.status(400).json({ error: "created_by is required." });
    }

    const bondedExists = await existsInTable("bonded_officials", bondedIdNum);
    if (!bondedExists) {
      return res.status(400).json({ error: "Bonded official does not exist." });
    }

    const userExists = await existsInTable("users", createdByNum);
    if (!userExists) {
      return res.status(400).json({ error: "Created by user does not exist." });
    }

    if (!["Done", "Ongoing"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be either Done or Ongoing." });
    }

    const [result] = await db.query(
      `INSERT INTO cash_advances (
        fund,
        dv_date,
        dv_number,
        bonded_official_id,
        accountable_official,
        description,
        check_date,
        check_number,
        amount,
        spent,
        refund,
        rv_date,
        rv_number,
        deposit,
        liquidated_date,
        bur_number,
        status,
        remarks,
        date_submitted_to_coa,
        created_by,
        file_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fund,
        dv_date || null,
        dv_number,
        bondedIdNum,
        accountable_official,
        description,
        check_date || null,
        check_number,
        amountNum,
        spentNum,
        refundNum,
        rv_date || null,
        rv_number,
        toNumber(deposit),
        liquidated_date || null,
        bur_number,
        status,
        remarks,
        date_submitted_to_coa || null,
        createdByNum,
        file_path,
      ],
    );

    return res.status(201).json({
      message: "Cash advance created successfully.",
      id: result.insertId,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.put("/cash-advances/:id", upload.single("attachment"), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fund,
      dv_date,
      dv_number,
      bonded_official_id,
      accountable_official,
      amount,
      spent = 0,
      refund = 0,
      status = "Ongoing",
      description = null,
      check_date = null,
      check_number = null,
      rv_date = null,
      rv_number = null,
      deposit = null,
      liquidated_date = null,
      bur_number = null,
      remarks = null,
      date_submitted_to_coa = null,
    } = req.body;

    const idNum = toNumber(id);
    const amountNum = toNumber(amount);
    const spentNum = toNumber(spent);
    const refundNum = toNumber(refund);
    const bondedIdNum = toNumber(bonded_official_id);

    if (!idNum || Number.isNaN(idNum)) {
      return res.status(400).json({ error: "Invalid cash advance id." });
    }

    const moneyError = validateMoney(amountNum, spentNum);
    if (moneyError) {
      return res.status(400).json({ error: moneyError });
    }

    if (!bondedIdNum || Number.isNaN(bondedIdNum)) {
      return res.status(400).json({ error: "bonded_official_id is required." });
    }

    const [existingRows] = await db.query(
      "SELECT id FROM cash_advances WHERE id = ? LIMIT 1",
      [idNum],
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Cash advance not found." });
    }

    const bondedExists = await existsInTable("bonded_officials", bondedIdNum);
    if (!bondedExists) {
      return res.status(400).json({ error: "Bonded official does not exist." });
    }

    if (!["Done", "Ongoing"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be either Done or Ongoing." });
    }
    const file_path = req.file ? req.file.filename : null;

    const [result] = await db.query(
      `UPDATE cash_advances
      SET fund = ?,
      dv_date = ?,
      dv_number = ?,
       bonded_official_id = ?,
       accountable_official = ?, description = ?, check_date = ?, check_number = ?,
       amount = ?, spent = ?, refund = ?, rv_date = ?, rv_number = ?, deposit = ?,
       liquidated_date = ?, bur_number = ?, status = ?, remarks = ?, date_submitted_to_coa = ?,
       file_path = COALESCE(?, file_path)   -- keep old if no new file
   WHERE id = ?`,
      [
        fund,
        dv_date || null,
        dv_number,
        bondedIdNum,
        accountable_official,
        description,
        check_date || null,
        check_number,
        amountNum,
        spentNum,
        refundNum,
        rv_date || null,
        rv_number,
        toNumber(deposit),
        liquidated_date || null,
        bur_number,
        status,
        remarks,
        date_submitted_to_coa || null,
        file_path,
        idNum,
      ],
    );

    return res.json({
      message: "Cash advance updated successfully.",
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.delete("/cash-advances/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = toNumber(id);

    if (!idNum || Number.isNaN(idNum)) {
      return res.status(400).json({ error: "Invalid cash advance id." });
    }

    const [result] = await db.query("DELETE FROM cash_advances WHERE id = ?", [
      idNum,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cash advance not found." });
    }

    return res.json({
      message: "Cash advance deleted successfully.",
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/officials", async (req, res) => {
  const { name, is_available } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const query =
      "INSERT INTO bonded_officials (name, is_available) VALUES (?, ?)";

    const values = [name, is_available ?? true];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      message: "Official created successfully",
      officialId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/officials/:id", async (req, res) => {
  const { id } = req.params;
  const { name, is_available } = req.body;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM bonded_officials WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Official not found" });
    }

    const updatedName = name ?? rows[0].name;
    const updatedAvailability =
  typeof is_available === "boolean"
    ? (is_available ? 1 : 0)
    : rows[0].is_available;

await db.execute(
  "UPDATE bonded_officials SET name = ?, is_available = ? WHERE id = ?",
  [updatedName, updatedAvailability, id],
);


    res.status(200).json({ message: "Official updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/officials/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM bonded_officials WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Official not found" });
    }

    res.status(200).json({ message: "Official deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/users", async (req, res) => {
  const { username, password_hash, role, descrip = "" } = req.body;

  if (!username || !password_hash) {
    return res.status(400).json({ error: "Username and password_hash are required" });
  }

  const allowedRoles = ["admin", "user"];
  const userRole = role ?? "user";
  if (!allowedRoles.includes(userRole)) {
    return res.status(400).json({ error: `Invalid role. Allowed values: ${allowedRoles.join(", ")}` });
  }

  try {
    const query = "INSERT INTO users (username, password_hash, role, descrip) VALUES (?, ?, ?, ?)";
    const values = [username, password_hash, userRole, descrip];
    const [result] = await db.execute(query, values);

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, role, descrip } = req.body;

  // 1. Strict Validation: Only allow 'admin' or 'user'
  const allowedRoles = ["admin", "user"];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({
      error: `Invalid role. Allowed values are strictly: ${allowedRoles.join(", ")}`,
    });
  }

  try {
    // 2. Verify if the user exists
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Fallback to existing database values if fields aren't provided
    const updatedUsername = username ?? rows[0].username;
    const updatedRole = role ?? rows[0].role;
    const updatedDescrip = descrip ?? rows[0].descrip;

    // 4. Update the database
    await db.execute(
      "UPDATE users SET username = ?, role = ?, descrip = ? WHERE id = ?",
      [updatedUsername, updatedRole, updatedDescrip, id],
    );

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/specific/onlyoneuser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
         id,
         username,
         descrip,
         role,
         image
       FROM users
       WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = rows[0];

    res.json({
      ...user,
      image: user.image ? Buffer.from(user.image).toString("base64") : null,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
app.get("/onlyoneCash_Advances", async (req, res) => {});
app.get("/onlyoneBonded_Officials", async (req, res) => {
  try {
    const [bondedOfficials] = await db.query(
      "SELECT id, name, is_available FROM bonded_officials ORDER BY id ASC",
    );

    res.json(bondedOfficials);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
app.post("/upload-image/:id", uploadImage.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  await db.query("UPDATE users SET image=? WHERE id=?", [
    req.file.buffer,
    req.params.id,
  ]);

  res.json({ message: "Image uploaded successfully" });
});






// // Update user (username, role, descrip)
// app.put("/users/:id", async (req, res) => {
//   try {
//     const { username, role, descrip } = req.body;
//     await db.query(
//       "UPDATE users SET username=?, role=?, descrip=? WHERE id=?",
//       [username, role, descrip, req.params.id],
//     );
//     res.json({ message: "User updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
