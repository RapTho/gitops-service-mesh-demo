const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send(`Hello my version is: ${process.env.VERSION || "v1"}\n`);
});

router.post("/echo", (req, res) => {
    if (process.env.DEBUG == "true") console.log(`req.body = ${JSON.stringify(req.body)}`)  
    res.send(`The client sent: ${JSON.stringify(req.body)}\n`);
})

module.exports = router;