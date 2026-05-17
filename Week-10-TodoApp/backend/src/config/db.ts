import { prisma } from "../prisma/client";

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};
