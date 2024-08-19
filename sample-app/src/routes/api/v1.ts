import express, { Request, Response } from 'express';
const router = express.Router();

let counter = 0;

router.get("/", (req: Request, res: Response) => {
    res.send(`Hello my version is: ${process.env.VERSION || "v1"}\n`);
});

router.post("/echo", (req: Request, res: Response) => {
    res.send(`The client sent: ${JSON.stringify(req.body)}\n`);
})

router.get("/fail", (req: Request, res: Response) => {
    if(counter <4) {
        counter++;
        res.sendStatus(503);
    } else {
        counter = 0;
        res.sendStatus(200);
    }
})

module.exports = router;