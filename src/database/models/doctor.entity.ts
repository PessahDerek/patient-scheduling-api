import User, {UserRole} from "./user.entity";
import {Collection, Entity, Enum, OneToMany, Property} from "@mikro-orm/core";
import {Schedule} from "./schedule.entity";


@Entity()
export default class Doctor extends User {
    @Enum({items: () => UserRole, default: UserRole.DOCTOR})
    role: UserRole = UserRole.DOCTOR;

    @Property({type: "string"})
    schedules!: string;
}


