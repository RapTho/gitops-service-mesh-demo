import express, { Request, Response } from 'express';
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.send(`Hello my version is: ${process.env.VERSION || "v1"}\n`);
});

router.post("/echo", (req: Request, res: Response) => {
    res.send(`The client sent: ${JSON.stringify(req.body)}\n`);
})

module.exports = router;