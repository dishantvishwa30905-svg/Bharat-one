import { PrismaClient } from '@prisma/client';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // Non-file (e.g. PostgreSQL) → use as-is
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // File-based SQLite: resolve to absolute path so it works in
  // both local dev and Vercel serverless (where cwd changes at runtime)
  const rawPath = envUrl ? envUrl.replace(/^file:/, '') : './prisma/dev.db';
  const cleanRelative = rawPath.replace(/^\.\//, '');
  const absolutePath = path.resolve(process.cwd(), cleanRelative);
  return `file:${absolutePath}`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
