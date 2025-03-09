import express from "express";
import {getUsers} from "../controllers/global/getUsers";
import {getSchedule, getWorkingDays} from "../controllers/admin";
import {cancelAppointment, getAllAppointments} from "../controllers/global/appointments";
import {createAppointment} from "../controllers/admin/appointments";
import authorization from "../middleware/authorization";


const globalRoutes = express.Router();

globalRoutes
    // .use(authorization) // TODO: add authentication
    .get('/doctors', getUsers)
    .get('/working-days', getWorkingDays)
    .get('/schedules', getSchedule)
    .get('/all-appointments', getAllAppointments)
    // .get('/all-appointments/:patient_id?/:doc_id?/:between?/:date?', getAllAppointments)
    .post("/book", authorization, createAppointment)
    .post("/cancel-appointment", authorization, cancelAppointment)

export default globalRoutes;

