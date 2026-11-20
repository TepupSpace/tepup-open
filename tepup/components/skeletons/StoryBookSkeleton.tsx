import '@/components/paper/story-book.css';

/**
 * Khung chờ của sổ tem nhân vật (StoryBook): đúng khổ cover ở desktop
 * (857×583 thu 85%) và ở điện thoại (cắt hai mép, 430×583).
 */
export default function StoryBookSkeleton() {
  return <div className="sb-skel-cover animate-pulse bg-black/10" aria-hidden="true" />;
}
