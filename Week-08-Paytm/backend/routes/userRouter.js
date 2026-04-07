const express = require("express");
const { signup, login, searchBulk, logout } = require("../controllers/userController");
const { verifyToken } = require("../middleware/verifyToken");

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", logout);

userRouter.get("/bulk", verifyToken, searchBulk);

module.exports = userRouter;