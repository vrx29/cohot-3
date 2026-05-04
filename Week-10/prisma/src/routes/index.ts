import { Router } from "express";
import { authRoutes } from "./auth.js";

export const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes)