'use client';

import { ReactNode } from 'react';
import { ProgressProvider } from '@/lib/contexts/ProgressContext';
import { AIChatProvider } from '@/lib/contexts/AIChatContext';
import { NavigationProgressProvider } from '@/lib/contexts/NavigationProgressContext';
import AIChatBox from '@/components/ai/AIChatBox';
import RouteProgressBar from '@/components/ui/RouteProgressBar';
import NavigationHistoryTracker from '@/components/NavigationHistoryTracker';

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
      <ProgressProvider>
        <AIChatProvider>
          {children}
          <AIChatBox />
        </AIChatProvider>
      </ProgressProvider>
    </NavigationProgressProvider>
  );
}
