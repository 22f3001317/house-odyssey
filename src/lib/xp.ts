import { eq, sql } from "drizzle-orm";
import { getDb, users, xpLog } from "@/lib/db";
export const levelOf = (xp: number) => Math.floor(xp / 100) + 1;
export const levelProgress = (xp: number) => xp % 100;
export async function award(userId: string, amount: number, reason: string) {
  const db = await getDb();
  await db.insert(xpLog).values({ userId, amount, reason });
  await db.update(users).set({ xp: sql`${users.xp} + ${amount}` }).where(eq(users.id, userId));
}
