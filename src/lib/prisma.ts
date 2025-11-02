// Σχόλιο (GR): Single Prisma client instance για αποφυγή πολλαπλών συνδέσεων
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // Σχόλιο (GR): logs για βασικά events
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
