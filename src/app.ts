import express, {Application, Router} from "express";
import dotenv from "dotenv";
import cors from 'cors'
import {Server} from "node:http";
import {EntityManager, MikroORM, RequestContext} from "@mikro-orm/core";

dotenv.config();

export const api = {} as {
    server: Server,
    orm: MikroORM,
    em: EntityManager
}


class App {
    app: Application | undefined;
    origins: string[] = [];
    port: number = 5000;

    constructor(routers: Router[] = [], middlewareList: [] = []) {
        this.app = express();
        this.getEnvs()
        this.initializeMikroOrm()
            .catch(() => {
            })
        this.initializeMiddleware(middlewareList)
        this.initializeRoutes(routers)
    }

    private getEnvs() {
        this.port = Number(process.env.PORT ?? 5000)
    }

    initializeMikroOrm() {
        return new Promise(async (resolve, reject) => {
            try {
                api.orm = await MikroORM.init()
                api.em = api.orm.em
                resolve("Database Connected")
            } catch (err) {
                reject(err)
            }
        })
    }

    private initializeMiddleware(middlewareList: []) {
        if (!this.app)
            return
        for (const middleware of middlewareList) {
            this.app.use(middleware);
        }
        this.app.use(cors({
            origin: [...this.origins],
            credentials: true,
        }))
        this.app.use((_req, _res, next) => {
            RequestContext.create(api.orm.em, next)
        })
    }

    private initializeRoutes(routers: Router[]): void {
        if (!this.app)
            return;
        for (const router of routers) {
            this.app.use(router);
        }
    }

    listen(port: number = this.port) {
        if (!this.app)
            throw new Error("No application instance")
        api.server = this.app.listen(port, () => {
            console.log("Server running on port: ", port);
        });
    }
}

export default App;


