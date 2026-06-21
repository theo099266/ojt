require("dotenv").config();
const db = require("./db");

async function test() {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        console.log(rows);
    } catch (err) {
        console.error(err);
    }
}

test();