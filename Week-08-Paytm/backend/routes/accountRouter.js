const express = require("express");
const { getBalance, transferMoney } = require("../controllers/accountController");
const accountRouter = express.Router();

accountRouter.get("/balance", getBalance)
accountRouter.post("/transfer", transferMoney);

module.exports = accountRouter;