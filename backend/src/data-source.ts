import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import { PhotoEntity } from "./entities/photo.entity";
import { PositionEntity } from "./entities/position.entity";
import * as dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: false,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
    entities: [UserEntity, PhotoEntity, PositionEntity],
    migrations: ["src/migrations/*.ts"],
    synchronize: false,
});

// ⭐ IMPORTANT: export DEFAULT
export default AppDataSource;