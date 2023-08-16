const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
res.send(`Hello my version is: ${process.env.VERSION || "v1"}`);
});


module.exports = router;