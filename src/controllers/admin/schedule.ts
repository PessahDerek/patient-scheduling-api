import { AppError, Controller } from "../../libs/@types/global";
import { api } from "../../app";
import {
  convertToDateTime,
  handleError,
} from "../../utils/methods/shortmethods";

export const getSchedule: Controller = async (req, res) => {
  try {
    const schedules = await api.schedules.find(
      {},
      { populate: ["doctor", "workingDay"] },
    );
    res.status(200).json(schedules);
  } catch (error) {
    if (error instanceof AppError)
      return res.status(error.status).json({ message: error.message });
    return res.status(500).json({
      message: "Sorry, something went wrong while fetching schedule!",
    });
  }
};

export const getWorkingDays: Controller = async (req, res) => {
  try {
    const wd = await api.scheduleDay.findAll();
    res.status(200).json(wd);
  } catch (error) {
    if (error instanceof AppError)
      return res.status(error.status).json({ message: error.message });
    console.log("\t", error);
    return res.status(500).json({
      message: "Sorry, something went wrong while fetching working days!",
    });
  }
};

export const addWorkingDay: Controller = async (req, res, next) => {
  try {
    const { day } = req.body;
    if (typeof day === "undefined" || Number(day) > 6 || Number(day) < 0)
      return res.status(400).json({ message: "Invalid day selection!" }).end();
    // check if it exists
    console.log("Day: ", day);
    const found = await api.scheduleDay.findOne({ day: day });
    if (found)
      return res.status(400).json({ message: "Working day already exists!" });
    const newWorkingDay = api.scheduleDay.create({ day: day });
    await api.em
      .persistAndFlush(newWorkingDay)
      .then(() => {
        res
          .status(200)
          .json({ message: "Working day added successfully." })
          .end();
      })
      .catch((err) => {
        console.log(err);
      });
    // res.status(400).json({message: "Test"})
  } catch (e) {
    if (e instanceof AppError)
      return res.status(e.status).json({ message: e.message }).end();
    console.log("\tError: ", e);
    res
      .status(500)
      .json({ message: "Sorry, something went wrong adding working day!" })
      .end();
  }
};

export const scheduleDoctor: Controller = async (req, res) => {
  try {
    const { timeIn, timeOut, doc_id, day_id } = req.body;
    const doctor = await api.users.findOne(doc_id);
    if (!doctor)
      return res.status(400).json({ message: "Doctor not found!" }).end();
    const day = await api.scheduleDay.findOne(day_id);
    if (!day)
      return res
        .status(400)
        .json({ message: "Selected day is not a recognized working day!" })
        .end();
    // check if the doctor has same schedule
    const foundSchedule = await api.schedules.findOne({
      $and: [
        { doctor: doc_id },
        { workingDay: day },
        { timeIn: convertToDateTime(timeIn) },
      ],
    });
    if (foundSchedule)
      return res.status(400).json({
        message: `Doctor ${doctor.firstName} is scheduled at this time already`,
      });
    const newSchedule = api.schedules.create({
      doctor: doctor,
      workingDay: day,
      timeIn: convertToDateTime(timeIn),
      timeOut: convertToDateTime(timeOut),
    });
    await api.em
      .persistAndFlush(newSchedule)
      .then(() =>
        res
          .status(200)
          .json({
            message: `Dr.${doctor.firstName}'s schedule added successfully.`,
          })
          .end(),
      )
      .catch((err) => {
        throw err;
      });
  } catch (e) {
    if (e instanceof AppError)
      return res.status(e.status).json({ message: e.message }).end();
    console.log("\tError: ", e);
    res
      .status(500)
      .json({ message: "Sorry, something went wrong adding schedule!" })
      .end();
  }
};

export const editDoctorSchedule: Controller = async (req, res) => {
  try {
    const data = req.body;
    if (!data.id)
      return res.status(400).json({ message: "Schedule not found!" }).end();
  } catch (err) {
    handleError(
      err,
      res,
      "Sorry, something went wrong editing doctor's schedule!",
    );
  }
};
