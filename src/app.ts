import * as http from "node:net";
import {EntityManager, EntityRepository, MikroORM, RequestContext} from "@mikro-orm/core";
import express, {NextFunction} from "express";
import cors from "cors";
import indexRouter from "./routes/root";
import config from "../mikro-orm.config";
import User from "./database/models/user.entity";
import {WorkingDay} from "./database/models/workingDay.entity";
import {Schedule} from "./database/models/schedule.entity";
import {Appointment} from "./database/models/appointment.entity";

export const api = {} as {
    server: http.Server,
    orm: MikroORM,
    em: EntityManager,
    users: EntityRepository<User>,
    schedules: EntityRepository<Schedule>,
    scheduleDay: EntityRepository<WorkingDay>,
    appointments: EntityRepository<Appointment>,
}

const application = async () => {
    api.orm = await MikroORM.init(config);
    api.em = api.orm.em;
    api.users = api.em.getRepository(User)
    api.scheduleDay = api.em.getRepository(WorkingDay)
    api.schedules = api.em.getRepository(Schedule)
    api.appointments = api.em.getRepository(Appointment)

    const app = express()
    app.use(express.json({limit: '50mb'}));
    app.use(cors({
        origin: ["http://localhost:3001", "http://localhost:3002"],
        credentials: true,
    }))
    app.use((_req: express.Request, _res: express.Response, next: NextFunction) => {
        RequestContext.create(api.em, next);
    })

    app.use("/api", indexRouter)

    const port = Number(process.env?.PORT ?? 5000);

    api.server = app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    })
}

application()
    .catch(err => console.log(err))
;
// export default application;



