const express = require("express");
const { createTodo, updateTodo } = require("./types");
const { todo } = require("./db/db");
const app = express();

app.use(express.json());

app.get("/todos", async (req, res) => {
  try {
    const todos = await todo.find({});
    res.status(200).json({
      todos,
    });
  } catch (error) {
    console.log(error);
  }
  res.json({msg: "Error"})
});

/*
body {
    title: string,
    description: string
}
*/
app.post("/todo", async (req, res) => {
  const createPayload = req.body;
  const parsedPayload = createTodo.safeParse(createPayload);

  if (!parsedPayload.success) {
    res.status(411).json({
      msg: "You sent the wrong input",
    });
    return;
  }
  await todo.create({
    title: createPayload.title,
    description: createPayload.description,
    completed: false,
  });

  res.json({
    msg: "todo created",
  });
});

app.put("/completed", async (req, res) => {
  const updatePayload = req.body;
  const parsedPayload = updateTodo.safeParse(updatePayload);

  if (!parsedPayload.success) {
    res.status(411).json({
      msg: "You sent the wrong inputs",
    });
    return;
  }

  await todo.updateOne(
    {
      _id: updatePayload.id,
    },
    {
      completed: true,
    },
  );
  res.json({ msg: "Todo marked as completed" });
});

app.listen(3000, () => console.log("Server started on port : 3000"));
