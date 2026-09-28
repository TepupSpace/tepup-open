'use client';

/**
 * Bộ đếm ký tự cho các ô nhập có ngưỡng độ dài.
 *
 * Cố ý không dùng `maxLength` trên input: dán một đoạn dài sẽ bị cắt giữa chữ mà
 * không báo gì, và với tiếng Việt có dấu thì tác giả rất dễ không nhận ra. Ở đây
 * chỉ hiển thị để người viết tự thấy mình đang vượt — nút Lưu vẫn bấm được.
 */
export default function CharCount({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return (
    <span className={`text-xs tabular-nums ${over ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
      {value.length}/{limit}
    </span>
  );
}
