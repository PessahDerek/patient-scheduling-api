import {defineConfig} from "@mikro-orm/mysql";
import {TsMorphMetadataProvider} from "@mikro-orm/reflection";
import {Migrator} from "@mikro-orm/migrations";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
    metadataProvider: TsMorphMetadataProvider,
    dbName: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    extensions: [Migrator],
    entities: ['./src/database/**/*.entity.ts'],
    entitiesTs: ['./src/database/**/*.entity.ts'],
    migrations: {
        pathTs: "./src/database/migrations/",
    },
})
