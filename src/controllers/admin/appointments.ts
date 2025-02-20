import {Controller} from "../../libs/@types/global";
import {convertToDateTime, handleError} from "../../utils/methods/shortmethods";
import {api} from "../../app";
import dayjs from "dayjs";


export const createAppointment: Controller = async (req, res) => {
    try {
        let {schedule, timeIn, timeOut, date, patient_id} = req.body;
        // set value for duration in milliseconds
        if (!schedule || !timeIn || !timeOut) {
            return res.status(400).json({message: "All fields are required!"})
        }
        const patient = await api.users.findOne(patient_id);
        if (!patient)
            return res.status(400).json({message: "No patient record found!"})
        const findSchedule = await api.schedules.findOne(schedule);
        if (!findSchedule)
            return res.status(400).json({message: "Schedule not found, Doctor might not be in this day!"});
        const duration = dayjs(convertToDateTime(timeIn)).diff(convertToDateTime(timeOut), 'minute');
        if (duration < 30)
            return res.status(400).json({message: "Appointment cannot be less than half an hour!"});
        // check that the doctor is not packed
        const appointments = await api.appointments.find({
            $and: [
                {schedule: findSchedule},
                {date: new Date(date)},
            ]
        })
        // check there is enough time left to hold appointment
        // get duration of doctor's schedule
        const doctorShift = findSchedule.length()
        const bookedTime = appointments.reduce((acc, app) => acc + app.getDuration(), 0)
        const available = doctorShift - bookedTime;
        if (available < duration)
            return res.status(400).json({message: "Not enough time left to book the patient!"});
        const newAppointment = api.appointments.create({
            date: new Date(date),
            timeIn: convertToDateTime(timeIn),
            timeOut: convertToDateTime(timeOut),
            schedule: findSchedule,
            patient: patient
        })

        await api.em.persistAndFlush(newAppointment)
            .then(() => {
                res.status(200).json({message: "Appointment successfully created!"})
            })
    } catch (err) {
        handleError(err, res, "Sorry, something went wrong trying to create appointment! Please try again!");
    }
}

