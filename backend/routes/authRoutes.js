const express = require("express");
const pool = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", async (req, res) => {
    const salt = Number(process.env.SALT);

    try{
        // deconstruct and get the email and password from request body
        const { email, password } = req.body;
        if (!email || !password){
            return res.status(400).json({ error: "Email and password required"});
        }

        // has the password with a salt of 10
        const hash = await bcrypt.hash(password, salt);

        // case check the email
        const lowerCaseEmail = email.toLowerCase();

        // first check if that user already exists in the database by their email
        const userExists = await pool.query(
            "SELECT email FROM users WHERE email=$1",
            [lowerCaseEmail]
        );
        if (userExists.rows[0]){
            console.log(`User already exists ${userExists.rows[0].email}`);
            return res.status(401).json({ error: "User already exists" });
        }

        // parameterized query to prevent sql injection. these values inserted are treated as string, not sql cmds
        // returns all columns of inserted row such as id, email, hash, and created at
        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING *",
            [lowerCaseEmail, hash]
        );

        if (!result.rows[0]){
            return res.status(400).json({ error: "Failed to create user"});
        }
        console.log(`Created new user ${result.rows[0].email}`);
        //http created status code
        return res.status(201).json({
            email: result.rows[0].email,
            created_at: result.rows[0].created_at
        });
        
    } catch(error) {
        //http server error code
        return res.status(500).json({ error: "Server error" });
    }
});


router.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;
        // case normalize and check if email exists
        const lowerCaseEmail = email.toLowerCase();
        const user = await pool.query("SELECT * From users WHERE email=$1",
            [lowerCaseEmail]
        );
        if (user.rows[0].email !== lowerCaseEmail){
            console.log(`${email} does not exist`);
            res.status(404).json({ error: "Email does not exist" });
        }
        // email does exist so check if hashed password was correct
        console.log(`${email} does exist`);
        const savedHashedPassword = user.rows[0].password_hash;
        const match = await bcrypt.compareSync(password, savedHashedPassword);
        if (!match){
            return res.status(404).json({ error: "Incorrect password" });
        }

        // create the jwt
        const token = jwt.sign(
            { id: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log(`Token created for user ${user.rows[0].email}`);

        res.json({ token });

    } catch (error){
        return res.status(500).json({ error: "Server error" });
    }
});

router.get("/getAllUsers", authMiddleware, async (req, res) => {
    const allUsers = await pool.query("SELECT email, created_at FROM users");
    return res.status(200).json(allUsers.rows);
});

module.exports = router;