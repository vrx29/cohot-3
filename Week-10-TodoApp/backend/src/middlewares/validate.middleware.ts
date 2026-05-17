import { NextFunction, Request, Response } from "express";
import {  ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
       return async (req: Request, res: Response, next: NextFunction)=>{
        try {          
            await schema.parseAsync(req.body);
            next();
        } catch (error: any) {
            return res.status(400).json({success: false, error: error.errors})
        }
    }
}