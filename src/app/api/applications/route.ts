import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const apps = await prisma.application.findMany({
    where: { userId: session.userId },
    include: { scheme: { select: { id: true, name: true, category: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ applications: apps });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { schemeId, status, appliedDate, referenceNumber, notes } = await req.json();
  const app = await prisma.application.upsert({
    where: { userId_schemeId: { userId: session.userId, schemeId } },
    update: { status, appliedDate, referenceNumber, notes },
    create: { userId: session.userId, schemeId, status: status || 'Started', appliedDate, referenceNumber, notes },
  });
  return NextResponse.json({ application: app });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { schemeId, status, notes, referenceNumber } = await req.json();
  const app = await prisma.application.update({
    where: { userId_schemeId: { userId: session.userId, schemeId } },
    data: { status, notes, referenceNumber },
  });
  return NextResponse.json({ application: app });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const schemeId = searchParams.get('schemeId')!;
  await prisma.application.deleteMany({ where: { userId: session.userId, schemeId } });
  return NextResponse.json({ success: true });
}
