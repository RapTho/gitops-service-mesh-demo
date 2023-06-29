const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
res.send(`Hello my role is: ${process.env.ROLE || "DEFAULT"}`);
});


module.exports = router;