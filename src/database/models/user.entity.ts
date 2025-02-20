import {BeforeCreate, Entity, Enum, Property} from "@mikro-orm/core";
import {getUniqueString, hashString, isValidPhoneNumber} from "../../utils/methods/shortmethods";

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

    complete() {
        if (this.gender === Gender.UNKNOWN)
            return false
        if (this.phone === "0000000000")
            return false
        return !(this.firstName + this.lastName + this.email + this.phone).toLowerCase().includes("default");
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
export default class User extends UserMap{

}

