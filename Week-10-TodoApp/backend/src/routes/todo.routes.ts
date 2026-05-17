import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createTodoSchema, updateTodoSchema } from "../validators/todo.validator";
import { createTodoController, deleteTodoController, getTodosController, updateTodoController } from "../controllers/todo.controller";

const router = Router()

router.use(authMiddleware);

router.post(
  "/",
  validate(createTodoSchema),
  createTodoController
)

router.get("/", getTodosController)

router.patch(
  "/:id",
  validate(updateTodoSchema),
  updateTodoController
)

router.delete("/:id", deleteTodoController)

export default router;