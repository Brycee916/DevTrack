const express = require("express");
const pool = require("../db/db");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a project, make sure to check if selected status and priority is...
router.post("/", authMiddleware, async (req, res) => {

    try {
        const userId = req.user.id; //comes from authMiddleware Jwt
        const { title, description, status, priority } = req.body;

        // Create a new project in the table
        project = await pool.query("INSERT INTO projects (user_id, title, description, status, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userId, title, description, status, priority]
        );
        
        console.log(`Created new project ${JSON.stringify(project.rows[0])}`);
        res.json(project.rows[0]);

    } catch (error) {
        return res.status(401).json({ error: "Project saved" });
    }

});

// Get user projects
router.get("/getAll", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    
    try{
        const projects = await pool.query("SELECT id, title, description, created_at, status, priority FROM projects WHERE user_id=$1",
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

// Update project - status (active/complete), priority (low/medium/high). in frontend, if it's active then shouldnt need priority
router.put("/updateProjectId=:id", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { title, description, status, priority } = req.body;

    try {
        const result = await pool.query("UPDATE TABLE projects SET title=$1, description=$2, status=$3, priority=$4 WHERE id=$5 and user_id=$6"
            [title, description, status, priority, projectId, userId]
        );
        res.json({ success: "Project updated" });
    } catch (error) {
        return res.status(404).json({ error: "Server error" });
    }
});

module.exports = router;