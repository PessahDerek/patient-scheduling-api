import {Options} from "@mikro-orm/core";
import {TsMorphMetadataProvider} from "@mikro-orm/reflection";
import {Migrator} from "@mikro-orm/migrations";
import dotenv from "dotenv";
import {MySqlDriver} from "@mikro-orm/mysql";

dotenv.config();

const config: Options = {
    metadataProvider: TsMorphMetadataProvider,
    driver: MySqlDriver,
    connect: true,
    dbName: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    extensions: [Migrator],
    entities: ['./src/database/models/*.entity.js'],
    entitiesTs: ['./src/database/models/*.entity.ts'],
    migrations: {
        pathTs: "./src/database/migrations/",
    },
    debug: true,
    preferTs: true,
}

export default config;