import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

function calcCompletion(p: any): number {
  const fields = [
    p.dob, p.gender, p.state, p.district, p.areaType,
    p.annualIncome, p.occupation, p.employmentStatus, p.education,
    p.casteCategory, p.housingStatus,
    p.familySize > 1 ? true : null,
  ];
  const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  return Math.round((filled / fields.length) * 100);
}

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.userProfile.findUnique({ where: { userId: session.userId } });
    const completionPercent = profile ? calcCompletion(profile) : 0;
    return NextResponse.json({ profile, completionPercent });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { name, ...profileData } = data;

    // Update user name if provided
    if (name) {
      await prisma.user.update({ where: { id: session.userId }, data: { name } });
    }

    const numericFields = ['age', 'annualIncome', 'familySize', 'dependentsCount', 'landOwned'];
    for (const f of numericFields) {
      if (profileData[f] !== undefined && profileData[f] !== '') {
        profileData[f] = Number(profileData[f]);
      } else if (profileData[f] === '') {
        profileData[f] = undefined;
      }
    }

    const boolFields = ['isEws', 'isDifferentlyAbled', 'isStudent', 'isFarmer', 'isSeniorCitizen'];
    for (const f of boolFields) {
      if (profileData[f] !== undefined) profileData[f] = Boolean(profileData[f]);
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: { ...profileData, updatedAt: new Date() },
      create: { userId: session.userId, ...profileData },
    });

    const completionPercent = calcCompletion(profile);
    return NextResponse.json({ profile, completionPercent });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
