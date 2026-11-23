import { z } from 'zod';

/**
 * Hợp đồng duy nhất giữa trình duyệt và POST /api/events. Danh sách ĐÓNG: mọi key
 * không khai báo ở đây đều bị từ chối (strictObject), nên không ai "tiện tay" gửi
 * thêm IP, user id hay nội dung người học gõ được.
 *
 * ⚠️ Thêm event thuộc một DẠNG dữ liệu mới → cập nhật trang công khai /du-lieu
 * (app/(marketing)/du-lieu/page.tsx) trong cùng commit. Xem CLAUDE.md › Analytics.
 */

const id = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const slug = z.string().regex(/^[a-z0-9-]{1,120}$/);
const short = (max: number) => z.string().min(1).max(max);
const uuid = z.string().uuid();

export const ROUTE_TYPES = [
  'landing', 'courses', 'course', 'lesson', 'story', 'chapter', 'library', 'entry', 'other',
] as const;
export const routeType = z.enum(ROUTE_TYPES);
export type RouteType = z.infer<typeof routeType>;

const contentType = z.enum(['lesson', 'chapter']);
const blockIndex = z.number().int().min(0).max(999);
const blockType = z.string().regex(/^[a-z0-9-]{1,40}$/);
const content = { contentType, contentId: id };

export const FIRST_SEEN_BUCKETS = ['0', '1-7', '8-30', '30+'] as const;
export const LESSONS_DONE_BUCKETS = ['0', '1-2', '3-5', '6+'] as const;

export const analyticsEvent = z.discriminatedUnion('name', [
  z.strictObject({ name: z.literal('page_view'), t: z.number().int().min(0), routeType, slug: slug.optional() }),
  z.strictObject({ name: z.literal('content_start'), t: z.number().int().min(0), ...content }),
  z.strictObject({ name: z.literal('content_complete'), t: z.number().int().min(0), ...content }),
  z.strictObject({
    name: z.literal('content_exit'), t: z.number().int().min(0), ...content,
    blockIndex, totalBlocks: z.number().int().min(0).max(999),
  }),
  z.strictObject({ name: z.literal('block_view'), t: z.number().int().min(0), ...content, blockIndex, blockType }),
  z.strictObject({ name: z.literal('block_complete'), t: z.number().int().min(0), ...content, blockIndex, blockType }),
  z.strictObject({
    name: z.literal('question_answer'), t: z.number().int().min(0), ...content, blockIndex, correct: z.boolean(),
  }),
  z.strictObject({ name: z.literal('ref_open'), t: z.number().int().min(0), slug, mode: z.enum(['preview', 'panel']) }),
  z.strictObject({ name: z.literal('chat_send'), t: z.number().int().min(0) }),
  z.strictObject({
    name: z.literal('setting_change'), t: z.number().int().min(0),
    setting: z.enum(['theme', 'font', 'size', 'tracking']), value: z.string().regex(/^[a-z0-9-]{1,16}$/),
  }),
  z.strictObject({
    name: z.literal('error'), t: z.number().int().min(0),
    source: z.enum(['boundary', 'global', 'window', 'rejection']),
    routeType,
    errorName: short(60),
    message: z.string().max(200),
    digest: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/).optional(),
  }),
]);
export type AnalyticsEventInput = z.infer<typeof analyticsEvent>;
export type AnalyticsEventName = AnalyticsEventInput['name'];

/** Gửi kèm mỗi lô khi tracking đang bật. Không có thì lô chỉ được chứa event `error`. */
export const analyticsContext = z.strictObject({
  anonId: uuid,
  sessionId: uuid,
  /** ms epoch lúc bắt đầu phiên; server làm tròn xuống đầu giờ trước khi lưu */
  sessionStart: z.number().int().positive(),
  firstSeen: z.enum(FIRST_SEEN_BUCKETS),
  lessonsDone: z.enum(LESSONS_DONE_BUCKETS),
});
export type AnalyticsContext = z.infer<typeof analyticsContext>;

/** Bộ đếm tổng: không mã, không thời điểm (server tự gắn ngày cho số hoàn thành). */
export const analyticsTally = z.discriminatedUnion('metric', [
  z.strictObject({ metric: z.literal('content_start'), contentType, contentId: id }),
  z.strictObject({ metric: z.literal('content_complete'), contentType, contentId: id }),
  z.strictObject({ metric: z.literal('course_complete'), courseId: id }),
  /** Trình duyệt lần đầu ghé Tepup (gửi một lần): đếm người mới và cộng dồn, không cần mã. */
  z.strictObject({ metric: z.literal('new_browser') }),
  z.strictObject({
    metric: z.literal('quiz_option'), contentId: id,
    /** block.id nếu có, nếu không thì `i<index>` */
    blockKey: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    optionId: id,
  }),
]);
export type AnalyticsTallyInput = z.infer<typeof analyticsTally>;

export const analyticsBatch = z.strictObject({
  v: z.literal(1),
  ctx: analyticsContext.optional(),
  events: z.array(analyticsEvent).max(50).default([]),
  tallies: z.array(analyticsTally).max(50).default([]),
});
export type AnalyticsBatch = z.infer<typeof analyticsBatch>;

/** Giới hạn kích thước body ở server, trước khi parse JSON. */
export const MAX_BATCH_BYTES = 32 * 1024;
