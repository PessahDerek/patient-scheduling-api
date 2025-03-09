import {AfterUpdate, Entity, Enum, ManyToOne, OnLoad, PrimaryKey, Property} from "@mikro-orm/core";
import User from "./user.entity";
import {Schedule} from "./schedule.entity";
import dayjs from "dayjs";


export enum AppStatus {
    UPCOMING = "upcoming",
    COMPLETED = "completed",
    MISSED = "missed",
    CANCELLED = "cancelled",
}

@Entity()
export class Appointment {
    @PrimaryKey({type: "int", unique: true})
    id!: number;

    @ManyToOne()
    schedule!: Schedule;

    @ManyToOne({entity: () => User})
    patient!: User;

    @Property({type: "datetime"})
    timeIn!: Date;

    @Property({type: "date"})
    date!: Date;

    @Enum({items: () => AppStatus, nullable: true, default: AppStatus.UPCOMING})
    status?: AppStatus = AppStatus.UPCOMING;

    @OnLoad()
    runOnLoad() {
        if (this.status === AppStatus.UPCOMING) {
            // check to update
            const today = new Date();
            if (dayjs(today).isAfter(this.date))
                this.status = AppStatus.MISSED
        }
    }

    @AfterUpdate()
    emailUpdates() {

    }
}

