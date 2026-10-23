import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import { getContributorSession } from '@/lib/admin-auth';
import { listClaimableSuggestions } from './list-claimable';

/**
 * GET: accepted reader suggestions the contributor may claim, with their claim state
 * (free / mine / taken). Plain text only; the suggester stays anonymous (proposal §6.9).
 */
export async function GET() {
  const session = await getContributorSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await listClaimableSuggestions({ id: session.user.id, role: session.user.role as UserRole });
  return NextResponse.json({ items });
}
