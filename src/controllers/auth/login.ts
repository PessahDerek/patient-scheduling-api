import {AppError, Controller} from "../../libs/@types/global";
import {api} from "../../app";
import User, {UserRole} from "../../database/models/user.entity";
import {generateAuthToken, passwordsMatch, verifyFields} from "../../utils/methods/shortmethods";


const adminLogin: Controller = async (req, res, next) => {
    try {
        verifyFields(['contact', 'password'], req.body)
        const found = await api.users.findOne({
            $and: [{$or: [{email: req.body.contact}, {phone: req.body.contact}]}, {role: UserRole.ADMIN}]
        }, {populate: ['password']})
        if (found) {
            // compare passwords
            if (passwordsMatch(req.body.password, found.password)) {
                console.log(`\tEnded: ${Date.now()}`)
                return res.status(200).json({
                    message: "Welcome back!",
                    token: generateAuthToken({id: found.id, role: found.role, complete: found.complete()}), // todo: modify to assess profile completion,
                    user:{
                        firstName: found.firstName,
                        role: found.role,
                        gender: found.gender,
                    }
                }).end(()=>{
                    console.log(`\tEnded final: ${Date.now()}`)
                })
            }
            return res.status(400).json({message: "Wrong password or email/phone combination!"}).end()
        }
        // not found, check if an admin exists
        const count = await api.em.count(User, {role: UserRole.ADMIN})
        if (count > 0) {
            return res.status(403).json({message: "You cannot create your own admin account! Please contact administration!"})
        }

        // create initial admin account

        const newAdmin = api.users.create({
            firstName: 'default',
            lastName: 'default',
            phone: req.body.contact.includes("@") ? '0000000000' : req.body.contact,
            email: req.body.contact.includes('@') ? req.body.contact : 'default',
            role: UserRole.ADMIN,
            password: req.body.password
        })
        console.log("\tcreated user", newAdmin.firstName)
        await api.em.persistAndFlush(newAdmin)
            .then(() => {
                console.log("\tPersisted user", newAdmin.firstName)
                res.status(200).json({
                    postMessage: "Account successfully created!",
                    token: generateAuthToken({id: newAdmin.id, role: newAdmin.role, complete: newAdmin.complete()}),
                    role: newAdmin.role,
                }).end()
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({message: err.message})
            })
    } catch (e) {
        if (e instanceof AppError)
            return res.status(e.status).json({message: e.message}).end()
        console.error(e)
        res.status(500).json({message: "Sorry, something went wrong!"}).end()
    }
}


export const handleUserLogins: Controller = (req, res, next) => {
    switch (req.body.role) {
        case "admin":
            adminLogin(req, res, next)
            break;
        default:
            res.status(400).json({message: "Something went wrong with your request, please refresh and try again!"})
    }
}