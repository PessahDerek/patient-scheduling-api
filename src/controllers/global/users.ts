import {Controller} from "../../libs/@types/global";
import User, {UserRole} from "../../database/models/user.entity";
import {api} from "../../app";
import {handleError} from "../../utils/methods/shortmethods";
import {serialize} from "@mikro-orm/core";


export const getUsers: Controller = async (req, res) => {
    try {
        const fromParam = req.query["type"]
        const userType = fromParam == 'patient' ? UserRole.PATIENT : UserRole.DOCTOR;
        const list = await api.em.find(
            User,
            {role: userType},
            userType === UserRole.DOCTOR ? {populate: ["schedules"]} : {}
        )
        res.status(200).json(list)
    } catch (err) {
        console.log(err);
        handleError(err, res)
    }
}

export const getUserProfile: Controller = async (req, res) => {
    try {
        const found = await api.em.findOne(User, {id: req.user?.id},
            {
                fields: ["firstName", "lastName", "email", "phone", "gender"],
                disableIdentityMap: true
            },
        );
        if (!found)
            return res.status(400).json({message: "We could not find associated profile!"});
        const obj = serialize(found);
        let rest;
        if ('simple' in obj) {
            const {simple, ...wanted} = obj
            rest = wanted
        } else {
            rest = obj
        }
        return res.status(200).json(rest);
    } catch (err) {
        handleError(err, res)
    }
}

export const editProfile: Controller = async (req, res) => {
    try {
        const profile = req.body
        delete profile.id
        console.log("update: \n", profile)
        if (!profile)
            return res.status(400).json({message: "Something is wrong with your request, please refresh and try again!"});
        const found = await api.users.findOne({id: req.user?.id});
        if (!found)
            return res.status(400).json({message: "We could not find associated profile!"});
        const rows = await api.em.nativeUpdate(User, {
            id: req.user?.id,
        }, profile)
        if (rows < 1)
            return res.status(400).json({message: "We could not update your profile, please refresh and try again!"});
        return res.status(200).json({message: "Successfully your updated profile!"});
    } catch (err) {
        handleError(err, res)
    }
}

