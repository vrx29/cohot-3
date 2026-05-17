import { prisma } from "../prisma/client";

export const createTodo = async (
  title: string,
  description: string | undefined,
  userId: string,
) => {
  return prisma.todo.create({
    data: {
      title,
      description,
      userId,
    },
  });
};

export const getTodos = async (userId: string) => {
  return prisma.todo.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export const findTodoById = async (id: string) => {
  return prisma.todo.findUnique({
    where: { id },
  })
}

export const updateTodo = async (
  id: string,
  data: any
) => {
  return prisma.todo.update({
    where: { id },
    data,
  })
}

export const deleteTodo = async (id: string) => {
  return prisma.todo.delete({
    where: { id },
  })
}