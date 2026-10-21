import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * PRISMA.TS - Singleton Prisma Client Pattern with Cloud/Vercel Serverless Resilience
 *
 * Mencegah exhaustion pool koneksi database SQLite/PostgreSQL
 * dan menangani sistem file Read-Only pada Vercel/AWS Lambda
 * dengan menyalin seed dev.db ke /tmp jika di Vercel.
 */

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // Jika berjalan di lingkungan Vercel serverless
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const src of candidates) {
        if (fs.existsSync(/*turbopackIgnore: true*/ src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (e) {
            console.warn('[Prisma] Gagal menyalin dev.db ke /tmp:', e);
          }
        }
      }
    }
    return 'file:/tmp/dev.db';
  }

  return envUrl || 'file:./dev.db';
}

const resolvedDbUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolvedDbUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
