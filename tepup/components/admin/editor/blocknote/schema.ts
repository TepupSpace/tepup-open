import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { TepupWidgetBlock } from './TepupWidgetBlock';
import { StepBreakBlock } from './StepBreakBlock';

/**
 * Adds Tepup's own props to a native BlockNote block. The editor builds each block's
 * ProseMirror attributes from `config.propSchema` when the schema is created, so the
 * native rendering and toolbars keep working and only gain the extra props.
 */
function withProps<
  S extends { config: { propSchema: object } },
  P extends Record<string, { default: string | boolean }>,
>(spec: S, props: P) {
  return {
    ...spec,
    config: { ...spec.config, propSchema: { ...spec.config.propSchema, ...props } },
  } as S & { config: S['config'] & { propSchema: S['config']['propSchema'] & P } };
}

// Accessibility fields, edited from the "Trợ năng" toolbar button (MediaAccessibilityButton).
const IMAGE_A11Y_PROPS = {
  /** Mô tả ảnh. BlockNote's `name` is the uploaded file name and is never used as alt. */
  alt: { default: '' as const },
  /** Ảnh trang trí: lưu `alt: ""` có chủ ý. */
  decorative: { default: false },
};
const MEDIA_A11Y_PROPS = {
  /** URL phụ đề WebVTT. */
  captionsUrl: { default: '' as const },
  /** Bản ghi lời. */
  transcript: { default: '' as const },
};

/**
 * BlockNote schema = all default native blocks (paragraph, heading, lists, quote,
 * code, table, image, video, audio, file, toggle) + Tepup's two custom blocks:
 * `tepup-widget` (opaque widget carrier) and `step-break` (reveal-group boundary).
 * Image, video and audio carry extra accessibility props (see above).
 */
export const tepupSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    image: withProps(defaultBlockSpecs.image, IMAGE_A11Y_PROPS),
    video: withProps(defaultBlockSpecs.video, MEDIA_A11Y_PROPS),
    audio: withProps(defaultBlockSpecs.audio, MEDIA_A11Y_PROPS),
    // createReactBlockSpec returns a factory in BlockNote 0.51 — call it for the spec.
    'tepup-widget': TepupWidgetBlock(),
    'step-break': StepBreakBlock(),
  },
});
