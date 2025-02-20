import {Entity, ManyToOne, PrimaryKey, Property} from "@mikro-orm/core";
import {WorkingDay} from "./workingDay.entity";
import User from "./user.entity";
import dayjs from "dayjs";


@Entity()
export class Schedule {
    @PrimaryKey({type: Number, autoincrement: true})
    id!: number;

    @ManyToOne({type: User})
    doctor!: User;

    @ManyToOne({type: WorkingDay})
    workingDay: WorkingDay = new WorkingDay();

    @Property({type: "datetime"})
    timeIn!: Date;

    @Property({type: "datetime"})
    timeOut!: Date;

    @Property({name: "length"})
    length(){
        return dayjs(this.timeOut).diff(this.timeIn, 'minutes');
    }
}

