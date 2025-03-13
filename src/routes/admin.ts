import express from "express";
import authorization, {adminAuth} from "../middleware/authorization";
import {addUser} from "../controllers/admin";
import {addWorkingDay, getSchedule, scheduleDoctor} from "../controllers/admin";
import {createAppointment, markAppointmentComplete} from "../controllers/admin/appointments";


const adminRoutes = express.Router();

adminRoutes
    .use(authorization)
    .use(adminAuth)
    .get("/schedules", getSchedule)
    .post("/add-role", addUser)
    .post("/add-working-day", addWorkingDay)
    .post("/schedule-doctor", scheduleDoctor)
    .post("/create-appointment", createAppointment)
    .post("/mark-app-complete", markAppointmentComplete)

export default adminRoutes;

