'use client';

/**
 * Bộ đếm ký tự cho các ô nhập có ngưỡng độ dài.
 *
 * Cố ý không dùng `maxLength` trên input: dán một đoạn dài sẽ bị cắt giữa chữ mà
 * không báo gì, và với tiếng Việt có dấu thì tác giả rất dễ không nhận ra. Ở đây
 * chỉ hiển thị để người viết tự thấy mình đang vượt — nút Lưu vẫn bấm được.
 *
 * `id` (tuỳ chọn) để ô nhập trỏ tới bằng aria-describedby. Trạng thái vượt ngưỡng
 * không chỉ báo bằng màu: có thêm chữ "vượt giới hạn".
 */
export default function CharCount({ value, limit, id }: { value: string; limit: number; id?: string }) {
  const over = value.length > limit;
  return (
    <span id={id} className={`text-xs tabular-nums ${over ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
      {value.length}/{limit}
      <span className="sr-only"> ký tự</span>
      {over && (
        <span>
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          vượt giới hạn
        </span>
      )}
    </span>
  );
}
