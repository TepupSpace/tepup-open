'use client';

import Link from '@/components/ui/AppLink';
import { Receipt, TrendingUp, PiggyBank, Store, BookOpen, Smartphone, Scale, ArrowRight } from 'lucide-react';
import type { StoryDisplay } from '@/lib/types/content';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'receipt': Receipt,
  'trending-up': TrendingUp,
  'piggy-bank': PiggyBank,
  'store': Store,
  'book-open': BookOpen,
  'smartphone': Smartphone,
  'scale': Scale,
};

interface StoryCardProps {
  story: StoryDisplay;
}

export default function StoryCard({ story }: StoryCardProps) {
  const IconComponent = iconMap[story.icon] || BookOpen;

  // Get color based on character
  const colorClasses: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
    'student': {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-200 hover:border-teal-300',
      iconBg: 'bg-teal-100',
    },
    'office-worker': {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-100',
    },
    'street-vendor': {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200 hover:border-orange-300',
      iconBg: 'bg-orange-100',
    },
    'gig-driver': {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200 hover:border-purple-300',
      iconBg: 'bg-purple-100',
    },
  };

  const colors = colorClasses[story.characterId] || colorClasses['student'];

  return (
    <Link href={`/story/${story.characterId}/${story.slug}`} className="group block">
      <div
        className={`
          relative overflow-hidden rounded-2xl border-2 bg-white ${colors.border}
          p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-14 h-14 rounded-2xl ${colors.iconBg}
            flex items-center justify-center mb-4
          `}
        >
          <IconComponent className={`w-7 h-7 ${colors.text}`} />
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-2">{story.title}</h3>

        {/* Teaser */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          "{story.teaser}"
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{story.chaptersCount} chương</span>
          <div
            className={`
              inline-flex items-center gap-1 text-sm font-semibold ${colors.text}
              group-hover:gap-2 transition-all
            `}
          >
            <span>Bắt đầu</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
