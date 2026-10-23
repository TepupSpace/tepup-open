'use client';

import { useParams } from 'next/navigation';
import ReviewDetail from '@/components/review/ReviewDetail';

/** The review screen body lives in components/review/ReviewDetail.tsx (shared with the other side). */
export default function ReviewDetailClient() {
  const params = useParams();
  return <ReviewDetail id={params.id as string} accent="blue" />;
}
