import { createTodo, deleteTodo, findTodoById, getTodos, updateTodo } from "../repositories/todo.repository"

export const createTodoService = async (title: string, description: string | undefined, userId: string) => {
    return createTodo(title, description, userId)
}

export const getTodosService = async (userId: string) => {
    return getTodos(userId)
}

export const updateTodoService = async (todoId: string, userId: string, data: any) => {
    const todo = await findTodoById(todoId);

    if(!todo){
        throw new Error("Todo not found");
    }

    if(todo.userId != userId){
        throw new Error("Unauthorized error")
    }

    return updateTodo(todoId, data)
}

export const deleteTodoService = async (todoId: string, userId: string) => {
    const todo = await findTodoById(todoId);

    if(!todo){
        throw new Error("Todo not found");
    }

    if(todo.userId != userId){
        throw new Error("Unauthorized error")
    }
    return deleteTodo(todoId)
}