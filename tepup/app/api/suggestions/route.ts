import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientIp, rateLimit } from '@/lib/security/rate-limit';
import { SUGGESTION_LIMITS, cleanSuggestionText } from '@/lib/suggestions';

/**
 * Anonymous "suggest a fix" (Wikipedia-style edit request). No account needed.
 *
 * Privacy: nothing identifying is stored — no IP, user agent, cookie or user id.
 * The IP is used only in memory, hashed, for rate limiting (lib/security/rate-limit.ts).
 * Suggestions are plain text, never HTML, and are never applied automatically:
 * they go to the reviewer queue and an editor applies accepted ones by hand.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const hourly = rateLimit('suggest-hour', ip, 5, 60 * 60_000);
  const daily = rateLimit('suggest-day', ip, 20, 24 * 60 * 60_000);
  // Per-instance ceiling, so a botnet can't bury reviewers.
  const global = rateLimit('suggest-global', 'all', 300, 24 * 60 * 60_000);
  if (!hourly.ok || !daily.ok || !global.ok) {
    return NextResponse.json(
      { error: 'Bạn đã gửi nhiều góp ý. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': String(hourly.retryAfterSeconds || daily.retryAfterSeconds || 3600) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Honeypot: a field real users never see. Pretend success so bots don't adapt.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const targetType = body.targetType === 'lesson' ? 'LESSON' : body.targetType === 'chapter' ? 'CHAPTER' : null;
  const targetId = typeof body.targetId === 'string' ? body.targetId : '';
  const quote = cleanSuggestionText(body.quote, SUGGESTION_LIMITS.quote);
  const proposal = cleanSuggestionText(body.proposal, SUGGESTION_LIMITS.proposal);
  const reason = cleanSuggestionText(body.reason, SUGGESTION_LIMITS.reason);

  if (!targetType || !targetId || targetId.length > 64) {
    return NextResponse.json({ error: 'Không xác định được bài học' }, { status: 400 });
  }
  if (quote === undefined || proposal === undefined || reason === undefined) {
    return NextResponse.json({ error: 'Góp ý quá dài' }, { status: 400 });
  }
  if (proposal.length < SUGGESTION_LIMITS.proposalMin) {
    return NextResponse.json(
      { error: `Vui lòng mô tả điều cần sửa (ít nhất ${SUGGESTION_LIMITS.proposalMin} ký tự)` },
      { status: 400 }
    );
  }

  // Only published content can receive suggestions.
  const target =
    targetType === 'LESSON'
      ? await prisma.lesson.findFirst({ where: { id: targetId, isActive: true }, select: { id: true } })
      : await prisma.chapter.findFirst({ where: { id: targetId, isActive: true }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: 'Không tìm thấy bài học' }, { status: 404 });
  }

  await prisma.suggestion.create({
    data: { targetType, targetId, quote: quote || null, proposal, reason: reason || null },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
