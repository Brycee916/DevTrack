const express = require("express");
const pool = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", async (req, res) => {
    const salt = 10

    try{
        // deconstruct and get the email and password from request body
        const { email, password } = req.body;
        if (!email || !password){
            return res.status(400).json({ error: "Email and password required"});
        }

        // has the password with a salt of 10
        const hash = await bcrypt.hash(password, salt);

        // parameterized query to prevent sql injection. these values inserted are treated as string, not sql cmds
        // returns all columns of inserted row such as id, email, hash, and created at
        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING *",
            [email, hash]
        );

        if (!result.rows[0]){
            return res.status(400).json({ error: "Failed to create user"});
        }
        
        //http created status code
        return res.status(201).json(result.rows[0]);
        
    } catch(error) {
        console.error(error);

        //http server error code
        return res.status(500).json({ error: "Server error" });
    }
});


router.post("/login", (req, res) => {
    

});



module.exports = router;