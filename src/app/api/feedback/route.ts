import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = getSession(req);
  const { schemeId, reason, details } = await req.json();
  if (!reason || !details) return NextResponse.json({ error: 'Reason and details required' }, { status: 400 });
  const feedback = await prisma.feedback.create({
    data: { userId: session?.userId || null, schemeId: schemeId || null, reason, details },
  });
  return NextResponse.json({ feedback });
}
