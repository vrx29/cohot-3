import { env } from "../config/env"
import jwt from "jsonwebtoken"

export const generateToken = (userId: string) =>{
    return jwt.sign({userId}, env.JWT_SECRET, {expiresIn: '7d'})
}