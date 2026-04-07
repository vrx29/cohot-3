const express = require("express");
const cors = require("cors");
const mainRouter = require("./routes/index");
const { dbconnect } = require("./db/database");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", mainRouter);

dbconnect();

app.listen(3000, () => console.log("Server started"));
