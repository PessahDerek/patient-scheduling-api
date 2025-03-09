import {Controller} from "../../libs/@types/global";
import User, {UserRole} from "../../database/models/user.entity";
import {api} from "../../app";


export const getUsers: Controller = async (req, res) => {
    try {
        const userType = req.url.includes('patients') ? UserRole.PATIENT : UserRole.DOCTOR;
        const list = await api.em.find(
            User,
            {role: userType},
            userType === UserRole.DOCTOR ? {populate: ["schedules"]} : {}
        )
        res.status(200).json(list)
    } catch (err) {
        console.log(err);
    }
}

