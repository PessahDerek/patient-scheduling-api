import express from "express";
import authRouter from "./auth";
import globalRoutes from "./global";
import adminRoutes from "./admin";


const indexRouter = express.Router();

indexRouter
    .use("/auth", authRouter)
    .use("/app", globalRoutes)
    .use('/admin', adminRoutes)

export default indexRouter;

