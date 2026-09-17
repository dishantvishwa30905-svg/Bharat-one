import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { evaluateRule } from '@/lib/engine';

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.userProfile.findUnique({ where: { userId: session.userId } });
    if (!profile) return NextResponse.json({ recommendations: [], message: 'Complete your profile' });

    const schemes = await prisma.scheme.findMany({
      where: { status: 'Active' },
      include: { rules: true },
    });

    const results = schemes.map((scheme) => {
      if (scheme.rules.length === 0) {
        return { scheme, matchPercent: 100, status: 'Eligible' };
      }
      const conditions = JSON.parse(scheme.rules[0].conditions);
      const result = evaluateRule(conditions, profile);
      return { scheme, matchPercent: result.matchPercent, status: result.status, details: result.details };
    });

    const sorted = results
      .filter(r => r.matchPercent > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 20);

    return NextResponse.json({ recommendations: sorted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
