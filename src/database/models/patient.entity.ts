import {Entity, Enum} from "@mikro-orm/core";
import {UserMap, UserRole} from "./user.entity";


@Entity()
export default class Patient extends UserMap {
    @Enum({items: () => UserRole, default: UserRole.PATIENT})
    role: UserRole = UserRole.PATIENT;
}

