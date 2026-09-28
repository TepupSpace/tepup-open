'use client';
import { createContext, useContext } from 'react';

export interface WidgetEditContextValue {
  /** Open the edit drawer for the tepup-widget block with this id. */
  openEditor: (blockId: string) => void;
  /** The widget currently clicked/selected — its "Sửa" button stays visible. */
  selectedId: string | null;
  setSelectedId: (blockId: string | null) => void;
}

export const WidgetEditContext = createContext<WidgetEditContextValue | null>(null);

export function useWidgetEdit(): WidgetEditContextValue | null {
  return useContext(WidgetEditContext);
}
