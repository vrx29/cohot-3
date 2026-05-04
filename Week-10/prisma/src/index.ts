import express, {Express, Request, Response} from "express";
import { DATABASE_URL, PORT } from "./secrets.js";
import { rootRouter } from "./routes/index.js";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { errorMiddleware } from "./middlewares/errors.js";

const app: Express = express();
const connectionString = DATABASE_URL;
const adapter = new PrismaPg({connectionString});
export const prismaClient = new PrismaClient({adapter});

app.use(express.json())
app.use("/api", rootRouter);
app.use(errorMiddleware)

app.listen(PORT, ()=> console.log("Server started at PORT : 3000"))