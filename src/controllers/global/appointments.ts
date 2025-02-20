import {Controller} from "../../libs/@types/global";
import {handleError} from "../../utils/methods/shortmethods";
import {api} from "../../app";
import {FilterQuery} from "@mikro-orm/core";
import {Appointment} from "../../database/models/appointment.entity";


export const getAllAppointments: Controller = async (req, res) => {
    try {
        const {date, between, doc_id} = req.params;
        const filters: FilterQuery<Appointment> = []
        if (date)
            filters.push({date: new Date(date)})
        if (between && Array.isArray(between) && between.length == 2)
            filters.push({$and: [{date: {$gte: new Date(between[0])}}, {date: {$lte: new Date(between[1])}}]})
        if (doc_id) {
            const schedules = await api.schedules.find({doctor: doc_id})
            filters.push({schedule: {$in: schedules}})
        }

        const appointments = await api.appointments.findAll(
            filters.length > 0 ? {where: {$and: filters}} : {}
        );
        console.log("Completed:...")
        return res.status(200).json(appointments).end();
    } catch (err) {
        handleError(err, res, "Sorry, something went wrong trying to fetch appointments!");
    }
}

