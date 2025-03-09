import {Controller} from "../../libs/@types/global";
import {convertToDateTime, handleError} from "../../utils/methods/shortmethods";
import {api} from "../../app";
import {AppStatus} from "../../database/models/appointment.entity";


export const createAppointment: Controller = async (req, res) => {
    try {
        let {schedule, timeIn, date, patient_id} = req.body;
        // set value for duration in milliseconds
        if (!schedule || !timeIn || !date) {
            return res.status(400).json({message: "All fields are required!"})
        }
        patient_id = patient_id ? patient_id : req.user?.id
        const patient = await api.users.findOne(patient_id);
        if (!patient)
            return res.status(400).json({message: "No patient record found!"})
        const findSchedule = await api.schedules.findOne(schedule);
        if (!findSchedule)
            return res.status(400).json({message: "Schedule not found, Doctor might not be in this day!"});

        // check that the doctor is not packed
        const appointments = await api.appointments.findOne({
            $or: [
                {
                    $and: [
                        {schedule: findSchedule},
                        {date: new Date(date)},
                        {timeIn: convertToDateTime(timeIn)},
                    ]
                },
                {
                    $and: [
                        {schedule: findSchedule},
                        {date: new Date(date)},
                        {patient: patient_id},
                    ]
                }
            ]
        })
        if (appointments) {
            const message = appointments.patient.id == req.user?.id ? appointments.status === AppStatus.UPCOMING ? "You cannot book consecutive appointments. Please attended the existing appointments first!" : "You already have an appointment at this time or on this day" : `Doctor ${findSchedule.doctor.firstName} has another appointment at this time!`
            return res.status(400).json({message})
        }
        // check there is enough time left to hold appointment
        // get duration of doctor's schedule
        const newAppointment = api.appointments.create({
            date: new Date(date),
            timeIn: convertToDateTime(timeIn),
            schedule: findSchedule,
            patient: patient
        })

        await api.em.persistAndFlush(newAppointment)
            .then(() => {
                res.status(200).json({message: "Appointment successfully created!"})
            })
    } catch (err) {
        console.log(err)
        handleError(err, res, "Sorry, something went wrong trying to create appointment! Please try again!");
    }
}

