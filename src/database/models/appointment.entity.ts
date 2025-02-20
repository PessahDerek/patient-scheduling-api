import {AfterUpdate, Entity, ManyToOne, PrimaryKey, Property} from "@mikro-orm/core";
import User from "./user.entity";
import {Schedule} from "./schedule.entity";
import dayjs from "dayjs";


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

    @Property({type: "datetime"}) // in milliseconds
    timeOut!: Date;

    @Property({type: "date"})
    date!: Date;

    @Property({name: "duration"})
    getDuration() {
        return dayjs(this.timeOut).diff(this.timeIn, 'minutes');
    }

    @AfterUpdate()
    emailUpdates() {

    }
}

