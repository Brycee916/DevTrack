const jwt = require("jsonwebtoken");
require("dotenv").config();

// function is used to verify if jwt payload is used for api request
function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    // function gets the token from this: Bearer <token>
    const token = authHeader.split(" ")[1];

    try{
        // decoded contains id, expiresIn
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(error){
        return res.status(401).json({ error: "Invalid token "});
    }
}

module.exports = authMiddleware;