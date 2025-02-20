// noinspection ExceptionCaughtLocallyJS

import {AuthError, Controller} from "../libs/@types/global";
import jwt from "jsonwebtoken";

export const adminAuth: Controller = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin")
            throw new AuthError("Not authorized", 403);
        next()
    } catch (err) {
        if (err instanceof AuthError)
            return res.status(err.status).json({message: err.message});
        res.status(403).send("Not authorized");
    }
}


const authorization: Controller = async (req, res, next) => {
    try {
        const token = req.get("Authorization")?.replace("Bearer ", "");
        if (!token)
            throw new AuthError("Invalid or expired token, please log in and try again!", 401);
        const payload = jwt.verify(token, process.env.JWT ?? "");
        console.log("Huh")
        if (typeof payload == "string")
            throw new AuthError("Your session is over, please log in and try again!");
        req['user'] = {token: token, role: payload.role, complete: payload.complete}
        next()
    } catch (error) {
        if (error instanceof AuthError)
            return res.status(error.status).json({message: error.message});
        console.error(error);
        res.status(401).json({
            message: "Authentication failed! Please log in and try again!"
        })
    }
}

export default authorization;

