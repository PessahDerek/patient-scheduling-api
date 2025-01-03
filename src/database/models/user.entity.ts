import {BeforeCreate, Entity, Enum, Property} from "@mikro-orm/core";
import {getUniqueString, hashString, isValidPhoneNumber} from "../../utils/methods/shortmethods";

enum UserRole {
    DOCTOR = "doctor",
    PATIENT = "patient",
}

@Entity()
export default class User {
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
    _password!: string;
    @Property({hidden: true})
    get password() {
        return this._password
    }
    set password(value: string) {
        this._password = hashString(value);
    }

    @BeforeCreate()
    beforeCreate() {
        try {
            isValidPhoneNumber(this.phone);
        } catch (e: unknown) {
            throw new Error((e as Error).message);
        }
    }
}

