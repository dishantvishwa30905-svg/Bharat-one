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
  const schemes = await prisma.scheme.findMany({ include: { rules: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ schemes });
}

export async function POST(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { rules, ...data } = await req.json();
  const scheme = await prisma.scheme.create({ data });
  if (rules && rules.length > 0) {
    for (const rule of rules) {
      await prisma.schemeRule.create({ data: { schemeId: scheme.id, conditions: JSON.stringify(rule.conditions), description: rule.description } });
    }
  }
  return NextResponse.json({ scheme });
}

export async function PUT(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  const scheme = await prisma.scheme.update({ where: { id }, data });
  return NextResponse.json({ scheme });
}

export async function DELETE(req: NextRequest) {
  const session = requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id')!;
  await prisma.scheme.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
