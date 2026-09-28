'use client';
import { createReactBlockSpec } from '@blocknote/react';

/**
 * Reveal-group boundary. Purely visual in the editor (a labelled dashed rule);
 * on save it becomes a `step-break` ContentBlock that the learner uses to reveal
 * blocks group-by-group.
 */
export const StepBreakBlock = createReactBlockSpec(
  {
    type: 'step-break',
    propSchema: { label: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const label = ((block.props as { label?: string }).label || 'Ngắt bước').toUpperCase();
      return (
        <div contentEditable={false} className="my-3 flex items-center gap-3 select-none">
          <div className="flex-1 border-t-2 border-dashed border-blue-300" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-500 whitespace-nowrap">
            {label}
          </span>
          <div className="flex-1 border-t-2 border-dashed border-blue-300" />
        </div>
      );
    },
  }
);
