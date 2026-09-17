import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const state = searchParams.get('state') || '';
    const isCentral = searchParams.get('isCentral');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const skip = (page - 1) * limit;

    const where: any = { status: 'Active' };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { ministry: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (state) where.state = state;
    if (isCentral === 'true') where.isCentral = true;
    if (isCentral === 'false') where.isCentral = false;

    const orderBy: any = {};
    if (sortBy === 'name') orderBy.name = 'asc';
    else orderBy.createdAt = 'desc';

    const [schemes, total] = await Promise.all([
      prisma.scheme.findMany({ where, skip, take: limit, orderBy }),
      prisma.scheme.count({ where }),
    ]);

    return NextResponse.json({ schemes, total, page, pages: Math.ceil(total / limit) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
