import { Request, Response } from "express";
import { loginService, signupService } from "../services/auth.service";

export const signupController = async (req: Request, res: Response) => {
    const { email, password} = req.body;
    const result = await signupService(email, password);
    return res.status(201).json({
        message: "Login Success",
        data: result
    })
}

export const loginController = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body

  const result = await loginService(email, password)

  return res.status(200).json({message: "Login successful", data: result})
}