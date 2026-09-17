import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { evaluateRule } from '@/lib/engine';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(req);

    const scheme = await prisma.scheme.findUnique({
      where: { id: params.id },
      include: { rules: true },
    });
    if (!scheme) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });

    if (!session) {
      return NextResponse.json({ eligible: null, message: 'Login to check eligibility' });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId: session.userId } });
    if (!profile) {
      return NextResponse.json({ eligible: null, message: 'Complete your profile to check eligibility' });
    }

    const results = scheme.rules.map((rule) => {
      const conditions = JSON.parse(rule.conditions);
      return evaluateRule(conditions, profile);
    });

    // Aggregate: use first rule result if only one, or combine
    let overallResult = results[0];
    if (!overallResult) {
      overallResult = { isEligible: true, status: 'Eligible' as const, matchPercent: 100, details: { satisfied: [], failed: [], missing: [] } };
    }

    return NextResponse.json({ result: overallResult, schemeId: params.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
