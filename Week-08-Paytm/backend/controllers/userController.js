import { z } from "zod";
import jwt from "jsonwebtoken";
import { Account, User } from "../db/database.js";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password || !firstName) {
    return res.status(400).send({ message: "All fields are required" });
  }
  const signupSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    password: z.string().min(6),
  });
  
  try {
    const { success } = signupSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({ message: "Incorrect Inputs" });
    }

    const existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(411).send({ message: "User already exist" });
    }
    const user = await User.create({
      username: firstName + lastName,
      password,
      email,
      firstName,
      lastName,
    });
    const account = await Account.create({ userId: user._id });

    const jwtToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1d" },
    );

    res.cookie("token", jwtToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: true,
    });

    return res.status(201).send({
      username: user.firstName + user.lastName,
      balance: account.balance,
    });
  } catch (error) {
    return res.status(500).send({ message: "Error signing up", error: error });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Invalid Input" });
  }

  try {
    const loginSchema = z.object({
      email: z.email(),
      password: z.string(),
    });

    const success = loginSchema.safeParse(req.body);
    if (!success) {
      return res.status(411).send({ message: "Incorrect Inputs" });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).send({ message: "User not found" });
    }

    const account = await Account.findOne({ userId: existingUser._id });
    if (!account) {
      return res.status(400).send({ message: "Account not found" });
    }

    const jwtToken = jwt.sign(
      { _id: existingUser._id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1d" },
    );
console.log(existingUser.email)
    res.cookie("token", jwtToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send({
      username: existingUser.firstName + existingUser.lastName,
      balance: account.balance,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error while log in", error: error });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).send({ message: "logout success" });
  } catch (error) {
    return res.status(500).send({ message: "Error logging out!", error });
  }
};

export const searchBulk = async (req, res) => {
  const searchTerm = req.query.user;
  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: new RegExp(searchTerm, "i") } },
        { lastName: { $regex: new RegExp(searchTerm, "i") } },
      ],
      _id: { $ne: req._id },
    });
    return res.status(200).send({
      users: users.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        _id: user._id,
      })),
    });
  } catch (error) {
    return res.status(500).send({ message: "Error Searching Users!" });
  }
};
