const { Pool } = require("pg");

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect()
    .then((client) => {
        console.log("BoloSaathi PostgreSQL Database Connected Successfully!");
        client.release();
    })
    .catch((err) => {
        console.error("PostgreSQL Connection Failed:", err.message);
    });

module.exports = db;