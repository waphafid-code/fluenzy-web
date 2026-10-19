import { PrismaClient } from '@prisma/client';

/**
 * PRISMA.TS - Singleton Prisma Client Pattern
 *
 * Mencegah exhaustion pool koneksi database SQLite/PostgreSQL
 * akibat re-instansiasi berkali-kali selama Next.js Fast Refresh di mode development.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
