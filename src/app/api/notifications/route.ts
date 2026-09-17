import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ notifications });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { notificationId, markAllRead } = await req.json();
  if (markAllRead) {
    await prisma.notification.updateMany({ where: { userId: session.userId }, data: { isRead: true } });
  } else if (notificationId) {
    await prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
  }
  return NextResponse.json({ success: true });
}
