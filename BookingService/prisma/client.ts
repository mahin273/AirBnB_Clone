import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST as string,
  port: parseInt(process.env.DATABASE_PORT as string) || 3306,
  user: process.env.DATABASE_USER as string,
  password: process.env.DATABASE_PASSWORD as string,
  database: process.env.DATABASE_NAME as string,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});
const prismaClient = new PrismaClient({ adapter });

export default prismaClient;
