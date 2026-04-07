import { jwt } from "zod";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token) {
      return res.status(401).send({ message: "You are not authorised" });
    }
    jwt.verify(token, process.env.JWT_KEY, (error, data) => {
      if (error) {
        return res.status(401).status({ message: "You are not authorised" });
      }
      req._id = data._id;
      next();
    });
  } catch (error) {
    return res.status(500).send({ message: "Something went wrong!" });
  }
};
