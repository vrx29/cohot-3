import { NextFunction, Request, Response } from "express"


export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    console.log(error)
   return res.status(500).json({
    success: false,
    error:error,
    message: "Internal server error",
  })
}