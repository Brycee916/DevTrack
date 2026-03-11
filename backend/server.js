const express = require("express"); //imports express framework
const cors = require("cors"); //imports cors middleware

const app = express() //create express application instance that will be web server

app.use(cors()); //enables cross origin resource sharing, allowing server to accept requests from different domains
app.use(express.json()); //adds middleware that automatically parses incoming json request bodies


// APIs
app.get("/", (req, res) => {
    res.send("DevTrack API running");
});

app.listen(5000, ()=> {
    console.log("Server running on Port 5000");
});
