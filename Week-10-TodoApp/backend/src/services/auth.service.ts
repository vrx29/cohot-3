import { createUser, findUserByEmail } from "../repositories/auth.repository"
import { generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

export const signupService = async (email: string, password: string) => {
    const existingUser = await findUserByEmail(email);
    if(existingUser) {
        throw new Error("User already exists")
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(email, hashedPassword);

    const token = generateToken(user.id);

    return { token, user}
}

export const loginService = async (
  email: string,
  password: string
) => {
  const user = await findUserByEmail(email)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const isPasswordCorrect = await comparePassword(
    password,
    user.password
  )

  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials")
  }

  const token = generateToken(user.id)

  return {
    token,
    user,
  }
}