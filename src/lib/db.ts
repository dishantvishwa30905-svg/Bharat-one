import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  const tmpDbPath = '/tmp/dev.db';
  if (fs.existsSync(tmpDbPath)) {
    return `file:${tmpDbPath}`;
  }

  const candidates = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db'),
    path.resolve(process.cwd(), '.next', 'server', 'prisma', 'dev.db'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        fs.copyFileSync(candidate, tmpDbPath);
        return `file:${tmpDbPath}`;
      } catch (_) {
        return `file:${candidate}`;
      }
    }
  }

  return `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
}

const dbUrl = getDatabaseUrl();
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
