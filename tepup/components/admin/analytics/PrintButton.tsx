'use client';

import { Printer } from 'lucide-react';
import Button from '@/components/staff/Button';

/** In trang hiện tại (sidebar, header và thanh công cụ có `print:hidden`). */
export default function PrintButton() {
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()}>
      <Printer className="w-4 h-4" aria-hidden="true" />
      In báo cáo
    </Button>
  );
}
