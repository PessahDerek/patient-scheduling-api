import {Controller} from "../../libs/@types/global";
import {handleError} from "../../utils/methods/shortmethods";
import {api} from "../../app";
import {FilterQuery} from "@mikro-orm/core";
import {Appointment, AppStatus} from "../../database/models/appointment.entity";
import dayjs from "dayjs";
import {emailService} from "../../middleware/emailing";


export const getAllAppointments: Controller = async (req, res) => {
    try {
        const {date, between, doc_id, patient_id} = req.query as {
            date?: string, between?: [string, string], doc_id?: string, patient_id?: string
        };
        // console.log(req.query)
        const filters: FilterQuery<Appointment> = []
        if (date)
            filters.push({date: new Date(date as string)})
        if (between && Array.isArray(between) && between.length == 2)
            filters.push({$and: [{date: {$gte: new Date(between[0])}}, {date: {$lte: new Date(between[1])}}]})
        if (doc_id) {
            const schedules = await api.schedules.find({doctor: doc_id})
            filters.push({schedule: {$in: schedules}})
        }
        if (patient_id) {
            filters.push({patient: patient_id})
        }

        const appointments = await api.appointments.find(
            filters.length > 0 ? {$and: filters} : {}
            , {populate: ["schedule", "patient", "schedule.doctor"]});
        return res.status(200).json(appointments).end();
    } catch (err) {
        handleError(err, res, "Sorry, something went wrong trying to fetch appointments!");
    }
}

export const cancelAppointment: Controller = async (req, res) => {
    try {
        const {appointment_id, reason} = req.body;
        if (!appointment_id)
            return res.status(400).json({message: "Please select a valid appointment"});
        const appointment = await api.appointments.findOne({id: appointment_id}, {populate: ["schedule", "schedule.doctor", "patient"]});
        if (!appointment)
            return res.status(400).json({message: "This appointment does not exist! Please refresh and try again!"});
        // todo: check its not already cancelled
        if (appointment.status == AppStatus.CANCELLED)
            return res.status(400).json({message: "Appointment was already cancelled before!"});
        // todo: check its not overdue
        if (dayjs(appointment.date).isBefore(new Date()))
            return res.status(400).json({message: "Appointment is overdue, you cannot cancel it!"});
        const doctor = appointment.schedule.doctor;
        const patient = appointment.patient
        const cancel_er_id = req.user?.id
        if (!cancel_er_id)
            return res.status(403).json({message: "You do not have necessary permission for this action!"})
        const cancel_er = await api.users.findOne({id: cancel_er_id});
        if (!cancel_er)
            return res.status(400).json({message: "Sorry, something went wrong. Log out and sign in again to try!"})
        const emails: { text: string, to: string }[] = [
            {
                to: patient.email,
                text: `Hello dear ${patient.simple().name}, we hope this email finds you well. \nThis email is to notify you of CANCELLATION of your appointment slotted for ${dayjs(appointment.date).format("ddd DD MMM YYYY")} ${cancel_er.id == patient.id ? '.' : `by ${cancel_er.role} ${cancel_er.simple().name}\n\nReason: ${reason}\nContact ${cancel_er.simple().name} through: \n\t${cancel_er.email}`}\n\t${cancel_er.phone ?? ""}`
            },
            {
                to: doctor.email,
                text: `Hello dear ${doctor.simple().name}, we hope this email finds you well. \nThis email is to notify you of CANCELLATION of your appointment slotted for ${dayjs(appointment.date).format("ddd DD MMM YYYY")} ${cancel_er.id == doctor.id ? '.' : `by ${cancel_er.role} ${cancel_er.simple().name}\n\nReason: ${reason}\\nContact ${cancel_er.simple().name} through: \n\t ${cancel_er.email}\`}\n\t${cancel_er.phone ?? ""}`}`,
            }
        ]
        // send the emails
        const promises = emails.map(email => emailService.sendEmail({...email, subject: "APPOINTMENT CANCELLATION"}))
        Promise.all(promises)
            .then(() => {
                res.status(200).json({message: "Appointment cancellation successful!"});
            })
        // .catch(err => {
        //     throw new Error(err)
        // })
        appointment.status = AppStatus.CANCELLED
        await api.em.persistAndFlush(appointment)
            .catch(err => console.log(err))
    } catch (err) {
        handleError(err, res)
    }
}

