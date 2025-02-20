import {BeforeCreate, Entity, Enum, PrimaryKey, Property} from "@mikro-orm/core";

export enum Day {
    MONDAY = 0,
    TUESDAY = 1,
    WEDNESDAY = 2,
    THURSDAY = 3,
    FRIDAY = 4,
    SATURDAY = 5,
    SUNDAY = 6,
}

@Entity()
export class WorkingDay {
    @PrimaryKey({type: Number, autoincrement: true})
    id!: number;

    @Enum({items: () => Day})
    day: Day = Day.MONDAY;

    // @Property({type: "string", })
    // get dayName() {
    //     return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][this.day];
    // }
    @Property({type: "string"})
    dayName?: string;


    @BeforeCreate()
    beforeCreate() {
        this.dayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][this.day]
    }
}

