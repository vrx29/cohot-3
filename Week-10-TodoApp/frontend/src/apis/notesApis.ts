import api from "./axios";

export const getNotes = async () => {
  const response = await api.get("/todos");
  return response.data;
};

export const createNote = async (data: {
  title: string;
  description: string;
}) => {
  const response = await api.post("/todos", data);
  return response.data;
};

export const editNote = async (
  id: number,
  data: { title: string; description?: string },
) => {
  const response = await api.post(`/todos/${id}`, data);
  return response.data;
};

export const deleteNote = async (id: number) => {
  await api.delete(`/todos/${id}`);
};
