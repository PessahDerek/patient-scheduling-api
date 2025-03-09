import express from "express";
import {userSignup} from "../controllers/auth/signup";
import {handleUserLogins} from "../controllers/auth/login";


const authRouter = express.Router();

authRouter
    .post('/signup', userSignup)
    .post('/login', handleUserLogins)

export default authRouter;

