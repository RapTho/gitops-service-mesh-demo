const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    if (process.env.DEBUG == true) console.log(req.body)  
    res.send(`Hello my version is: ${process.env.VERSION || "v1"}\n`);
});


module.exports = router;