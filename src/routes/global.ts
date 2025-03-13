import express from "express";
import {editProfile, getUserProfile, getUsers} from "../controllers/global/users";
import {getSchedule, getWorkingDays} from "../controllers/admin";
import {cancelAppointment, getAllAppointments} from "../controllers/global/appointments";
import {createAppointment} from "../controllers/admin/appointments";
import authorization from "../middleware/authorization";


const globalRoutes = express.Router();

globalRoutes
    // .use(authorization) // TODO: add authentication
    .get('/users/:type?', getUsers)
    .get('/working-days', getWorkingDays)
    .get('/schedules', getSchedule)
    .get('/all-appointments', getAllAppointments)
    .get('/profile', authorization, getUserProfile)
    // .get('/all-appointments/:patient_id?/:doc_id?/:between?/:date?', getAllAppointments)
    .post('/profile', authorization, editProfile)
    .post("/book", authorization, createAppointment)
    .post("/cancel-appointment", authorization, cancelAppointment)

export default globalRoutes;

