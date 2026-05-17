import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, signUpSchema } from "../validators/auth.validator";
import { loginController, signupController } from "../controllers/auth.controller";

const router = Router();
router.post(
  "/signup",
  validate(signUpSchema),
  signupController
)

router.post(
  "/login",
  validate(loginSchema),
  loginController
)

export default router;