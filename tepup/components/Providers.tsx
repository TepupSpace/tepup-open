'use client';

import { ReactNode } from 'react';
import { ProgressProvider } from '@/lib/contexts/ProgressContext';
import { AIChatProvider } from '@/lib/contexts/AIChatContext';
import { NavigationProgressProvider } from '@/lib/contexts/NavigationProgressContext';
import AIChatBox from '@/components/ai/AIChatBox';
import ScrollJumpButtons from '@/components/ui/ScrollJumpButtons';
import RouteProgressBar from '@/components/ui/RouteProgressBar';
import NavigationHistoryTracker from '@/components/NavigationHistoryTracker';
import FreshContent from '@/components/pwa/FreshContent';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    // NavigationProgress bọc ngoài cùng: mọi link và mọi router.push ở bất kỳ
    // route group nào cũng phải với tới được nó.
    <NavigationProgressProvider>
      <RouteProgressBar />
      <NavigationHistoryTracker />
      {/* App đã cài: mở lại thì tự lấy nội dung / bản deploy mới. */}
      <FreshContent />
      {/* Số liệu ẩn danh (CLAUDE.md › Analytics); không render gì. */}
      <AnalyticsProvider />
      <ProgressProvider>
        <AIChatProvider>
          {children}
          <AIChatBox />
          <ScrollJumpButtons />
        </AIChatProvider>
      </ProgressProvider>
    </NavigationProgressProvider>
  );
}
