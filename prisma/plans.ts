import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getActivePlans() {
  return prisma.subscriptionPlan.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
  });
}