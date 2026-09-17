import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scheme = await prisma.scheme.findUnique({
      where: { id: params.id },
      include: { rules: true },
    });
    if (!scheme) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    return NextResponse.json({ scheme });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
