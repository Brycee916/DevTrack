require("dotenv").config();
const { Pool } = require("pg");

const PG_USER = process.env.PG_USER;
const PG_PASS = process.env.PG_PASS;
const PG_HOST = process.env.PG_HOST;
const PG_PORT = process.env.PG_PORT;
const PG_DB = process.env.PG_DB;

const pool = new Pool({
    user: PG_USER,
    password: PG_PASS,
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DB
});

module.exports = pool;