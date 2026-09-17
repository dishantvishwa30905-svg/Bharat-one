import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

function requireAdmin(req: NextRequest) {
  const session = getSession(req);
  if (!session) return null;
  if (!['SUPER_ADMIN', 'SCHEME_MANAGER'].includes(session.role)) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const schemeId = searchParams.get('schemeId');
  const where = schemeId ? { schemeId } : {};
  const rules = await prisma.schemeRule.findMany({ where });
  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { schemeId, conditions, description } = await req.json();
  const rule = await prisma.schemeRule.create({
    data: { schemeId, conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions), description },
  });
  return NextResponse.json({ rule });
}

export async function PUT(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, conditions, description } = await req.json();
  const rule = await prisma.schemeRule.update({
    where: { id },
    data: { conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions), description },
  });
  return NextResponse.json({ rule });
}

export async function DELETE(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id')!;
  await prisma.schemeRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
