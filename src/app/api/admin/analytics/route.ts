import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

function requireAdmin(req: NextRequest) {
  const session = getSession(req);
  if (!session) return null;
  if (!['SUPER_ADMIN', 'SCHEME_MANAGER', 'VERIFIER'].includes(session.role)) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [totalUsers, totalSchemes, verifiedSchemes, totalApplications, totalFeedback, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.scheme.count(),
    prisma.scheme.count({ where: { verificationStatus: 'Verified' } }),
    prisma.application.count(),
    prisma.feedback.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
  ]);

  return NextResponse.json({ totalUsers, totalSchemes, verifiedSchemes, totalApplications, totalFeedback, recentUsers });
}
