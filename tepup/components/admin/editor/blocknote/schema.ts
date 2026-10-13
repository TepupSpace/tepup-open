import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { TepupWidgetBlock } from './TepupWidgetBlock';
import { StepBreakBlock } from './StepBreakBlock';

/**
 * Adds Tepup's own props to a native BlockNote block. The editor builds each block's
 * ProseMirror attributes from `config.propSchema` when the schema is created, so the
 * native rendering and toolbars keep working and only gain the extra props.
 *
 * The native `render` / `toExternalHTML` keep their ORIGINAL propSchema (closed over when
 * BlockNote created the spec) and look every prop of the block up in it. A prop they
 * don't know throws "Cannot read properties of undefined (reading 'default')" and takes
 * the whole editor down. So they are called without the extra props, and those are then
 * written onto the block's element the way BlockNote writes its own (data-* attribute,
 * only when not the default).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function withProps<
  S extends { config: { propSchema: object }; implementation: object },
  P extends Record<string, { default: string | boolean }>,
>(spec: S, props: P) {
  const impl = spec.implementation as Record<string, any>;
  const extraKeys = Object.keys(props);
  const dataAttr = (key: string) => 'data-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  const wrap = (fn: ((...args: any[]) => any) | undefined) =>
    fn &&
    function (this: unknown, block: any, ...rest: any[]) {
      const nativeProps = { ...block.props };
      for (const key of extraKeys) delete nativeProps[key];
      const out = fn.call(this, { ...block, props: nativeProps }, ...rest);
      const dom = out?.dom;
      if (dom && typeof dom.setAttribute === 'function') {
        for (const key of extraKeys) {
          const value = block.props?.[key];
          if (value !== undefined && value !== props[key].default) dom.setAttribute(dataAttr(key), String(value));
        }
      }
      return out;
    };

  return {
    ...spec,
    config: { ...spec.config, propSchema: { ...spec.config.propSchema, ...props } },
    implementation: { ...impl, render: wrap(impl.render), toExternalHTML: wrap(impl.toExternalHTML) },
  } as S & { config: S['config'] & { propSchema: S['config']['propSchema'] & P } };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
