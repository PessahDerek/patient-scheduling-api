import {BeforeCreate, Collection, Entity, Enum, OneToMany, OnLoad, Property} from "@mikro-orm/core";
import {getUniqueString, hashString, isValidPhoneNumber} from "../../utils/methods/shortmethods";
import {Schedule} from "./schedule.entity";

export enum UserRole {
    DOCTOR = "doctor",
    PATIENT = "patient",
    ADMIN = "admin",
}

export enum Gender {
    MALE = "male",
    FEMALE = "female",
    UNKNOWN = "unknown",
}

@Entity({abstract: true})
export class UserMap {
    @Property({primary: true, type: "string"})
    id: string = getUniqueString();

    @Property()
    firstName!: string;
    @Property()
    lastName!: string;
    @Property()
    email!: string;
    @Property()
    phone!: string;
    @Enum({items: () => UserRole})
    role: UserRole = UserRole.PATIENT;
    @Property({hidden: true})
    password!: string;
    @Enum({items: () => Gender, nullable: true})
    gender?: Gender = Gender.UNKNOWN;
    @Property({type: "blob", nullable: true})
    profile?: Blob | null = null;

    @OneToMany({entity: () => Schedule, mappedBy: "doctor"})
    schedules: Collection<Schedule> = new Collection(Schedule);

    complete() {
        if (this.gender === Gender.UNKNOWN)
            return false
        if (this.phone === "0000000000")
            return false
        return !(this.firstName + this.lastName + this.email + this.phone).toLowerCase().includes("default");
    }

    @Property({getter: true, persist: false})
    simple() {
        return {
            id: this.id,
            name: `${this.firstName} ${this.lastName}`,
            email: this.email,
            phone: this.phone,
            gender: this.gender,
            role: this.role
        }
    }


    @BeforeCreate()
    beforeCreate() {
        try {
            isValidPhoneNumber(this.phone);
            this.password = hashString(this.password);
        } catch (error: unknown) {
            throw error;
        }
    }
}

@Entity()
export default class User extends UserMap {
}

