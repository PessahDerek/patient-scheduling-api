import {AppError, AuthError, Controller} from "../../libs/@types/global";
import {api} from "../../app";
import User from "../../database/models/user.entity";
import {generateAuthToken, verifyFields} from "../../utils/methods/shortmethods";


const processPassword = (password: string, confirm: string) => {
    if (!password || !confirm)
        throw new AuthError("Password and confirmation required", 400);
    if (password !== confirm)
        throw new AuthError("Passwords don't match", 400);
}

const userSignup: Controller = async (req, res, next) => {
    try {
        verifyFields(['firstName', 'lastName', 'email', 'phone', 'password', 'confirm'], req.body)
        processPassword(req.body?.password, req.body?.confirm)
        //     confirm no similar account exists
        const found = await api.em.findOne(User, {$or: [{email: req.body.email}, {phone: req.body.phone}]})
        if (found)
            return res.status(400).json({message: "User already exists, if it is you, try to log in!"})
        //     save user
        const newUser = api.em.create(User, req.body)
        newUser.password = req.body.password
        await api.em.persistAndFlush(newUser)
            .then(() => res.status(200).json({
                    message: "Account successfully created!",
                    token: generateAuthToken({id: newUser.id, role: newUser.role, complete: false}),
                    role: newUser.role,
                }).end()
            )
    } catch (e) {
        if (e instanceof AppError)
            return res.status(e.status).json({message: e.message}).end()
        console.error(e)
        res.status(500).json({message: "Sorry, something went wrong!"}).end()
    }
}


export const handleCreateAccount: Controller = async (req, res, next) => {

    switch (req.body.role) {
        case "patient":
            userSignup(req, res, next)
            break
        case "doctor":
            break
        default:
            res.status(400).json({message: "Something went wrong with your request!"})
    }
}



