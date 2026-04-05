const express = require("express");
const userRouter = require("./userRouter");
const accountRouter = require("./accountRouter");
const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/account", accountRouter);

module.exports = mainRouter;
