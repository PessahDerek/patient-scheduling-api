import express from "express";
import {userSignup} from "../controllers/auth/signup";
import {handleUserLogins} from "../controllers/auth/login";
import authorization from "../middleware/authorization";
import {changePassword} from "../controllers/auth/change-password";


const authRouter = express.Router();

authRouter
    .post('/signup', userSignup)
    .post('/login', handleUserLogins)
    .post('/change-password', authorization, changePassword)

export default authRouter;

