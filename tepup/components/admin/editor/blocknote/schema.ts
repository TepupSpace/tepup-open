import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { TepupWidgetBlock } from './TepupWidgetBlock';
import { StepBreakBlock } from './StepBreakBlock';

/**
 * BlockNote schema = all default native blocks (paragraph, heading, lists, quote,
 * code, table, image, video, audio, file, toggle) + Tepup's two custom blocks:
 * `tepup-widget` (opaque widget carrier) and `step-break` (reveal-group boundary).
 */
export const tepupSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    // createReactBlockSpec returns a factory in BlockNote 0.51 — call it for the spec.
    'tepup-widget': TepupWidgetBlock(),
    'step-break': StepBreakBlock(),
  },
});
