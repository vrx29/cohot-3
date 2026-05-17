import { Request, Response } from "express"
import { createTodoService, deleteTodoService, getTodosService, updateTodoService } from "../services/todo.service"

export const createTodoController = async (
  req: Request,
  res: Response
) => {
  const { title, description, userId } = req.body

  const todo = await createTodoService(
    title,
    description,
    userId
  )

  return res.status(201).json({message:  "Todo created", data: todo})
}

export const getTodosController = async (
  req: Request,
  res: Response
) => {
  const todos = await getTodosService(req.user.userId)

  return res.status(200).json({message:  "Todos fetched", data: todos})
}

export const updateTodoController = async (
  req: Request,
  res: Response
) => {
  const todo = await updateTodoService(
    req.params.id as string,
    req.user.userId,
    req.body
  )

  return res.status(200).json({message:  "Todo updated", data: todo})
}

export const deleteTodoController = async (
  req: Request,
  res: Response
) => {
  await deleteTodoService(
    req.params.id as string,
    req.user.userId
  )

  return res.status(200).json({message: "Todo deleted"})
}