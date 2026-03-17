const express = require("express");
const pool = require("../db/db");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a project
router.post("/", authMiddleware, async (req, res) => {

    try {
        const userId = req.user.id; //comes from authMiddleware Jwt
        const { title, description } = req.body;

        // Create a new project in the table
        const project = await pool.query("INSERT INTO projects (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
            [userId, title, description]
        );

        console.log(`Created new project ${JSON.stringify(project.rows[0])}`);
        res.json(project.rows[0]);

    } catch (error) {
        return res.status(401).json({ error: "Could not create new project" });
    }

});

// Get user projects


// Delete a project


module.exports = router;