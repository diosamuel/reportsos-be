const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials
  if (username === "reportagent" && password === "assemblyai") {
    res.cookie("auth", "logged_in", {
      httpOnly: true, // Ensures the cookie is only accessible by the web server
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });
    return res.status(200).json({ message: "Login successful" });
  }

  // Failed login
  return res.status(401).json({ message: "Invalid username or password" });
});


module.exports = router;
