import {Controller} from "../../libs/@types/global";
import {handleError, hashString, passwordsMatch} from "../../utils/methods/shortmethods";
import {api} from "../../app";


export const changePassword: Controller = async (req, res) => {
    try {
        const {current, password, confirm} = req.body;
        const incomplete = !current || !password || !confirm;
        if (incomplete)
            return res.status(400).json({message: "All fields are required!"});
        if (password !== confirm)
            return res.status(400).json({message: "Passwords do not match!"});
        if (password ===  current)
            return res.status(400).json({message: "You cannot use old password as new password!"});
        const found = await api.users.findOne({id: req.user?.id}, {populate: ['password']})
        if (!found)
            return res.status(404).json({message: "We could not find your account, please log in and try again!"});
        if (!passwordsMatch(current, found.password))
            return res.status(403).json({message: "Passwords do not match!"});
        found.password = hashString(password)
        await api.em.persistAndFlush(found)
            .then(()=>res.status(200).json({message: "Successfully changed password!"}))
            .catch(err => {
                throw err;
            })
    } catch (err) {
        handleError(err, res);
    }
}

