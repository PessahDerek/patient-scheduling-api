import {AppError, Controller} from "../../libs/@types/global";
import {verifyFields} from "../../utils/methods/shortmethods";
import {api} from "../../app";
import {UserRole} from "../../database/models/user.entity";


export const addUser: Controller = async (req, res, next) => {
    try {
        const role = req.body.role
        console.log(req.body)
        if (role !== "admin" && role !== "doctor")
            return res.status(400).json({message: "Bad request"}).end()
        req.body['role'] = role === "admin" ? UserRole.ADMIN : UserRole.DOCTOR
        // provide default password!
        req.body['password'] = "1234"
        verifyFields(['firstName', 'lastName', 'email', 'phone', 'gender'], req.body)
        // find if user exists
        const found = await api.users.findOne({
            $and: [
                {$or: [{phone: req.body.phone}, {email: req.body.email}]},
                {role: role}
            ]
        })
        if (found)
            return res.status(400).json({message: `${role} already exists!`})
        // create
        const newRole = api.users.create(req.body)
        await api.em.persistAndFlush(newRole)
            .then(() => {
                res.status(200).json({message: `successfully added ${newRole.firstName} as ${newRole.role}`})
            })
    } catch (err) {
        if(err instanceof AppError)
            return res.status(err.status).json({message: err.message}).end()
        console.log(err)
        res.status(500).json({message: "Sorry, something went wrong trying to add user!"}).end()
    }
}

