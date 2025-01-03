import express from "express";


const indexRouter = express.Router();

indexRouter.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).send("Hello World!");
})

export default indexRouter;

