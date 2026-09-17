import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.userId },
    include: { scheme: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { schemeId } = await req.json();
  try {
    const bookmark = await prisma.bookmark.create({ data: { userId: session.userId, schemeId } });
    return NextResponse.json({ bookmark });
  } catch {
    return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { schemeId } = await req.json();
  await prisma.bookmark.deleteMany({ where: { userId: session.userId, schemeId } });
  return NextResponse.json({ success: true });
}
