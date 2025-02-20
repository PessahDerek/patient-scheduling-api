import express from "express";
import {getUsers} from "../controllers/global/getUsers";
import authorization from "../middleware/authorization";
import {getSchedule, getWorkingDays} from "../controllers/admin";
import {getAllAppointments} from "../controllers/global/appointments";


const globalRoutes = express.Router();

globalRoutes
    // .use(authorization) // TODO: add authentication
    .get('/doctors', getUsers)
    .get('/working-days', getWorkingDays)
    .get('/schedules', getSchedule)
    .get('/all-appointments/:doc_id?/:between?/:date?', getAllAppointments)

export default globalRoutes;

