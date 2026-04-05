const express = require("express");
const accountRouter = express.Router();

accountRouter.get("/balance")
accountRouter.post("/transfer");

module.exports = accountRouter;