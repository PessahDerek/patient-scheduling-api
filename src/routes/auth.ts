import express from "express";
import {handleCreateAccount} from "../controllers/auth/signup";
import {handleUserLogins} from "../controllers/auth/login";


const authRouter = express.Router();

authRouter
    .post('/signup', handleCreateAccount)
    .post('/login', handleUserLogins)

export default authRouter;

