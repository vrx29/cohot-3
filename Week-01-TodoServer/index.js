const bodyParser = require("body-parser");
const express = require("express");

const app = express();
app.use(express.json());

let itemId = 1;
const todos = [
  {
    id: itemId,
    title: "Test Todd",
    description: "This is a basic description",
  },
];

app.get("/", (req, res) => {
  res.send("This is a todo server");
});

//GET
app.get("/todos", (req, res) => {
  res.status(200).json({
    todos,
  });
});

//GET /todos/:id
app.get("/todos/:id", (req, res) => {
  const { id } = req.params;

  const todo = todos.find((item) => item.id == id);
  if (!todo) {
    res.status(404).send();
  }
  res.status(200).json(todo);
});

//POST /todos
app.post("/todos", (req, res) => {
  const newTodo = {
    id: ++itemId,
    title: req.body.title,
    description: req.body.description,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put("/todos/:id", (req, res) => {
  const todoIndex = todos.findIndex(
    (item) => item.id == parseInt(req.params.id),
  );
  if (todoIndex == -1) {
    res.status(404).send();
  }
  console.log(todos);
  console.log(todoIndex);
  todos[todoIndex].title = req.body.title;
  todos[todoIndex].description = req.body.description;
  res.status(200).json(todos[todoIndex]);
});

app.delete("/todos/:id", (req, res) => {
  const todoIndex = todos.findIndex(
    (item) => item.id == parseInt(req.params.id),
  );
  if (todoIndex == -1) {
    res.status(404).send();
  }
  todos.splice(todoIndex, 1);
  res.status(200).send();
});

app.use((req, res, next) => {
  res.status(404).send();
});

app.listen(3000, () => console.log("Server started on port 3000"));
