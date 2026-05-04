import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../index.js";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets.js";
import { BadRequestsException } from "../exceptions/bad-requests.js";
import { ErrorCode } from "../exceptions/root.js";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email: email } });

  if (user) {
    next(new BadRequestsException("User already exists!", ErrorCode.USER_ALREADY_EXISTS))
  }

  user = await prismaClient.user.create({
    data: { name, email, password: hashSync(password, 10) },
  });

  res.json({ user });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "User does not exists" });
  }

  if (!compareSync(password, user?.password)) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
  );

  res.json({ user, token, message: "Login success" });
};
