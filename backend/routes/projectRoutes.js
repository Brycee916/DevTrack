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
router.get("/getAll", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    
    try{
        const projects = await pool.query("SELECT id, title, description, created_at FROM projects WHERE user_id=$1",
            [userId]
        );

        res.json(projects.rows);
    } catch (error){
        return res.status(404).json({ error: "Server error" });
    }
    
});

// Delete a project
router.delete("/deleteProjectId=:id", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const projectId = req.params.id;

    try {
        const result = await pool.query("DELETE FROM projects WHERE id=$1 AND user_id=$2",
            [projectId, userId]
        );

        res.json({ success: "Project deleted" });

    } catch (error) {
        return res.status(404).json({ error: "Server error" });
    }

});


module.exports = router;